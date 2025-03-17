import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  const signature = req.headers.get('x-polar-signature');
  
  // Verificar la firma del webhook (implementar la verificación según docs de Polar)
  
  try {
    const event = await req.json();
    
    switch (event.type) {
      case 'subscription.created':
      case 'subscription.updated':
        await handleSubscriptionUpdate(event.data);
        break;
      case 'subscription.deleted':
        await handleSubscriptionCancellation(event.data);
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function handleSubscriptionUpdate(data) {
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: data.metadata.user_id,
      status: 'active',
      plan_type: data.metadata.plan_name,
      current_period_end: data.current_period_end,
      cancel_at_period_end: data.cancel_at_period_end,
      polar_subscription_id: data.id,
      polar_price_id: data.price_id
    });

  if (error) throw error;
}

async function handleSubscriptionCancellation(data) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancel_at_period_end: true
    })
    .eq('polar_subscription_id', data.id);

  if (error) throw error;
}