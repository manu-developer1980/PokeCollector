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
        // Primero obtenemos las colecciones del usuario
        const { data: collections, error: collectionsError } = await supabase
          .from("collections")
          .select("id")
          .eq("user_id", user.id);

        if (collectionsError) throw collectionsError;

        // Obtenemos el conteo de la lista de deseos
        const { count: wishlistCount, error: wishlistError } = await (supabase as any)
          .from("wishlist_cards")
          .select("id", { count: "exact" })
          .eq("user_id", user.id);

        if (wishlistError) throw wishlistError;

        // Si no hay colecciones, no hay cartas
        let totalCards = 0;

        if (collections && collections.length > 0) {
          // Extraemos los IDs de las colecciones
          const collectionIds = collections.map((c) => c.id);

          // Obtenemos todas las cartas con sus cantidades
          const { data: cards, error: cardsError } = await supabase
            .from("collection_cards")
            .select("quantity")
            .in("collection_id", collectionIds);

          if (cardsError) throw cardsError;

          // Calculamos el total de cartas sumando las cantidades
          totalCards =
            cards?.reduce((acc, card) => {
              return acc + (card.quantity || 1);
            }, 0) || 0;
        }

        setStats({
          cardsCount: totalCards,
          collectionsCount: collections?.length || 0,
          wishlistCount: wishlistCount || 0,
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
