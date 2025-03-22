import { supabase } from "../../supabase/supabase";
import { useState, useEffect } from "react";
import { useAuth } from "../../supabase/auth";

interface Stats {
  cardsCount: number;
  collectionsCount: number;
  wishlistCount: number;
}

export function useStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    cardsCount: 0,
    collectionsCount: 0,
    wishlistCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Obtener el conteo de colecciones
        const { count: collectionsCount } = await supabase
          .from("collections")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        // Obtener el conteo de cartas
        const { count: cardsCount } = await supabase
          .from("collection_cards")
          .select(
            `
            id,
            collection:collection_id(user_id)
          `,
            { count: "exact", head: true }
          )
          .eq("collection.user_id", user.id);

        // Obtener el conteo de wishlist
        const { count: wishlistCount } = await supabase
          .from("wishlist_cards")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        setStats({
          cardsCount: cardsCount || 0,
          collectionsCount: collectionsCount || 0,
          wishlistCount: wishlistCount || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        // Mantener los valores anteriores en caso de error
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [user]);

  return { stats, isLoading };
}
