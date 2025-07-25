import { supabase } from "../../supabase/supabase";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../supabase/auth";
import { cacheService, createCacheKey, debounce } from "../utils/cacheService";
import { withRetry, SUPABASE_RETRY_OPTIONS } from "../utils/retryUtils";
import { useConnectionStatus } from "../components/shared/ConnectionStatus";

export interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  has_seen_onboarding: boolean;
  preferred_lang: string;
  created_at: string;
  updated_at: string;
}

export const useUserData = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const connectionStatus = useConnectionStatus();

  // Referencia para controlar si el componente está montado
  const isMounted = useRef(true);

  // ID único para este hook
  const hookId = useRef(
    `user-data-${Math.random().toString(36).substring(2, 9)}`
  );

  // Función para obtener los datos del usuario con caché
  const fetchUserData = useCallback(
    async (forceRefresh = false) => {
      if (!user?.id) {
        if (isMounted.current) {
          setUserData(null);
          setIsLoading(false);
        }
        return null;
      }

      const cacheKey = createCacheKey("user", user.id, "data");

      // Verificar si hay datos en caché y no es una actualización forzada
      if (!forceRefresh && cacheService.has(cacheKey)) {
        const cachedData = cacheService.get<UserData>(cacheKey);
        if (cachedData && isMounted.current) {
          console.log(`[${hookId.current}] Using cached user data`);
          setUserData(cachedData);
          setIsLoading(false);
          setError(null);
          return cachedData;
        }
      }

      try {
        console.log(`[${hookId.current}] Fetching user data for: ${user.id}`);
        setIsLoading(true);
        connectionStatus.startConnecting();

        const { data, error } = await withRetry(
          async () => {
            const result = await supabase
              .from("users")
              .select("*")
              .eq("id", user.id)
              .single();
            
            if (result.error) {
              throw result.error;
            }
            return result;
          },
          {
            ...SUPABASE_RETRY_OPTIONS,
            onRetry: (attempt, error) => {
              console.log(`🔄 User data retry attempt ${attempt}:`, error);
              connectionStatus.startRetrying(attempt);
            }
          }
        );

        if (error) {
          // Si el error es que no se encontró el usuario, intentamos crearlo
          if (error.code === "PGRST116") {
            console.log(
              `[${hookId.current}] User not found, creating new user record`
            );

            const newUser = {
              id: user.id,
              email: user.email || "",
              full_name: user.user_metadata?.full_name || "Usuario",
              has_seen_onboarding: false,
              preferred_lang: user.user_metadata?.preferred_lang || "es",
            };

            const { data: insertData, error: insertError } = await withRetry(
              async () => {
                const result = await supabase
                  .from("users")
                  .insert([newUser])
                  .select()
                  .single();
                
                if (result.error) {
                  throw result.error;
                }
                return result;
              },
              SUPABASE_RETRY_OPTIONS
            );

            if (insertError) {
              console.error(
                `[${hookId.current}] Error creating user:`,
                insertError
              );
              if (isMounted.current) {
                const errorObj = new Error(insertError.message);
                setError(errorObj);
                setIsLoading(false);
                connectionStatus.setConnectionError(errorObj);
              }
              return null;
            }

            // Guardar en caché
            cacheService.set(cacheKey, insertData);

            if (isMounted.current) {
              setUserData(insertData);
              setIsLoading(false);
              setError(null);
              connectionStatus.clearStatus();
            }

            return insertData;
          }

          console.error(`[${hookId.current}] Error fetching user data:`, error);
          if (isMounted.current) {
            const errorObj = new Error(error.message);
            setError(errorObj);
            setIsLoading(false);
            connectionStatus.setConnectionError(errorObj);
          }
          return null;
        }

        // Guardar en caché
        cacheService.set(cacheKey, data);

        if (isMounted.current) {
          setUserData(data);
          setIsLoading(false);
          setError(null);
          connectionStatus.clearStatus();
        }

        return data;
      } catch (err) {
        console.error(
          `[${hookId.current}] Unexpected error fetching user data:`,
          err
        );
        if (isMounted.current) {
          const errorObj = err instanceof Error ? err : new Error(String(err));
          setError(errorObj);
          setIsLoading(false);
          connectionStatus.setConnectionError(errorObj);
        }
        return null;
      }
    },
    [user?.id, user?.email, user?.user_metadata]
  );

  // Versión con debounce para refrescar los datos del usuario
  const debouncedRefetch = useRef(
    debounce(() => {
      if (isMounted.current) {
        fetchUserData(true);
      }
    }, 500)
  ).current;

  // Función para actualizar los datos del usuario
  const updateUserData = useCallback(
    async (updates: Partial<UserData>) => {
      if (!user?.id || !userData) {
        return { success: false, error: new Error("No user data available") };
      }

      try {
        const { data, error } = await withRetry(
          async () => {
            const result = await supabase
              .from("users")
              .update(updates)
              .eq("id", user.id)
              .select()
              .single();
            
            if (result.error) {
              throw result.error;
            }
            return result;
          },
          SUPABASE_RETRY_OPTIONS
        );

        if (error) {
          console.error(`[${hookId.current}] Error updating user data:`, error);
          return { success: false, error: new Error(error.message) };
        }

        // Invalidar la caché
        const cacheKey = createCacheKey("user", user.id, "data");
        cacheService.invalidate(cacheKey);

        // Actualizar el estado
        if (isMounted.current) {
          setUserData(data);
        }

        return { success: true, data };
      } catch (err) {
        console.error(
          `[${hookId.current}] Unexpected error updating user data:`,
          err
        );
        return {
          success: false,
          error: err instanceof Error ? err : new Error(String(err)),
        };
      }
    },
    [user?.id, userData]
  );

  // Función pública para refrescar los datos del usuario
  const refetchUserData = useCallback(() => {
    debouncedRefetch();
    return userData;
  }, [userData, debouncedRefetch]);

  // Efecto para cargar los datos iniciales y configurar la suscripción en tiempo real
  useEffect(() => {
    isMounted.current = true;

    // Cargar los datos iniciales
    fetchUserData();

    if (!user?.id)
      return () => {
        isMounted.current = false;
      };

    // Configurar suscripción en tiempo real
    const channelId = `user-data-changes-${user.id}-${hookId.current}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "users",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log(
            `[${hookId.current}] Real-time user data change detected:`,
            {
              eventType: payload.eventType,
              table: payload.table,
            }
          );

          // Invalidar la caché
          const cacheKey = createCacheKey("user", user.id, "data");
          cacheService.invalidate(cacheKey);

          // Refrescar los datos
          debouncedRefetch();
        }
      )
      .subscribe((status) => {
        console.log(
          `[${hookId.current}] Real-time user data status: ${status}`
        );
      });

    // Limpiar al desmontar
    return () => {
      console.log(`[${hookId.current}] Cleaning up user data hook`);
      isMounted.current = false;
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchUserData, debouncedRefetch]);

  return {
    userData,
    isLoading,
    error,
    updateUserData,
    refetchUserData,
    fetchUserData,
    connectionStatus,
  };
};
