import { useCallback } from "react";
import { useAuth } from "../../supabase/auth";
import { supabase } from "../../supabase/supabase";
import { useAdmin } from "./useAdmin";

export interface SubscriptionDetails {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  plan_type: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useAdminSubscription = () => {
  const { user } = useAuth();
  const { isAdmin, logAdminAction } = useAdmin();

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
        console.error("Error fetching user subscription:", err);
        throw err;
      }
    },
    [isAdmin]
  );

  // Manually change user's plan
  const changePlan = useCallback(
    async (userId: string, newPlanType: string, reason: string) => {
      // Let the database RLS policies handle the admin check

      try {
        // Get current subscription
        const currentSubscription = await getUserSubscription(userId);

        // Update subscription
        const { data, error } = await supabase
          .from("subscriptions")
          .update({
            plan_type: newPlanType,
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
          "admin_plan_change",
          "subscription",
          data.id,
          { plan_type: currentSubscription?.plan_type },
          { plan_type: newPlanType },
          { reason, admin_override: true }
        );

        return data;
      } catch (err) {
        console.error("Error changing plan:", err);
        throw err;
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
            is_active: currentSubscription?.is_active,
          },
          { status, is_active: status === "active" },
          { reason, admin_override: true }
        );

        return data;
      } catch (err) {
        console.error("Error updating subscription status:", err);
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
        // Call the sync function
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-subscription`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
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
        console.error("Error syncing with Stripe:", err);
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

        if (!currentSubscription?.stripe_subscription_id) {
          throw new Error("No Stripe subscription found");
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
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
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
        console.error("Error canceling subscription:", err);
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
        const { data, error } = await supabase
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
        console.error("Error creating override:", err);
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
        const { data, error } = await supabase
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
        console.error("Error fetching user overrides:", err);
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
        const { data, error } = await supabase
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
          data.user_id,
          "admin_deactivate_override",
          "subscription_override",
          overrideId,
          { is_active: true },
          { is_active: false },
          { reason }
        );

        return data;
      } catch (err) {
        console.error("Error deactivating override:", err);
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
  };
};
