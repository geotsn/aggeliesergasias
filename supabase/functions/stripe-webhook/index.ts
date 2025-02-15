
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Buffer } from "https://deno.land/std@0.168.0/node/buffer.ts";
import Stripe from 'https://esm.sh/stripe@13.6.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Received webhook request');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    console.log('Webhook secret exists:', !!webhookSecret);
    console.log('Signature exists:', !!signature);

    if (!signature || !webhookSecret) {
      console.error('Missing stripe signature or webhook secret');
      throw new Error('Missing stripe signature or webhook secret');
    }

    const body = await req.text();
    console.log('Received webhook body length:', body.length);

    let event;
    
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
      console.log('Successfully constructed event:', event.type);
    } catch (err) {
      console.error('Error verifying webhook signature:', err);
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      console.log('Processing completed checkout session:', {
        id: session.id,
        paymentStatus: session.payment_status,
        status: session.status
      });

      // Μόνο αν η πληρωμή έχει ολοκληρωθεί
      if (session.payment_status === 'paid' && session.status === 'complete') {
        const clientReferenceId = session.client_reference_id;
        if (!clientReferenceId) {
          console.error('No client reference ID found');
          return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }

        let jobData;
        try {
          jobData = JSON.parse(decodeURIComponent(clientReferenceId));
          console.log('Successfully parsed job data:', jobData);
        } catch (err) {
          console.error('Error parsing job data:', err);
          throw new Error('Invalid job data format');
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (!supabaseUrl || !supabaseServiceKey) {
          throw new Error('Missing Supabase credentials');
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        console.log('Updating job with ID:', jobData.id);

        const { data, error } = await supabase
          .from('jobs')
          .update({
            payment_status: 'completed',
            is_active: true
          })
          .eq('id', jobData.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating job:', error);
          throw error;
        }

        console.log('Successfully updated job:', data);
      }
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
