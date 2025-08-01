import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { supabase } from "../../supabase/supabase";
import { useAuth } from "../../supabase/auth";
import { cacheService, createCacheKey, debounce } from "../lib/cacheService";
import { withRetry, SUPABASE_RETRY_OPTIONS } from "../lib/retryUtils";

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const useCollections = (options?: {
  limit?: number;
  fields?: string;
  enableRealtime?: boolean;
}) => {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Referencia para controlar si el componente está montado
  const isMounted = useRef(true);
  
  // ID único para este hook
  const hookId = useRef(`collections-${Math.random().toString(36).substring(2, 9)}`);
  
  // Memoize options to prevent unnecessary re-renders
  const memoizedOptions = useMemo(() => ({
    limit: options?.limit || 50,
    fields: options?.fields || "id, name, description, is_default, created_at, updated_at, user_id",
    enableRealtime: options?.enableRealtime ?? true,
  }), [options?.limit, options?.fields, options?.enableRealtime]);
  
  // Memoize user ID to prevent unnecessary re-renders
  const userId = useMemo(() => user?.id, [user?.id]);

  // Función para obtener las colecciones con caché y optimizaciones
  const fetchCollections = useCallback(async (forceRefresh = false) => {
    if (!userId) {
      if (isMounted.current) {
        setCollections([]);
        setIsLoading(false);
      }
      return [];
    }

    const cacheKey = createCacheKey("user", userId, "collections", JSON.stringify(memoizedOptions));
    
    // Verificar si hay datos en caché y no es una actualización forzada
    if (!forceRefresh && cacheService.has(cacheKey)) {
      const cachedData = cacheService.get<Collection[]>(cacheKey);
      if (cachedData && isMounted.current) {

        setCollections(cachedData);
        setIsLoading(false);
        setError(null);
        return cachedData;
      }
    }

    try {

      setIsLoading(true);
      
      // Build optimized query with field selection and limits
      let query = supabase
        .from("collections")
        .select(memoizedOptions.fields)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      // Apply limit if specified
      if (memoizedOptions.limit > 0) {
        query = query.limit(memoizedOptions.limit);
      }

      const { data, error } = await withRetry(
        async () => {
          const result = await query;
          if (result.error) {
            throw result.error;
          }
          return result;
        },
        SUPABASE_RETRY_OPTIONS
      );

      if (error) {
        console.error(`[${hookId.current}] Error fetching collections:`, error);
        if (isMounted.current) {
          setError(new Error(error.message));
          setIsLoading(false);
        }
        return [];
      }

      // Guardar en caché con TTL
      const collectionsData = (data || []) as unknown as Collection[];
      cacheService.set(cacheKey, collectionsData, 300000); // 5 minutes TTL
      
      if (isMounted.current) {
        setCollections(collectionsData);
        setIsLoading(false);
        setError(null);
      }
      
      return collectionsData;
    } catch (err) {
      console.error(`[${hookId.current}] Unexpected error fetching collections:`, err);
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      }
      return [];
    }
  }, [userId, memoizedOptions]);

  // Versión con debounce para refrescar las colecciones
  const debouncedRefetch = useRef(
    debounce(() => {
      if (isMounted.current) {
        fetchCollections(true);
      }
    }, 500)
  ).current;

  // Función pública para refrescar las colecciones
  const refetchCollections = useCallback(() => {
    debouncedRefetch();
    return collections;
  }, [collections, debouncedRefetch]);

  // Efecto para cargar las colecciones iniciales y configurar la suscripción en tiempo real
  useEffect(() => {
    isMounted.current = true;
    
    // Cargar las colecciones iniciales
    fetchCollections();
    
    if (!userId || !memoizedOptions.enableRealtime) {
      return () => { isMounted.current = false; };
    }
    
    // Configurar suscripción en tiempo real solo si está habilitada
    const channelId = `collections-changes-${userId}-${hookId.current}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "collections",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {

          
          // Invalidar la caché con el patrón correcto
          const cachePattern = createCacheKey("user", userId, "collections");
          cacheService.invalidatePattern(cachePattern);
          
          // Refrescar los datos
          debouncedRefetch();
        }
      )
      .subscribe();
    
    // Limpiar al desmontar
    return () => {

      isMounted.current = false;
      supabase.removeChannel(channel);
    };
  }, [userId, fetchCollections, debouncedRefetch, memoizedOptions.enableRealtime]);

  return {
    collections,
    isLoading,
    error,
    refetchCollections,
    fetchCollections,
  };
};
