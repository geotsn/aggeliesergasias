
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
      if (session.payment_status !== 'paid') {
        console.log('Session not paid, skipping');
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      const clientReferenceId = session.client_reference_id;
      if (!clientReferenceId) {
        throw new Error('No client reference ID found');
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

      const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

      // Έλεγχος για τα απαραίτητα πεδία
      const requiredFields = ['title', 'company', 'location', 'description'];
      const missingFields = requiredFields.filter(field => !jobData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Έλεγχος για διπλότυπη καταχώρηση
      const { data: existingJobs } = await supabaseClient
        .from('jobs')
        .select('id')
        .eq('source', 'web')
        .eq('title', jobData.title)
        .eq('company', jobData.company);

      if (existingJobs && existingJobs.length > 0) {
        console.log('Job already exists, skipping');
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const postedAt = new Date();
      postedAt.setHours(postedAt.getHours() + 2);

      const jobToInsert = {
        ...jobData,
        type: 'premium',
        is_active: true,
        posted_at: postedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        source: 'web',
        url: jobData.url || 'https://aggeliesergasias.eu'
      };

      console.log('Inserting job:', jobToInsert);

      const { data, error } = await supabaseClient
        .from('jobs')
        .insert([jobToInsert])
        .select();

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
