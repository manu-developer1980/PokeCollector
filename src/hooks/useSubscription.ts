import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../supabase/auth";
import { supabase } from "../../supabase/supabase";

export interface Subscription {
  id?: string;
  user_id: string;
  status:
    | "active"
    | "canceled"
    | "incomplete"
    | "incomplete_expired"
    | "past_due"
    | "trialing"
    | "unpaid";
  plan_type: string;
  current_period_end?: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  price_id?: string;
  is_active?: boolean;
  cancel_at_period_end?: boolean;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const CACHE_TIME = 5000; // 5 segundos de caché

// Cache global para compartir entre instancias
let subscriptionCache: {
  data: Subscription | null;
  timestamp: number;
} | null = null;

// Control de solicitudes en curso
let pendingPromise: Promise<Subscription | null> | null = null;

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const fetchSubscription = async (): Promise<Subscription | null> => {
    if (pendingPromise) {
      return pendingPromise;
    }

    if (
      subscriptionCache &&
      Date.now() - subscriptionCache.timestamp < CACHE_TIME
    ) {
      return subscriptionCache.data;
    }

    pendingPromise = (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token || !user?.id) {
          return null;
        }

        // Get all subscriptions for the user
        const { data, error } = await supabase
          .from("subscriptions")
          .select()
          .match({ user_id: user.id })
          .abortSignal(AbortSignal.timeout(5000));

        if (error) {
          throw error;
        }

        // Get the most recent subscription
        const latestSubscription =
          Array.isArray(data) && data.length > 0 ? data[0] : null;

        subscriptionCache = {
          data: latestSubscription,
          timestamp: Date.now(),
        };

        return latestSubscription;
      } catch (error) {
        console.error("Error fetching subscription:", error);
        throw error;
      } finally {
        pendingPromise = null;
      }
    })();

    return pendingPromise;
  };

  const updateSubscriptionData = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      const data = await fetchSubscription();
      if (mountedRef.current) {
        setSubscription(data);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setSubscription(null);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    updateSubscriptionData();

    if (user) {
      const channel = supabase
        .channel("subscription_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "subscriptions",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            // Invalidar caché cuando hay cambios
            subscriptionCache = null;
            updateSubscriptionData();
          }
        )
        .subscribe();

      return () => {
        mountedRef.current = false;
        channel.unsubscribe();
      };
    }

    return () => {
      mountedRef.current = false;
    };
  }, [user]);

  return { subscription, loading, error };
}
