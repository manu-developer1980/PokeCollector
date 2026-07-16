// Crea una sesión del Billing Portal de Stripe para el usuario autenticado.
// Desde el portal el usuario puede ver facturas, cambiar el método de pago
// y gestionar/cancelar su suscripción (según lo configurado en el dashboard
// de Stripe: Settings → Billing → Customer portal).

import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { getCorsHeaders } from "../_shared/cors.ts";
import {
  createServiceClient,
  getAuthenticatedUser,
  jsonResponse,
} from "../_shared/auth.ts";

// deno-lint-ignore no-explicit-any
declare const Deno: any;

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return jsonResponse({ error: "No autenticado" }, 401, corsHeaders);
    }

    const { returnUrl } = await req.json().catch(() => ({}));

    // El customer sale de la fila de suscripción del usuario; si no hay,
    // se busca en Stripe por metadata userId.
    const supabase = createServiceClient();
    const { data: rows } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .not("stripe_customer_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1);

    let customerId = rows?.[0]?.stripe_customer_id as string | undefined;

    if (!customerId) {
      const found = await stripe.customers.search({
        query: `metadata['userId']:'${user.id}'`,
        limit: 1,
      });
      customerId = found.data[0]?.id;
    }

    if (!customerId) {
      return jsonResponse(
        { error: "El usuario no tiene datos de facturación en Stripe" },
        404,
        corsHeaders
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${Deno.env.get("SITE_URL")}/dashboard`,
    });

    return jsonResponse({ url: session.url }, 200, corsHeaders);
  } catch (error) {
    console.error("❌ Error creando sesión del portal:", error);
    return jsonResponse(
      { error: (error as Error).message ?? "Error creando sesión del portal" },
      500,
      corsHeaders
    );
  }
});
