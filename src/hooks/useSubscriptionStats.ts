import { useState, useEffect } from "react";
import { supabase } from "../../supabase/supabase";
import { useAuth } from "../../supabase/auth";

export function useSubscriptionStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    cardsCount: 0,
    collectionsCount: 0,
    wishlistCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchStats() {
      if (!user?.id) return;

      try {
        const [collectionsResult, cardsResult, wishlistResult] =
          await Promise.all([
            // Primero obtenemos las colecciones del usuario
            supabase.from("collections").select("id").eq("user_id", user.id),
            // Obtenemos todas las cartas con sus cantidades
            supabase
              .from("collection_cards")
              .select("quantity, collection_id")
              .in(
                "collection_id",
                supabase.from("collections").select("id").eq("user_id", user.id)
              ),
            // Obtenemos el conteo de la lista de deseos
            supabase
              .from("wishlist_cards")
              .select("id", { count: "exact" })
              .eq("user_id", user.id),
          ]);

        // Calculamos el total de cartas sumando las cantidades
        const totalCards =
          cardsResult.data?.reduce((acc, card) => {
            return acc + (card.quantity || 1);
          }, 0) || 0;

        setStats({
          cardsCount: totalCards,
          collectionsCount: collectionsResult.data?.length || 0,
          wishlistCount: wishlistResult.count || 0,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError(
          err instanceof Error ? err : new Error("Error fetching stats")
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [user?.id]);

  return { stats, isLoading, error };
}
