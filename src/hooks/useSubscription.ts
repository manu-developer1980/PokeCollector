import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { supabase } from "../../supabase/supabase";
import { useAuth } from "../../supabase/auth";
import { cacheService, createCacheKey } from "../lib/cacheService";
import { websocketManager } from "../lib/websocketManager";

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  stripe_price_id: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  is_active: boolean;
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



      try {
        // Primero obtenemos todas las suscripciones del usuario
        const { data, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("⚠️ Error fetching subscription:", error);

          if (isMounted.current) {
            setFetchError(
              new Error(error.message || "Error fetching subscription")
            );
          }

          if (retryAttempt < maxRetries) {
            const backoffTime = getBackoffTime(retryAttempt);
            await sleep(backoffTime);
            return fetchSubscription(
              retryAttempt + 1,
              maxRetries,
              forceRefresh
            );
          }

          return null;
        }

        if (isMounted.current) {
          setFetchError(null);
        }

        if (data && data.length > 0) {
          const subscriptionData = data[0] as unknown as Subscription;

          subscriptionCache[cacheKey] = {
            data: subscriptionData,
            timestamp: Date.now(),
          };

          if (isMounted.current) {
            setSubscription(subscriptionData);
          }

          return subscriptionData;
        }

        subscriptionCache[cacheKey] = {
          data: null,
          timestamp: Date.now(),
        };

        return null;
      } catch (err) {
        console.error("❌ Unexpected error fetching subscription:", err);

        if (isMounted.current) {
          setFetchError(err instanceof Error ? err : new Error(String(err)));
        }

        if (retryAttempt < maxRetries) {
          const backoffTime = getBackoffTime(retryAttempt);
          await sleep(backoffTime);
          return fetchSubscription(retryAttempt + 1, maxRetries, forceRefresh);
        }

        return null;
      } finally {
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

      setIsLoading(true);
      setFetchError(null);

      try {
        const data = await fetchSubscription(0, 5, true);

        if (data && isMounted.current) {
          setSubscription(data);
        }

        return data;
      } catch (err) {
        console.error("❌ Error in debounced refetchSubscription:", err);
        if (isMounted.current) {
          setFetchError(err instanceof Error ? err : new Error(String(err)));
        }
        return null;
      } finally {
        if (isMounted.current) {
          setTimeout(() => {
            setIsLoading(false);
          }, 500);
        }
      }
    }, 500)
  ).current;

  // Función pública para refrescar la suscripción
  const refetchSubscription = useCallback(async () => {
    const freshData = await fetchSubscription(0, 5, true);
    debouncedRefetch();
    return freshData;
  }, [fetchSubscription, debouncedRefetch]);

  useEffect(() => {
    // Marcar el componente como montado
    isMounted.current = true;

    // Obtener la suscripción inicial solo si no se ha hecho antes
    if (!initialFetchDone.current && userId) {
      const initialFetchTimeout = setTimeout(() => {
        const cachedData = subscriptionCache[userId];
        if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
          if (isMounted.current) {
            setSubscription(cachedData.data);
            setIsLoading(false);
          }
        } else {
          fetchSubscription();
        }
        initialFetchDone.current = true;
      }, 100);

      return () => {
        clearTimeout(initialFetchTimeout);
        isMounted.current = false;
      };
    }

    if (!userId) {
      return () => {
        isMounted.current = false;
      };
    }

    // Configurar suscripción en tiempo real usando el websocketManager
    const channelId = `subscription-changes-${userId}-${hookId.current}`;
    const componentId = hookId.current;
    
    const cleanup = websocketManager.createSubscription(
      channelId,
      componentId,
      {
        table: "subscriptions",
        filter: `user_id=eq.${userId}`,
        event: "*",
        schema: "public",
      },
      (payload) => {
        // Solo procesar si el componente sigue montado
        if (!isMounted.current) return;
        
        // Invalidar la caché
        const cacheKey = createCacheKey("subscription", userId);
        cacheService.invalidate(cacheKey);
        
        if (payload.old && payload.new) {
          if (subscriptionCache[userId]) {
            delete subscriptionCache[userId];
          }
        }

        debouncedRefetch();
      },
      {
        delay: 300,
        onError: (error) => {
          console.warn('WebSocket connection error in useSubscription:', error.message);
        }
      }
    );

    return () => {
      isMounted.current = false;
      cleanup();
    };
  }, [userId, fetchSubscription, debouncedRefetch]);

  return {
    subscription,
    isLoading,
    error: fetchError,
    refetchSubscription,
  };
};
