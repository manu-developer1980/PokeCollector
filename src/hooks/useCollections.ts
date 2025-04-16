import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../supabase/supabase";
import { useAuth } from "../supabase/auth";
import { cacheService, createCacheKey, debounce } from "../utils/cacheService";

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const useCollections = () => {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Referencia para controlar si el componente está montado
  const isMounted = useRef(true);
  
  // ID único para este hook
  const hookId = useRef(`collections-${Math.random().toString(36).substring(2, 9)}`);

  // Función para obtener las colecciones con caché
  const fetchCollections = useCallback(async (forceRefresh = false) => {
    if (!user?.id) {
      if (isMounted.current) {
        setCollections([]);
        setIsLoading(false);
      }
      return [];
    }

    const cacheKey = createCacheKey("user", user.id, "collections");
    
    // Verificar si hay datos en caché y no es una actualización forzada
    if (!forceRefresh && cacheService.has(cacheKey)) {
      const cachedData = cacheService.get<Collection[]>(cacheKey);
      if (cachedData && isMounted.current) {
        console.log(`[${hookId.current}] Using cached collections data`);
        setCollections(cachedData);
        setIsLoading(false);
        setError(null);
        return cachedData;
      }
    }

    try {
      console.log(`[${hookId.current}] Fetching collections for user: ${user.id}`);
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(`[${hookId.current}] Error fetching collections:`, error);
        if (isMounted.current) {
          setError(new Error(error.message));
          setIsLoading(false);
        }
        return [];
      }

      // Guardar en caché
      cacheService.set(cacheKey, data || []);
      
      if (isMounted.current) {
        setCollections(data || []);
        setIsLoading(false);
        setError(null);
      }
      
      return data || [];
    } catch (err) {
      console.error(`[${hookId.current}] Unexpected error fetching collections:`, err);
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      }
      return [];
    }
  }, [user?.id]);

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
    
    if (!user?.id) return () => { isMounted.current = false; };
    
    // Configurar suscripción en tiempo real
    const channelId = `collections-changes-${user.id}-${hookId.current}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "collections",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log(`[${hookId.current}] Real-time collections change detected:`, {
            eventType: payload.eventType,
            table: payload.table,
          });
          
          // Invalidar la caché
          const cacheKey = createCacheKey("user", user.id, "collections");
          cacheService.invalidate(cacheKey);
          
          // Refrescar los datos
          debouncedRefetch();
        }
      )
      .subscribe((status) => {
        console.log(`[${hookId.current}] Real-time collections status: ${status}`);
      });
    
    // Limpiar al desmontar
    return () => {
      console.log(`[${hookId.current}] Cleaning up collections hook`);
      isMounted.current = false;
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchCollections, debouncedRefetch]);

  return {
    collections,
    isLoading,
    error,
    refetchCollections,
    fetchCollections,
  };
};
