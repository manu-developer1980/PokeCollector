import { useCallback, useState } from "react";
import { useAuth } from "../../supabase/auth";
import { supabase } from "../../supabase/supabase";
import { useAdmin } from "./useAdmin";

export interface SubscriptionDetails {
  id: string;
  user_id: string;
  customer_id: string | null;
  polar_id: string | null;
  polar_price_id: string | null;
  status: string;
  amount: number | null;
  currency: string | null;
  interval: string | null;
  started_at: string | null;
  ended_at: string | null;
  canceled_at: string | null;
  metadata: any;
  custom_field_data: any;
  created_at: string;
  updated_at: string;
}

export const useAdminSubscription = () => {
  const { user } = useAuth();
  const { isAdmin, logAdminAction } = useAdmin();
  const [isChangingPlan, setIsChangingPlan] = useState(false);

  // Get subscription details for a user
  const getUserSubscription = useCallback(
    async (userId: string) => {
      // Let the database RLS policies handle the admin check

      try {
        const { data, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        return data;
      } catch (err) {
        // Error fetching user subscription
        throw err;
      }
    },
    [isAdmin]
  );

  // Helper function to get access token from session
  const getAccessToken = async (): Promise<string | null> => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      // Error getting session
      return null;
    }
    return session.access_token;
  };

  // Manually change user's plan
  const changePlan = useCallback(
    async (userIdOrStripeCustomerId: string, newPlanType: string, reason: string) => {
      // Let the database RLS policies handle the admin check
      setIsChangingPlan(true);

      try {
        // Check if the provided ID is a Stripe customer ID (starts with 'cus_')
        let actualUserId = userIdOrStripeCustomerId;
        
        if (userIdOrStripeCustomerId.startsWith('cus_')) {
          // This is a Stripe customer ID, we need to find the actual user UUID
          // Converting Stripe customer ID to user UUID
          
          const { data: subscription, error } = await (supabase as any)
            .from("subscriptions")
            .select("user_id")
            .eq("stripe_customer_id", userIdOrStripeCustomerId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single() as any;

          if (error || !subscription) {
            throw new Error(`No se encontró usuario para el cliente de Stripe: ${userIdOrStripeCustomerId}`);
          }
          
          actualUserId = subscription.user_id;
          // Found actual user ID
        }

        // Get current subscription using the actual user UUID
        const currentSubscription = await getUserSubscription(actualUserId);
        // Current subscription data retrieved

        if (!currentSubscription?.polar_id) {
          throw new Error("No se encontró suscripción activa");
        }

        // Get access token
        const accessToken = await getAccessToken();
        if (!accessToken) {
          throw new Error("No se pudo obtener el token de acceso");
        }

        // Get the new price ID from Stripe plans
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-admin/plans`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Error al obtener planes de Stripe");
        }

        const data = await response.json();
        const stripePlans = data.plans || [];
        
        // Debug logging - show full structure
        // Raw API response processed
        
        // Flatten plans if they have a prices array structure
        const flattenedPlans = [];
        for (const plan of stripePlans) {
          if (plan.prices && Array.isArray(plan.prices)) {
            // Structure: {product, prices: Array}
            for (const price of plan.prices) {
              flattenedPlans.push({
                product: plan.product,
                price: price
              });
            }
          } else if (plan.price) {
            // Structure: {product, price}
            flattenedPlans.push(plan);
          } else {
            console.warn('Unknown plan structure:', plan);
          }
        }
        
        // Flattened plans processed
        
        // Try to find the plan by price ID first (if newPlanType looks like a price ID)
        let targetPlan = null;
        if (newPlanType.startsWith('price_')) {
          targetPlan = flattenedPlans.find((plan: any) => plan.price?.id === newPlanType);
          // Search by price ID completed
        }
        
        // If not found by price ID, try to find by plan_type metadata
        if (!targetPlan) {
          targetPlan = flattenedPlans.find((plan: any) => 
            plan.product?.metadata?.plan_type?.toLowerCase() === newPlanType.toLowerCase()
          );
          // Search by plan_type completed
        }

        if (!targetPlan?.price?.id) {
          // No plan found for the specified type
          throw new Error(`No se encontró precio para el plan: ${newPlanType}`);
        }

        // Call the change-subscription Edge Function
        const changeResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/change-subscription`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
               subscriptionId: currentSubscription.polar_id,
               newPriceId: targetPlan.price.id,
             }),
          }
        );

        if (!changeResponse.ok) {
          const errorData = await changeResponse.json();
          throw new Error(errorData.error || "Error al cambiar el plan");
        }

        const result = await changeResponse.json();

        // Get the updated subscription from database to ensure we have the correct UUID
        const updatedSubscription = await getUserSubscription(actualUserId);
        // Updated subscription data retrieved

        // Log the action - use the database UUID, not the Stripe data
        await logAdminAction(
          user!.id,
          actualUserId,
          "admin_plan_change",
          "subscription",
          updatedSubscription?.id || currentSubscription.id, // Ensure we use the database UUID
          { status: currentSubscription?.status },
          { status: newPlanType },
          { reason, admin_override: true }
        );

        return result;
      } catch (err) {
        // Error changing plan
        throw err;
      } finally {
        setIsChangingPlan(false);
      }
    },
    [isAdmin, user, getUserSubscription, logAdminAction]
  );

  // Update subscription status
  const updateSubscriptionStatus = useCallback(
    async (userId: string, status: string, reason: string) => {
      // Let the database RLS policies handle the admin check

      try {
        // Get current subscription
        const currentSubscription = await getUserSubscription(userId);

        // Update subscription status
        const { data, error } = await supabase
          .from("subscriptions")
          .update({
            status,
            is_active: status === "active",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        // Log the action
        await logAdminAction(
          user!.id,
          userId,
          "admin_status_change",
          "subscription",
          data.id,
          {
            status: currentSubscription?.status,
          },
          { status },
          { reason, admin_override: true }
        );

        return data;
      } catch (err) {
        // Error updating subscription status
        throw err;
      }
    },
    [isAdmin, user, getUserSubscription, logAdminAction]
  );

  // Sync subscription with Stripe
  const syncWithStripe = useCallback(
    async (userId: string) => {
      // Let the database RLS policies handle the admin check

      try {
        // Get access token
        const accessToken = await getAccessToken();
        if (!accessToken) {
          throw new Error("No se pudo obtener el token de acceso");
        }

        // Call the sync function
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-subscription`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              user_id: userId,
              admin_user_id: user!.id,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to sync with Stripe");
        }

        const result = await response.json();

        // Log the action
        await logAdminAction(
          user!.id,
          userId,
          "admin_stripe_sync",
          "subscription",
          null,
          null,
          result,
          { admin_initiated: true }
        );

        return result;
      } catch (err) {
        // Error syncing with Stripe
        throw err;
      }
    },
    [isAdmin, user, logAdminAction]
  );

  // Cancel subscription
  const cancelSubscription = useCallback(
    async (userId: string, immediate: boolean = false, reason: string) => {
      // Let the database RLS policies handle the admin check

      try {
        // Get current subscription
        const currentSubscription = await getUserSubscription(userId);

        if (!currentSubscription?.polar_id) {
          throw new Error("No active subscription found");
        }

        // Get access token
        const accessToken = await getAccessToken();
        if (!accessToken) {
          throw new Error("No se pudo obtener el token de acceso");
        }

        // Call the cancel function
        const response = await fetch(
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/functions/v1/cancel-subscription`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              subscriptionId: currentSubscription.stripe_subscription_id,
              userId: userId,
              immediate,
              admin_user_id: user!.id,
              reason,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to cancel subscription");
        }

        const result = await response.json();

        // Log the action
        await logAdminAction(
          user!.id,
          userId,
          "admin_subscription_cancel",
          "subscription",
          currentSubscription.id,
          { status: currentSubscription.status },
          { status: "canceled" },
          { reason, immediate, admin_override: true }
        );

        return result;
      } catch (err) {
        // Error canceling subscription
        throw err;
      }
    },
    [isAdmin, user, getUserSubscription, logAdminAction]
  );

  // Create subscription override
  const createOverride = useCallback(
    async (
      userId: string,
      overrideType: string,
      originalValue: string,
      overrideValue: string,
      reason: string,
      expiresAt?: string
    ) => {
      // Let the database RLS policies handle the admin check

      try {
        const { data, error } = await (supabase as any)
        .from("subscription_overrides")
        .insert({
          user_id: userId,
          admin_user_id: user!.id,
          override_type: overrideType,
          original_value: originalValue,
          override_value: overrideValue,
          reason,
          expires_at: expiresAt,
          is_active: true,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

        if (error) {
          throw error;
        }

        // Log the action
        await logAdminAction(
          user!.id,
          userId,
          "admin_create_override",
          "subscription_override",
          data.id,
          null,
          data,
          { reason }
        );

        return data;
      } catch (err) {
        // Error creating override
        throw err;
      }
    },
    [isAdmin, user, logAdminAction]
  );

  // Get user's subscription overrides
  const getUserOverrides = useCallback(
    async (userId: string) => {
      // Let the database RLS policies handle the admin check

      try {
        const { data, error } = await (supabase as any)
          .from("subscription_overrides")
          .select("*")
          .eq("user_id", userId)
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        return data || [];
      } catch (err) {
        // Error fetching user overrides
        throw err;
      }
    },
    [isAdmin]
  );

  // Deactivate override
  const deactivateOverride = useCallback(
    async (overrideId: string, reason: string) => {
      // Let the database RLS policies handle the admin check

      try {
        const { data, error } = await (supabase as any)
          .from("subscription_overrides")
          .update({
            is_active: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", overrideId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        // Log the action
        await logAdminAction(
          user!.id,
          (data as any).user_id,
          "admin_deactivate_override",
          "subscription_override",
          overrideId,
          { is_active: true },
          { is_active: false },
          { reason }
        );

        return data;
      } catch (err) {
        // Error deactivating override
        throw err;
      }
    },
    [isAdmin, user, logAdminAction]
  );

  return {
    getUserSubscription,
    changePlan,
    updateSubscriptionStatus,
    syncWithStripe,
    cancelSubscription,
    createOverride,
    getUserOverrides,
    deactivateOverride,
    isChangingPlan,
  };
};
