import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { supabase } from "../../supabase/supabase";
import { useAuth } from "../../supabase/auth";

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  plan_type: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

// Función de utilidad para esperar un tiempo determinado
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Función para calcular el tiempo de espera con retroceso exponencial
const getBackoffTime = (
  attempt: number,
  baseDelay = 1000,
  maxDelay = 10000
) => {
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  // Añadir un poco de aleatoriedad para evitar que todas las solicitudes se realicen al mismo tiempo
  return delay + Math.random() * 1000;
};

// Caché global para almacenar las suscripciones por usuario
const subscriptionCache: Record<
  string,
  { data: Subscription | null; timestamp: number }
> = {};

// Tiempo de validez de la caché en milisegundos (5 minutos)
const CACHE_TTL = 5 * 60 * 1000;

// Función para implementar debounce
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<Error | null>(null);

  // Referencia para controlar si el componente está montado
  const isMounted = useRef(true);

  // Referencia para controlar si ya se ha realizado una petición inicial
  const initialFetchDone = useRef(false);

  // Referencia para almacenar la última petición realizada
  const lastFetchTime = useRef(0);

  // ID único para este hook (para evitar colisiones en componentes múltiples)
  const hookId = useRef(
    `subscription-${Math.random().toString(36).substring(2, 9)}`
  );

  // Memorizar el ID de usuario para evitar re-renderizaciones innecesarias
  const userId = useMemo(() => user?.id || null, [user?.id]);

  const fetchSubscription = useCallback(
    async (retryAttempt = 0, maxRetries = 5, forceRefresh = false) => {
      if (!userId) {
        console.log("No user found, skipping subscription fetch");
        if (isMounted.current) {
          setIsLoading(false);
          setFetchError(null);
        }
        return null;
      }

      // Verificar si hay datos en caché y si son válidos
      const now = Date.now();
      const cacheKey = userId;
      const cachedData = subscriptionCache[cacheKey];

      // Si tenemos datos en caché, no es una actualización forzada y los datos son recientes, usamos la caché
      if (
        !forceRefresh &&
        cachedData &&
        now - cachedData.timestamp < CACHE_TTL &&
        retryAttempt === 0
      ) {
        console.log(
          `Using cached subscription data for user: ${userId} (age: ${Math.round(
            (now - cachedData.timestamp) / 1000
          )}s)`
        );

        if (isMounted.current) {
          setIsLoading(false);
          setFetchError(null);
          if (cachedData.data) {
            setSubscription(cachedData.data);
          }
        }

        return cachedData.data;
      }

      // Evitar peticiones demasiado frecuentes (mínimo 2 segundos entre peticiones)
      const timeSinceLastFetch = now - lastFetchTime.current;
      if (timeSinceLastFetch < 2000 && retryAttempt === 0 && !forceRefresh) {
        console.log(
          `Throttling subscription fetch for user: ${userId} (last fetch: ${Math.round(
            timeSinceLastFetch
          )}ms ago)`
        );

        // Si hay datos en caché, los usamos aunque sean antiguos
        if (cachedData) {
          if (isMounted.current) {
            setIsLoading(false);
          }
          return cachedData.data;
        }

        // Si no hay datos en caché, esperamos un poco y reintentamos
        await sleep(2000 - timeSinceLastFetch);
      }

      // Actualizar el tiempo de la última petición
      lastFetchTime.current = now;

      console.log(
        `[${
          hookId.current
        }] Fetching subscription for user: ${userId} (attempt ${
          retryAttempt + 1
        }/${maxRetries + 1})`
      );

      try {
        // Primero obtenemos todas las suscripciones del usuario
        const { data, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("\u26a0️ Error fetching subscription:", error);

          if (isMounted.current) {
            setFetchError(
              new Error(error.message || "Error fetching subscription")
            );
          }

          // Si aún tenemos intentos disponibles, reintentamos con retroceso exponencial
          if (retryAttempt < maxRetries) {
            const backoffTime = getBackoffTime(retryAttempt);
            console.log(
              `Retrying in ${Math.round(
                backoffTime / 1000
              )} seconds... (attempt ${retryAttempt + 1}/${maxRetries})`
            );
            await sleep(backoffTime);
            return fetchSubscription(
              retryAttempt + 1,
              maxRetries,
              forceRefresh
            );
          }

          return null;
        }

        // Limpiar el error si la solicitud fue exitosa
        if (isMounted.current) {
          setFetchError(null);
        }

        // Si hay múltiples suscripciones, tomamos la más reciente
        if (data && data.length > 0) {
          // Mantener el plan_type tal como viene de la base de datos (en minúsculas)
          // ya que es un ENUM en la base de datos
          const subscriptionData = {
            ...data[0],
            plan_type: data[0].plan_type || "aprendiz",
          };

          console.log(
            `\u2705 Found ${data.length} subscriptions, using the most recent one:`,
            {
              id: subscriptionData.id,
              plan_type: subscriptionData.plan_type,
              stripe_subscription_id:
                subscriptionData.stripe_subscription_id || "none",
              status: subscriptionData.status,
              updated_at: subscriptionData.updated_at,
            }
          );

          // Guardar en caché
          subscriptionCache[cacheKey] = {
            data: subscriptionData,
            timestamp: Date.now(),
          };

          if (isMounted.current) {
            setSubscription(subscriptionData);
          }

          return subscriptionData;
        }

        console.log("\u26a0️ No subscriptions found for user");

        // Guardar en caché que no hay suscripciones
        subscriptionCache[cacheKey] = {
          data: null,
          timestamp: Date.now(),
        };

        return null;
      } catch (err) {
        console.error("\u274c Unexpected error fetching subscription:", err);

        if (isMounted.current) {
          setFetchError(err instanceof Error ? err : new Error(String(err)));
        }

        // Si aún tenemos intentos disponibles, reintentamos con retroceso exponencial
        if (retryAttempt < maxRetries) {
          const backoffTime = getBackoffTime(retryAttempt);
          console.log(
            `Retrying in ${Math.round(
              backoffTime / 1000
            )} seconds... (attempt ${retryAttempt + 1}/${maxRetries})`
          );
          await sleep(backoffTime);
          return fetchSubscription(retryAttempt + 1, maxRetries, forceRefresh);
        }

        return null;
      } finally {
        // Solo establecemos isLoading a false si es el último intento o si tuvimos éxito
        if (retryAttempt >= maxRetries && isMounted.current) {
          setIsLoading(false);
        }
      }
    },
    [userId]
  );

  // Crear una versión con debounce de refetchSubscription
  const debouncedRefetch = useRef(
    debounce(async () => {
      if (!isMounted.current) return null;

      console.log("\ud83d\udd04 Debounced refetching subscription data...");
      setIsLoading(true);
      setFetchError(null);

      try {
        // Forzar la actualización de la caché
        const data = await fetchSubscription(0, 5, true);

        if (data && isMounted.current) {
          console.log("Subscription data found, updating state:", {
            id: data.id,
            plan_type: data.plan_type,
            status: data.status,
            stripe_subscription_id: data.stripe_subscription_id || "none",
          });
          setSubscription(data);
        } else if (isMounted.current) {
          console.log("No subscription data found after retries");
        }

        return data;
      } catch (err) {
        console.error("\u274c Error in debounced refetchSubscription:", err);
        if (isMounted.current) {
          setFetchError(err instanceof Error ? err : new Error(String(err)));
        }
        return null;
      } finally {
        // Asegurarnos de que isLoading se establece a false incluso si hay errores
        if (isMounted.current) {
          setTimeout(() => {
            setIsLoading(false);
          }, 500);
        }
      }
    }, 500) // 500ms de debounce
  ).current;

  // Función pública para refrescar la suscripción
  const refetchSubscription = useCallback(async () => {
    console.log("\ud83d\udd04 Refetching subscription data...");

    // Llamar a la versión con debounce
    debouncedRefetch();

    // Devolver la suscripción actual mientras se actualiza en segundo plano
    return subscription;
  }, [subscription]);

  useEffect(() => {
    // Marcar el componente como montado
    isMounted.current = true;

    // Obtener la suscripción inicial solo si no se ha hecho antes
    if (!initialFetchDone.current && userId) {
      console.log(
        `[${hookId.current}] Initializing subscription hook and fetching initial data for user: ${userId}`
      );

      // Usar setTimeout para evitar que la solicitud inicial se bloquee por recursos insuficientes
      const initialFetchTimeout = setTimeout(() => {
        // Verificar si hay datos en caché primero
        const cachedData = subscriptionCache[userId];
        if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
          console.log(
            `Using cached data for initial fetch (age: ${Math.round(
              (Date.now() - cachedData.timestamp) / 1000
            )}s)`
          );
          if (isMounted.current) {
            setSubscription(cachedData.data);
            setIsLoading(false);
          }
        } else {
          // Si no hay datos en caché o son antiguos, hacer una petición
          fetchSubscription();
        }
        initialFetchDone.current = true;
      }, 100);

      // Limpiar el timeout si el componente se desmonta antes de que se ejecute
      return () => {
        clearTimeout(initialFetchTimeout);
        isMounted.current = false;
      };
    }

    if (!userId) {
      console.log(
        `[${hookId.current}] No user available for real-time subscription`
      );
      return () => {
        isMounted.current = false;
      };
    }

    // Configurar una suscripción en tiempo real a cambios en la tabla de suscripciones
    // Solo si no se ha hecho antes para este usuario
    console.log(
      `[${hookId.current}] Setting up real-time subscription for user: ${userId}`
    );

    let subscriptionChannel: any = null;

    // Retrasar ligeramente la configuración del canal para evitar problemas de recursos
    const channelSetupTimeout = setTimeout(() => {
      // Crear un ID único para el canal para evitar duplicados
      const channelId = `subscription-changes-${userId}-${hookId.current}`;

      subscriptionChannel = supabase
        .channel(channelId)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "subscriptions",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log(
              `[${hookId.current}] Real-time subscription change detected:`,
              {
                eventType: payload.eventType,
                table: payload.table,
                schema: payload.schema,
                timestamp: new Date().toISOString(),
              }
            );

            // Log the old and new records for debugging
            if (payload.old && payload.new) {
              console.log("Changes detected:", {
                old_plan_type: (payload.old as any).plan_type,
                new_plan_type: (payload.new as any).plan_type,
                old_stripe_sub_id: (payload.old as any).stripe_subscription_id,
                new_stripe_sub_id: (payload.new as any).stripe_subscription_id,
              });

              // Invalidar la caché para este usuario
              if (subscriptionCache[userId]) {
                delete subscriptionCache[userId];
              }
            }

            // Usar la versión con debounce para evitar múltiples peticiones
            debouncedRefetch();
          }
        )
        .subscribe((status) => {
          console.log(
            `[${hookId.current}] Real-time subscription status: ${status}`
          );
        });
    }, 300);

    // Limpiar la suscripción cuando el componente se desmonte
    return () => {
      console.log(`[${hookId.current}] Cleaning up real-time subscription`);
      isMounted.current = false;
      clearTimeout(channelSetupTimeout);
      if (subscriptionChannel) {
        supabase.removeChannel(subscriptionChannel);
      }
    };
  }, [userId, fetchSubscription, debouncedRefetch]);

  return {
    subscription,
    isLoading,
    error: fetchError,
    refetchSubscription,
  };
};
