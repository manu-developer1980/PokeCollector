import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabase/supabase";
import { useAuth } from "../../supabase/auth";

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Debug del estado de autenticación
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("[useSubscription] Auth state:", {
        user: user?.id,
        sessionUserId: session?.user?.id,
        accessToken: session?.access_token?.substring(0, 20) + "...",
        isAuthenticated: !!user && !!session,
      });
    };

    getSession();
  }, [user]);

  const fetchSubscription = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!user?.id || !session) {
      console.log("[useSubscription] No authenticated user:", {
        userId: user?.id,
        hasSession: !!session,
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("[useSubscription] Error fetching subscription:", error);
      return null;
    }
  }, [user?.id]);

  useEffect(() => {
    let isMounted = true;

    const loadSubscription = async () => {
      setIsLoading(true);
      const data = await fetchSubscription();
      if (isMounted) {
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
      isMounted = false;
    };
  }, [user?.id, fetchSubscription]);

  return { subscription, isLoading };
};
