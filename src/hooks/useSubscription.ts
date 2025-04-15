import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabase/supabase";
import { useAuth } from "../../supabase/auth";

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  plan_type: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

// Función de utilidad para esperar un tiempo determinado
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Función para calcular el tiempo de espera con retroceso exponencial
const getBackoffTime = (
  attempt: number,
  baseDelay = 1000,
  maxDelay = 10000
) => {
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  // Añadir un poco de aleatoriedad para evitar que todas las solicitudes se realicen al mismo tiempo
  return delay + Math.random() * 1000;
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<Error | null>(null);

  const fetchSubscription = useCallback(
    async (retryAttempt = 0, maxRetries = 3) => {
      if (!user) {
        console.log("No user found, skipping subscription fetch");
        setIsLoading(false);
        setFetchError(null);
        return null;
      }

      console.log(
        `Fetching subscription for user: ${user.id} (attempt ${
          retryAttempt + 1
        }/${maxRetries + 1})`
      );

      try {
        // Primero obtenemos todas las suscripciones del usuario
        const { data, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("\u26a0️ Error fetching subscription:", error);
          setFetchError(
            new Error(error.message || "Error fetching subscription")
          );

          // Si aún tenemos intentos disponibles, reintentamos con retroceso exponencial
          if (retryAttempt < maxRetries) {
            const backoffTime = getBackoffTime(retryAttempt);
            console.log(
              `Retrying in ${Math.round(
                backoffTime / 1000
              )} seconds... (attempt ${retryAttempt + 1}/${maxRetries})`
            );
            await sleep(backoffTime);
            return fetchSubscription(retryAttempt + 1, maxRetries);
          }

          return null;
        }

        // Limpiar el error si la solicitud fue exitosa
        setFetchError(null);

        // Si hay múltiples suscripciones, tomamos la más reciente
        if (data && data.length > 0) {
          // Mantener el plan_type tal como viene de la base de datos (en minúsculas)
          // ya que es un ENUM en la base de datos
          const subscription = {
            ...data[0],
            plan_type: data[0].plan_type || "aprendiz",
          };

          console.log(
            `\u2705 Found ${data.length} subscriptions, using the most recent one:`,
            {
              id: subscription.id,
              plan_type: subscription.plan_type,
              stripe_subscription_id:
                subscription.stripe_subscription_id || "none",
              status: subscription.status,
              updated_at: subscription.updated_at,
            }
          );
          return subscription;
        }

        console.log("\u26a0️ No subscriptions found for user");
        return null;
      } catch (err) {
        console.error("\u274c Unexpected error fetching subscription:", err);
        setFetchError(err instanceof Error ? err : new Error(String(err)));

        // Si aún tenemos intentos disponibles, reintentamos con retroceso exponencial
        if (retryAttempt < maxRetries) {
          const backoffTime = getBackoffTime(retryAttempt);
          console.log(
            `Retrying in ${Math.round(
              backoffTime / 1000
            )} seconds... (attempt ${retryAttempt + 1}/${maxRetries})`
          );
          await sleep(backoffTime);
          return fetchSubscription(retryAttempt + 1, maxRetries);
        }

        return null;
      } finally {
        // Solo establecemos isLoading a false si es el último intento o si tuvimos éxito
        if (retryAttempt >= maxRetries) {
          setIsLoading(false);
        }
      }
    },
    [user]
  );

  const refetchSubscription = useCallback(async () => {
    console.log("\ud83d\udd04 Refetching subscription data...");
    setIsLoading(true);
    setFetchError(null);

    try {
      // Usar un tiempo de espera más corto para el primer intento
      await sleep(Math.random() * 500); // Pequeño retraso aleatorio para evitar solicitudes simultáneas

      const data = await fetchSubscription();
      if (data) {
        setSubscription(data);
      }
      return data;
    } catch (err) {
      console.error("\u274c Error in refetchSubscription:", err);
      setFetchError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  }, [fetchSubscription]);

  useEffect(() => {
    // Obtener la suscripción inicial
    console.log(
      "\ud83d\udd0d Initializing subscription hook and fetching initial data"
    );

    // Usar setTimeout para evitar que la solicitud inicial se bloquee por recursos insuficientes
    const initialFetchTimeout = setTimeout(() => {
      refetchSubscription();
    }, 100);

    if (!user) {
      console.log("No user available for real-time subscription");
      return () => clearTimeout(initialFetchTimeout);
    }

    // Configurar una suscripción en tiempo real a cambios en la tabla de suscripciones
    console.log(
      "\ud83d\udcf6 Setting up real-time subscription for user:",
      user.id
    );

    let subscriptionChannel: any = null;

    // Retrasar ligeramente la configuración del canal para evitar problemas de recursos
    const channelSetupTimeout = setTimeout(() => {
      subscriptionChannel = supabase
        .channel(`subscription-changes-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "subscriptions",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log(
              "\ud83d\udce3 Real-time subscription change detected:",
              {
                eventType: payload.eventType,
                table: payload.table,
                schema: payload.schema,
                timestamp: new Date().toISOString(),
              }
            );

            // Log the old and new records for debugging
            if (payload.old && payload.new) {
              console.log("Changes detected:", {
                old_plan_type: (payload.old as any).plan_type,
                new_plan_type: (payload.new as any).plan_type,
                old_stripe_sub_id: (payload.old as any).stripe_subscription_id,
                new_stripe_sub_id: (payload.new as any).stripe_subscription_id,
              });
            }

            // Retrasar ligeramente la recarga para evitar problemas de recursos
            setTimeout(() => {
              refetchSubscription();
            }, 500);
          }
        )
        .subscribe((status) => {
          console.log(`Real-time subscription status: ${status}`);
        });
    }, 300);

    // Limpiar la suscripción cuando el componente se desmonte
    return () => {
      console.log("Cleaning up real-time subscription");
      clearTimeout(initialFetchTimeout);
      clearTimeout(channelSetupTimeout);
      if (subscriptionChannel) {
        supabase.removeChannel(subscriptionChannel);
      }
    };
  }, [refetchSubscription, user]);

  return {
    subscription,
    isLoading,
    error: fetchError,
    refetchSubscription,
  };
};
