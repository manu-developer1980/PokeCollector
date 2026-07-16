import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../../supabase/supabase";
import { useAuth } from "../../supabase/auth";
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
  // No existe como columna en la tabla actual; algunos componentes lo
  // consultan de forma defensiva, por eso es opcional.
  ended_at?: string | null;
}

// Caché por usuario compartida entre todas las instancias del hook, para que
// varios componentes no disparen la misma consulta a la vez.
const cache = new Map<string, { data: Subscription | null; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minuto: el realtime invalida antes si hay cambios
const inFlight = new Map<string, Promise<Subscription | null>>();

async function fetchSubscriptionForUser(
  userId: string
): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw new Error(error.message);

  const subscription = (data?.[0] as unknown as Subscription) ?? null;
  cache.set(userId, { data: subscription, timestamp: Date.now() });
  return subscription;
}

/** Deduplica peticiones concurrentes del mismo usuario. */
function fetchDeduped(userId: string): Promise<Subscription | null> {
  const existing = inFlight.get(userId);
  if (existing) return existing;

  const promise = fetchSubscriptionForUser(userId).finally(() =>
    inFlight.delete(userId)
  );
  inFlight.set(userId, promise);
  return promise;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [subscription, setSubscription] = useState<Subscription | null>(
    () => (userId && cache.get(userId)?.data) || null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  const load = useCallback(
    async (forceRefresh = false) => {
      if (!userId) {
        setSubscription(null);
        setIsLoading(false);
        setFetchError(null);
        return null;
      }

      const cached = cache.get(userId);
      if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL) {
        if (isMounted.current) {
          setSubscription(cached.data);
          setIsLoading(false);
          setFetchError(null);
        }
        return cached.data;
      }

      try {
        const data = await fetchDeduped(userId);
        if (isMounted.current) {
          setSubscription(data);
          setFetchError(null);
        }
        return data;
      } catch (err) {
        if (isMounted.current) {
          setFetchError(err instanceof Error ? err : new Error(String(err)));
        }
        return null;
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    },
    [userId]
  );

  const refetchSubscription = useCallback(() => load(true), [load]);

  useEffect(() => {
    isMounted.current = true;
    load();

    if (!userId) {
      return () => {
        isMounted.current = false;
      };
    }

    // Realtime: cualquier cambio en la fila del usuario refresca la caché.
    const componentId = `subscription-${Math.random().toString(36).slice(2, 9)}`;
    const cleanup = websocketManager.createSubscription(
      `subscription-changes-${userId}-${componentId}`,
      componentId,
      {
        table: "subscriptions",
        filter: `user_id=eq.${userId}`,
        event: "*",
        schema: "public",
      },
      () => {
        cache.delete(userId);
        load(true);
      },
      {
        delay: 300,
        onError: (error) => {
          console.warn(
            "WebSocket connection error in useSubscription:",
            error.message
          );
        },
      }
    );

    return () => {
      isMounted.current = false;
      cleanup();
    };
  }, [userId, load]);

  return {
    subscription,
    isLoading,
    error: fetchError,
    refetchSubscription,
  };
};
