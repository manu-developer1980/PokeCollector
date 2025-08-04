// @ts-ignore: Deno imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Deno imports
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-ignore: Deno imports
import Stripe from "https://esm.sh/stripe@12.0.0";
import { getCorsHeaders } from "../_shared/cors.ts";

// @ts-ignore: Deno environment
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

// @ts-ignore: Deno environment
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
// @ts-ignore: Deno environment
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
    const resource = pathSegments[pathSegments.length - 2]; // prices, products, plans
    const resourceId = pathSegments[pathSegments.length - 1]; // ID o acción

    console.log(`Request: ${req.method} ${url.pathname}, resource: ${resource}, resourceId: ${resourceId}`);

    // Handle GET requests
    if (req.method === "GET") {
      if (resource === "plans" || resourceId === "plans") {
        return await handleGetPlans(corsHeaders);
      }
    }

    // Handle POST requests
    if (req.method === "POST") {
      try {
        const body = await req.json();
        
        // Endpoint /prices
        if (resource === "prices" && !resourceId) {
          if (body.action === "get-plans") {
            return await handleGetPlans(corsHeaders);
          }
          
          if (body.action === "create-price") {
            return await handleCreatePrice(body, corsHeaders);
          }
        }
        
        // Endpoint /products
        if (resource === "products" && !resourceId) {
          if (body.action === "create-product") {
            return await handleCreateProduct(body, corsHeaders);
          }
        }
        
        // Handle other actions here if needed
        return new Response(
          JSON.stringify({ error: "Invalid action or endpoint" }),
          { status: 400, headers: corsHeaders }
        );
      } catch (jsonError) {
        return new Response(
          JSON.stringify({ error: "Invalid JSON" }),
          { status: 400, headers: corsHeaders }
        );
      }
    }
    
    // Handle PATCH requests
    if (req.method === "PATCH") {
      try {
        const body = await req.json();
        
        // Endpoint /prices/{priceId}
        if (resource === "prices" && resourceId) {
          return await handleUpdatePrice(resourceId, body, corsHeaders);
        }
        
        // Endpoint /products/{productId}
        if (resource === "products" && resourceId) {
          return await handleUpdateProduct(resourceId, body, corsHeaders);
        }
        
        return new Response(
          JSON.stringify({ error: "Invalid endpoint for PATCH request" }),
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

    // Filter out products created by Stripe CLI
    const filteredProducts = products.data.filter(product => {
      const productName = product.name.toLowerCase();
      return !productName.includes("created by stripe cli") && 
             !productName.includes("myproduct") &&
             !productName.startsWith("prod_");
    });

    console.log(`After filtering CLI products: ${filteredProducts.length} products remaining`);

    // Combine products with their prices to create plans
    const plans: Array<{product: any, price: any}> = [];
    
    for (const product of filteredProducts) {
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

async function handleCreatePrice(body: any, corsHeaders: Record<string, string>) {
  try {
    console.log('Creating Stripe price...');
    
    // Extract price data from the request body
    const { productId, unitAmount, currency, recurring, nickname, metadata } = body;
    
    if (!productId || !unitAmount || !currency) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: productId, unitAmount, currency" }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Create the price in Stripe
    const priceData: any = {
      product: productId,
      unit_amount: unitAmount,
      currency,
    };
    
    if (recurring) {
      priceData.recurring = recurring;
    }
    
    if (nickname) {
      priceData.nickname = nickname;
    }
    
    if (metadata) {
      priceData.metadata = metadata;
    }
    
    const price = await stripe.prices.create(priceData);
    
    console.log(`Created price: ${price.id}`);
    
    return new Response(
      JSON.stringify({ price }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error creating price:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}

async function handleCreateProduct(body: any, corsHeaders: Record<string, string>) {
  try {
    console.log('Creating Stripe product...');
    
    // Extract product data from the request body
    const { name, description, images, metadata, active } = body;
    
    if (!name) {
      return new Response(
        JSON.stringify({ error: "Missing required field: name" }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Create the product in Stripe
    const productData: any = {
      name,
    };
    
    if (description) {
      productData.description = description;
    }
    
    if (images && Array.isArray(images)) {
      productData.images = images;
    }
    
    if (metadata) {
      productData.metadata = metadata;
    }
    
    if (active !== undefined) {
      productData.active = active;
    }
    
    const product = await stripe.products.create(productData);
    
    console.log(`Created product: ${product.id}`);
    
    return new Response(
      JSON.stringify({ product }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}

async function handleUpdatePrice(priceId: string, body: any, corsHeaders: Record<string, string>) {
  try {
    console.log(`Updating Stripe price: ${priceId}`);
    
    // Extract price update data from the request body
    const { active, nickname, metadata } = body;
    
    // Create the update data object
    const updateData: any = {};
    
    if (active !== undefined) {
      updateData.active = active;
    }
    
    if (nickname !== undefined) {
      updateData.nickname = nickname;
    }
    
    if (metadata) {
      updateData.metadata = metadata;
    }
    
    // Update the price in Stripe
    const price = await stripe.prices.update(priceId, updateData);
    
    console.log(`Updated price: ${price.id}`);
    
    return new Response(
      JSON.stringify({ price }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error updating price:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}

async function handleUpdateProduct(productId: string, body: any, corsHeaders: Record<string, string>) {
  try {
    console.log(`Updating Stripe product: ${productId}`);
    
    // Extract product update data from the request body
    const { name, description, images, metadata, active } = body;
    
    // Create the update data object
    const updateData: any = {};
    
    if (name) {
      updateData.name = name;
    }
    
    if (description !== undefined) {
      updateData.description = description;
    }
    
    if (images && Array.isArray(images)) {
      updateData.images = images;
    }
    
    if (metadata) {
      updateData.metadata = metadata;
    }
    
    if (active !== undefined) {
      updateData.active = active;
    }
    
    // Update the product in Stripe
    const product = await stripe.products.update(productId, updateData);
    
    console.log(`Updated product: ${product.id}`);
    
    return new Response(
      JSON.stringify({ product }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error updating product:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}