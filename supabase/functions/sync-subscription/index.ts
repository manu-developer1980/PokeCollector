import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = (req: Request) => ({
  "Access-Control-Allow-Origin": req.headers.get("origin") || "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(req) });
  }

  try {
    const { user_id, admin_user_id } = await req.json();

    if (!user_id) {
      throw new Error("user_id is required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2023-10-16",
    });

    console.log(`🔄 Syncing subscription for user: ${user_id}`);

    // Get current subscription from database
    const { data: currentSubscription, error: dbError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (dbError && dbError.code !== "PGRST116") {
      console.error("Error fetching subscription from DB:", dbError);
      throw new Error("Failed to fetch subscription from database");
    }

    let syncResult = {
      user_id,
      database_subscription: currentSubscription,
      stripe_subscription: null,
      changes_made: [],
      sync_status: "no_changes",
    };

    // If no subscription in database, create default one
    if (!currentSubscription) {
      console.log(
        "No subscription found in database, creating default subscription"
      );

      const { data: newSubscription, error: createError } = await supabase
        .from("subscriptions")
        .insert({
          user_id,
          plan_type: "aprendiz",
          status: "active",
          current_period_end: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          is_active: true,
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating default subscription:", createError);
        throw new Error("Failed to create default subscription");
      }

      syncResult.database_subscription = newSubscription;
      syncResult.changes_made.push("created_default_subscription");
      syncResult.sync_status = "created_default";

      return new Response(JSON.stringify(syncResult), {
        headers: { ...corsHeaders(req), "Content-Type": "application/json" },
        status: 200,
      });
    }

    // If there's a Stripe subscription ID, sync with Stripe
    if (currentSubscription.stripe_subscription_id) {
      try {
        console.log(
          `Fetching Stripe subscription: ${currentSubscription.stripe_subscription_id}`
        );

        const stripeSubscription = await stripe.subscriptions.retrieve(
          currentSubscription.stripe_subscription_id,
          {
            expand: ["latest_invoice", "customer", "items.data.price"],
          }
        );

        syncResult.stripe_subscription = {
          id: stripeSubscription.id,
          status: stripeSubscription.status,
          current_period_start: stripeSubscription.current_period_start,
          current_period_end: stripeSubscription.current_period_end,
          cancel_at_period_end: stripeSubscription.cancel_at_period_end,
          customer_id: stripeSubscription.customer as string,
        };

        // Determine plan type from Stripe price ID
        let planType = "aprendiz";
        if (stripeSubscription.items.data.length > 0) {
          const priceId = stripeSubscription.items.data[0].price.id;

          // Map Stripe price IDs to plan types
          const priceToPlanMap: Record<string, string> = {
            price_1R4KH1EoOyqILXNqxnOSjJHZ: "aprendiz",
            price_1R4KGgEoOyqILXNqf6Z2vjqQ: "entrenador",
            price_1R4KHlEoOyqILXNqqX7gkWWJ: "maestro",
          };

          planType = priceToPlanMap[priceId] || "aprendiz";
        }

        // Check for differences and update if necessary
        const updates: any = {};
        let hasChanges = false;

        if (currentSubscription.plan_type !== planType) {
          updates.plan_type = planType;
          syncResult.changes_made.push(
            `plan_type: ${currentSubscription.plan_type} -> ${planType}`
          );
          hasChanges = true;
        }

        if (currentSubscription.status !== stripeSubscription.status) {
          updates.status = stripeSubscription.status;
          syncResult.changes_made.push(
            `status: ${currentSubscription.status} -> ${stripeSubscription.status}`
          );
          hasChanges = true;
        }

        const stripeIsActive = stripeSubscription.status === "active";
        if (currentSubscription.is_active !== stripeIsActive) {
          updates.is_active = stripeIsActive;
          syncResult.changes_made.push(
            `is_active: ${currentSubscription.is_active} -> ${stripeIsActive}`
          );
          hasChanges = true;
        }

        const stripePeriodEnd = new Date(
          stripeSubscription.current_period_end * 1000
        ).toISOString();
        if (currentSubscription.current_period_end !== stripePeriodEnd) {
          updates.current_period_end = stripePeriodEnd;
          syncResult.changes_made.push(`current_period_end updated`);
          hasChanges = true;
        }

        if (
          currentSubscription.cancel_at_period_end !==
          stripeSubscription.cancel_at_period_end
        ) {
          updates.cancel_at_period_end =
            stripeSubscription.cancel_at_period_end;
          syncResult.changes_made.push(
            `cancel_at_period_end: ${currentSubscription.cancel_at_period_end} -> ${stripeSubscription.cancel_at_period_end}`
          );
          hasChanges = true;
        }

        if (hasChanges) {
          console.log("Updating subscription with changes:", updates);

          const { data: updatedSubscription, error: updateError } =
            await supabase
              .from("subscriptions")
              .update({
                ...updates,
                updated_at: new Date().toISOString(),
              })
              .eq("id", currentSubscription.id)
              .select()
              .single();

          if (updateError) {
            console.error("Error updating subscription:", updateError);
            throw new Error("Failed to update subscription");
          }

          syncResult.database_subscription = updatedSubscription;
          syncResult.sync_status = "updated";
        } else {
          syncResult.sync_status = "in_sync";
        }
      } catch (stripeError: any) {
        console.error("Error fetching from Stripe:", stripeError);

        if (stripeError.code === "resource_missing") {
          // Stripe subscription doesn't exist, clear the stripe_subscription_id
          console.log(
            "Stripe subscription not found, clearing stripe_subscription_id"
          );

          const { error: clearError } = await supabase
            .from("subscriptions")
            .update({
              stripe_subscription_id: null,
              stripe_customer_id: null,
              stripe_price_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", currentSubscription.id);

          if (clearError) {
            console.error("Error clearing Stripe IDs:", clearError);
          } else {
            syncResult.changes_made.push("cleared_invalid_stripe_ids");
            syncResult.sync_status = "stripe_subscription_not_found";
          }
        } else {
          syncResult.sync_status = "stripe_error";
          syncResult.changes_made.push(`stripe_error: ${stripeError.message}`);
        }
      }
    } else {
      syncResult.sync_status = "no_stripe_subscription";
    }

    // Log the sync action if admin initiated
    if (admin_user_id) {
      await supabase.rpc("log_admin_action", {
        p_admin_user_id: admin_user_id,
        p_target_user_id: user_id,
        p_action: "sync_subscription",
        p_entity_type: "subscription",
        p_entity_id: currentSubscription?.id,
        p_old_values: currentSubscription,
        p_new_values: syncResult.database_subscription,
        p_metadata: {
          sync_result: syncResult,
          changes_made: syncResult.changes_made,
        },
      });
    }

    console.log(
      `✅ Sync completed for user ${user_id}:`,
      syncResult.sync_status
    );

    return new Response(JSON.stringify(syncResult), {
      headers: { ...corsHeaders(req), "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in sync-subscription:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred during sync",
      }),
      {
        headers: { ...corsHeaders(req), "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
