import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from 'https://esm.sh/stripe@12.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { subscriptionId, newPriceId } = await req.json();

    // Obtener la suscripción actual
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Calcular el proration
    const items = [{
      id: subscription.items.data[0].id,
      price: newPriceId,
    }];

    // Crear una vista previa de la factura para ver los cambios
    const invoice = await stripe.invoices.retrieveUpcoming({
      customer: subscription.customer as string,
      subscription: subscriptionId,
      subscription_items: items,
    });

    // Si hay un monto a pagar (proración), actualizar la suscripción
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items,
      proration_behavior: 'always_invoice', // Esto generará una factura por la diferencia
      payment_behavior: 'default_incomplete', // Requerirá confirmación de pago si hay cargo adicional
    });

    return new Response(
      JSON.stringify({
        subscription: updatedSubscription,
        prorationAmount: invoice.total,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});