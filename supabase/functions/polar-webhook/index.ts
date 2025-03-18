import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from '@supabase/supabase-js';
import { validateEvent } from '@polar-sh/sdk';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function verifyPolarSignature(request: Request, body: string): Promise<boolean> {
  try {
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    validateEvent(
      body,
      headers,
      Deno.env.get('POLAR_WEBHOOK_SECRET') ?? '',
    );
    return true;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const clonedReq = req.clone();
    const rawBody = await clonedReq.text();
    
    const isValidSignature = await verifyPolarSignature(req, rawBody);
    if (!isValidSignature) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const payload = JSON.parse(rawBody);
    const { type, data } = payload;

    // Registrar el evento en la base de datos
    const { error: logError } = await supabase
      .from('webhook_events')
      .insert({
        event_type: type,
        payload: data,
        processed_at: new Date().toISOString()
      });

    if (logError) {
      console.error('Error logging webhook event:', logError);
    }

    let result;
    switch (type) {
      case 'subscription.created':
        result = await handleSubscriptionCreated(data);
        break;
      case 'subscription.updated':
        result = await handleSubscriptionUpdated(data);
        break;
      case 'subscription.deleted':
        result = await handleSubscriptionDeleted(data);
        break;
      default:
        return new Response(JSON.stringify({ message: `Unhandled event type: ${type}` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleSubscriptionCreated(data: any) {
  const { metadata, price_id, status } = data;
  const userId = metadata?.user_id;

  if (!userId) {
    throw new Error('User ID not found in metadata');
  }

  const planType = getPlanTypeFromPriceId(price_id);
  
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      polar_id: data.id,
      polar_price_id: price_id,
      status,
      plan_type: planType,
      current_period_end: new Date(data.current_period_end).getTime(),
      cancel_at_period_end: data.cancel_at_period_end,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

  if (error) throw error;
  return { success: true };
}

async function handleSubscriptionUpdated(data: any) {
  const { id, price_id, status } = data;
  
  const planType = getPlanTypeFromPriceId(price_id);
  
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status,
      plan_type: planType,
      polar_price_id: price_id,
      current_period_end: new Date(data.current_period_end).getTime(),
      cancel_at_period_end: data.cancel_at_period_end,
      updated_at: new Date().toISOString()
    })
    .eq('polar_id', id);

  if (error) throw error;
  return { success: true };
}

async function handleSubscriptionDeleted(data: any) {
  const { id } = data;
  
  const { error } = await supabase
    .from('subscriptions')
    .update({ 
      status: 'cancelled',
      plan_type: 'APRENDIZ',
      updated_at: new Date().toISOString()
    })
    .eq('polar_id', id);

  if (error) throw error;
  return { success: true };
}

function getPlanTypeFromPriceId(priceId: string): SubscriptionPlan {
  const planEntry = Object.entries(SUBSCRIPTION_PLANS).find(([_, id]) => id === priceId);
  return (planEntry?.[0] as SubscriptionPlan) || 'APRENDIZ';
}
