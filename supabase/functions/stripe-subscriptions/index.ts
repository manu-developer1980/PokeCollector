import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0";
import { getCorsHeaders } from "../_shared/cors.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verificar autenticación
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: corsHeaders }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Verificar si es admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (userError || !userData?.is_admin) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: corsHeaders }
      );
    }

    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/").filter(Boolean);
    const action = pathSegments[pathSegments.length - 1];

    switch (req.method) {
      case "GET":
        if (action === "subscriptions") {
          return await handleGetSubscriptions(corsHeaders, url);
        } else if (action === "customers") {
          return await handleGetCustomers(corsHeaders, url);
        }
        break;

      case "POST":
        if (action === "cancel-subscription") {
          return await handleCancelSubscription(req, corsHeaders);
        } else if (action === "update-subscription") {
          return await handleUpdateSubscription(req, corsHeaders);
        } else if (action === "reactivate-subscription") {
          return await handleReactivateSubscription(req, corsHeaders);
        }
        break;
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: corsHeaders }
    );

  } catch (error) {
    console.error("Error in stripe-subscriptions function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});

async function handleGetSubscriptions(corsHeaders: Record<string, string>, url: URL) {
  try {
    const limit = parseInt(url.searchParams.get("limit") || "100");
    const status = url.searchParams.get("status") as Stripe.SubscriptionListParams.Status;
    const priceId = url.searchParams.get("price_id");

    // Según la documentación de Stripe, las expansiones tienen un máximo de 4 niveles
    // data.items.data.price es 3 niveles, que está dentro del límite
    const params: Stripe.SubscriptionListParams = {
      limit,
      expand: ["data.customer", "data.items.data.price"],
    };

    if (status) {
      params.status = status;
    }

    if (priceId) {
      params.price = priceId;
    }

    console.log("Fetching subscriptions with params:", JSON.stringify(params, null, 2));
    const subscriptions = await stripe.subscriptions.list(params);
    console.log(`Found ${subscriptions.data.length} subscriptions`);

    // Recopilar IDs únicos de productos para obtener detalles
    const productIds = new Set<string>();
    subscriptions.data.forEach(subscription => {
      subscription.items.data.forEach(item => {
        if (item.price && typeof item.price.product === 'string') {
          productIds.add(item.price.product);
        }
      });
    });

    console.log(`Found ${productIds.size} unique products to fetch`);

    // Obtener detalles de productos en paralelo
    const productPromises = Array.from(productIds).map(async (productId) => {
      try {
        const product = await stripe.products.retrieve(productId);
        return { id: productId, product };
      } catch (error) {
        console.error(`Error fetching product ${productId}:`, error);
        return { id: productId, product: null };
      }
    });

    const productResults = await Promise.all(productPromises);
    const productMap = new Map<string, Stripe.Product>();
    
    productResults.forEach(({ id, product }) => {
      if (product) {
        productMap.set(id, product);
      }
    });

    console.log(`Successfully fetched ${productMap.size} products`);

    // Formatear los datos para el frontend
    const formattedSubscriptions = subscriptions.data.map(subscription => {
      try {
        const customer = subscription.customer as Stripe.Customer;
        const item = subscription.items.data[0]; // Tomar el primer item
        const price = item?.price;
        
        // Obtener el ID del producto de manera segura
        let productId: string | null = null;
        if (price?.product) {
          if (typeof price.product === 'string') {
            productId = price.product;
          } else if (typeof price.product === 'object' && price.product.id) {
            productId = price.product.id;
          }
        }

        const product = productId ? productMap.get(productId) : null;

        return {
          id: subscription.id,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: customer?.id || '',
          user: {
            name: customer?.name || customer?.email || "Usuario desconocido",
            email: customer?.email || '',
          },
          plan: {
            name: product?.name || 'Plan desconocido',
            price: price?.unit_amount ? price.unit_amount / 100 : 0,
            currency: price?.currency || 'usd',
            interval: price?.recurring?.interval || "month",
          },
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          createdAt: new Date(subscription.created * 1000).toISOString(),
          metadata: subscription.metadata || {},
        };
      } catch (error) {
        console.error("Error formatting subscription:", subscription.id, error);
        // Retornar un objeto con valores por defecto en caso de error
        return {
          id: subscription.id,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: '',
          user: {
            name: "Error al cargar usuario",
            email: '',
          },
          plan: {
            name: 'Error al cargar plan',
            price: 0,
            currency: 'usd',
            interval: "month",
          },
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          createdAt: new Date(subscription.created * 1000).toISOString(),
          metadata: {},
        };
      }
    });

    console.log(`Successfully formatted ${formattedSubscriptions.length} subscriptions`);

    return new Response(
      JSON.stringify({ 
        subscriptions: formattedSubscriptions,
        hasMore: subscriptions.has_more,
        total: subscriptions.data.length
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error in handleGetSubscriptions:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Error al obtener las suscripciones de Stripe"
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}

async function handleGetCustomers(corsHeaders: Record<string, string>, url: URL) {
  try {
    const limit = parseInt(url.searchParams.get("limit") || "100");
    const email = url.searchParams.get("email");

    const params: Stripe.CustomerListParams = {
      limit,
    };

    if (email) {
      params.email = email;
    }

    const customers = await stripe.customers.list(params);

    return new Response(
      JSON.stringify({ 
        customers: customers.data,
        hasMore: customers.has_more
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error fetching customers:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}

async function handleCancelSubscription(req: Request, corsHeaders: Record<string, string>) {
  try {
    const { subscriptionId, cancelAtPeriodEnd = true } = await req.json();

    let subscription;
    if (cancelAtPeriodEnd) {
      subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    } else {
      subscription = await stripe.subscriptions.cancel(subscriptionId);
    }

    return new Response(
      JSON.stringify({ subscription }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}

async function handleUpdateSubscription(req: Request, corsHeaders: Record<string, string>) {
  try {
    const { subscriptionId, priceId, prorationBehavior = "create_prorations" } = await req.json();

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: priceId,
      }],
      proration_behavior: prorationBehavior,
    });

    return new Response(
      JSON.stringify({ subscription: updatedSubscription }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error updating subscription:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}

async function handleReactivateSubscription(req: Request, corsHeaders: Record<string, string>) {
  try {
    const { subscriptionId } = await req.json();

    // Reactivar la suscripción removiendo el cancel_at_period_end
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    return new Response(
      JSON.stringify({ subscription }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error reactivating subscription:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}