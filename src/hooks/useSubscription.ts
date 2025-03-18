import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/supabase';
import { useAuth } from '../../supabase/auth';
import { SubscriptionPlan } from '@/lib/polar';

interface Subscription {
  id: string;
  plan_type: SubscriptionPlan;
  status: string;
  current_period_end: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          // Si no hay suscripción, crear una suscripción básica
          if (error.code === 'PGRST116') { // código de "no rows returned"
            const { data: newSub, error: createError } = await supabase
              .from('subscriptions')
              .insert({
                user_id: user.id,
                plan_type: 'APRENDIZ',
                status: 'active'
              })
              .select()
              .single();

            if (!createError && newSub) {
              setSubscription(newSub);
            }
          }
        } else {
          setSubscription(data);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  return { subscription, isLoading };
}

