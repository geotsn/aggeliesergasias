
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Buffer } from "https://deno.land/std@0.168.0/node/buffer.ts";
import Stripe from 'https://esm.sh/stripe@13.6.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!signature || !webhookSecret) {
      throw new Error('Missing stripe signature or webhook secret');
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log('Stripe webhook event:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const pendingJobData = session.metadata?.jobData;

      if (!pendingJobData) {
        throw new Error('No job data found in session metadata');
      }

      const jobData = JSON.parse(pendingJobData);
      console.log('Processing job data:', jobData);

      // Create supabase client
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // Premium jobs last 30 days

      const { data, error } = await supabaseClient
        .from('jobs')
        .insert([{
          ...jobData,
          type: 'premium',
          is_active: true,
          posted_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString()
        }]);

      if (error) {
        console.error('Error inserting job:', error);
        throw error;
      }

      console.log('Successfully created premium job:', data);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error('Error processing webhook:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
