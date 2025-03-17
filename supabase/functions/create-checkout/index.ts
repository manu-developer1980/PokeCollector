import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Polar } from "npm:@polar-sh/sdk";


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const polar = new Polar({
  accessToken: Deno.env.get('POLAR_ACCESS_TOKEN'),
  server: Deno.env.get('ENVIRONMENT') === 'production' ? 'production' : 'sandbox',
});


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productPriceId, successUrl, customerEmail, metadata } = await req.json();

    if (!productPriceId || !customerEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const checkoutSession = await polar.checkouts.create({
      productPriceId,
      successUrl: `${Deno.env.get('SITE_URL')}/checkout/success`,
      cancelUrl: `${Deno.env.get('SITE_URL')}/pricing`,
      customerEmail,
      metadata
    });

    return new Response(
      JSON.stringify({ url: checkoutSession.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
