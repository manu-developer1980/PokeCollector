import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/supabase';
import { useAuth } from '../../supabase/auth';

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
        const [cardsResult, collectionsResult, wishlistResult] = await Promise.all([
          supabase
            .from('collection_cards')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id),
          supabase
            .from('collections')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id),
          supabase
            .from('wishlist_cards')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id),
        ]);

        setStats({
          cardsCount: cardsResult.count || 0,
          collectionsCount: collectionsResult.count || 0,
          wishlistCount: wishlistResult.count || 0,
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error fetching stats'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [user?.id]);

  return { stats, isLoading, error };
}