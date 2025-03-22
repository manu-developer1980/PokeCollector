import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabase/supabase";
import { useAuth } from "../../supabase/auth";

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === "406") {
          // No subscription found, this is okay
          return null;
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error fetching subscription:", error);
      return null;
    }
  }, [user?.id]);

  useEffect(() => {
    let mounted = true;

    const loadSubscription = async () => {
      setIsLoading(true);
      const data = await fetchSubscription();
      if (mounted) {
        setSubscription(data);
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadSubscription();
    } else {
      setSubscription(null);
      setIsLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [user?.id, fetchSubscription]);

  return { subscription, isLoading, refetch: fetchSubscription };
};
