import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const WEBHOOK_SECRET = Deno.env.get('POLAR_WEBHOOK_SECRET')!;

serve(async (req) => {
  try {
    const signature = req.headers.get('x-polar-signature');
    if (!signature) {
      return new Response('Missing signature', { status: 401 });
    }

    // Verificar la firma del webhook (implementar la verificación)
    
    const payload = await req.json();
    const { type, data } = payload;

    switch (type) {
      case 'subscription.created':
        await handleSubscriptionCreated(data);
        break;
      case 'subscription.updated':
        await handleSubscriptionUpdated(data);
        break;
      case 'subscription.deleted':
        await handleSubscriptionDeleted(data);
        break;
      default:
        console.log(`Unhandled event type: ${type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

async function handleSubscriptionCreated(data: any) {
  const { user_id, subscription_id, plan_id, status } = data;
  
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id,
      subscription_id,
      plan_id,
      status,
      current_period_end: data.current_period_end,
      cancel_at_period_end: data.cancel_at_period_end,
    });

  if (error) throw error;
}

async function handleSubscriptionUpdated(data: any) {
  const { subscription_id, status } = data;
  
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status,
      current_period_end: data.current_period_end,
      cancel_at_period_end: data.cancel_at_period_end,
    })
    .eq('subscription_id', subscription_id);

  if (error) throw error;
}

async function handleSubscriptionDeleted(data: any) {
  const { subscription_id } = data;
  
  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('subscription_id', subscription_id);

  if (error) throw error;
}
