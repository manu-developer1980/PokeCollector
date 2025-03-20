import { useState, useEffect } from "react";
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

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            // No data found
            setSubscription(null); // Usuario sin suscripción
          } else {
            throw error;
          }
        } else {
          setSubscription(data);
        }
      } catch (err) {
        console.error("Error fetching subscription:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  return { subscription, loading, error };
}
