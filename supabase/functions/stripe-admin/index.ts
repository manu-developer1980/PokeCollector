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

    console.log(`Request: ${req.method} ${url.pathname}, action: ${action}`);

    // Handle GET requests
    if (req.method === "GET" && action === "plans") {
      return await handleGetPlans(corsHeaders);
    }

    // Handle POST requests
    if (req.method === "POST") {
      try {
        const body = await req.json();
        
        if (body.action === "get-plans") {
          return await handleGetPlans(corsHeaders);
        }
        
        // Handle other actions here if needed
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: corsHeaders }
        );
      } catch (jsonError) {
        return new Response(
          JSON.stringify({ error: "Invalid JSON" }),
          { status: 400, headers: corsHeaders }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: corsHeaders }
    );

  } catch (error) {
    console.error("Error in stripe-admin function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});

async function handleGetPlans(corsHeaders: Record<string, string>) {
  try {
    console.log('Fetching Stripe plans...');
    
    // Get all products
    const products = await stripe.products.list({
      limit: 100,
      expand: ["data.default_price"],
    });

    // Get all prices
    const prices = await stripe.prices.list({
      limit: 100,
      expand: ["data.product"],
    });

    console.log(`Found ${products.data.length} products and ${prices.data.length} prices`);

    // Combine products with their prices to create plans
    const plans = [];
    
    for (const product of products.data) {
      const productPrices = prices.data.filter(price => 
        typeof price.product === "object" ? price.product.id === product.id : price.product === product.id
      );

      // Create a plan for each price
      for (const price of productPrices) {
        plans.push({
          product,
          price,
        });
      }
    }

    console.log(`Returning ${plans.length} plans`);

    return new Response(
      JSON.stringify({ plans }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error fetching plans:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}