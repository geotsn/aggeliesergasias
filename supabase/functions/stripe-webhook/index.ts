
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Buffer } from "https://deno.land/std@0.168.0/node/buffer.ts";
import Stripe from 'https://esm.sh/stripe@13.6.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
      console.error('Missing stripe signature or webhook secret');
      throw new Error('Missing stripe signature or webhook secret');
    }

    const body = await req.text();
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Error verifying webhook signature:', err);
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    console.log('Stripe webhook event:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const clientReferenceId = session.client_reference_id;

      if (!clientReferenceId) {
        console.error('No client reference ID found in session:', session);
        throw new Error('No job data found in client reference ID');
      }

      let jobData;
      try {
        jobData = JSON.parse(clientReferenceId);
        console.log('Successfully parsed job data:', jobData);
      } catch (err) {
        console.error('Error parsing job data:', err, 'Raw client reference ID:', clientReferenceId);
        throw new Error('Invalid job data format');
      }

      // Create supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase credentials');
        throw new Error('Missing Supabase credentials');
      }

      const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // Premium jobs last 30 days

      const postedAt = new Date();
      postedAt.setHours(postedAt.getHours() + 2); // Adjust for GMT+2

      // Validate required fields before insertion
      const requiredFields = ['title', 'company', 'location', 'description'];
      const missingFields = requiredFields.filter(field => !jobData[field]);
      
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields, 'Job data:', jobData);
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      console.log('Attempting to insert job with data:', {
        ...jobData,
        type: 'premium',
        is_active: true,
        posted_at: postedAt.toISOString(),
        expires_at: expiresAt.toISOString()
      });

      const { data, error } = await supabaseClient
        .from('jobs')
        .insert([{
          ...jobData,
          type: 'premium',
          is_active: true,
          posted_at: postedAt.toISOString(),
          expires_at: expiresAt.toISOString()
        }])
        .select();

      if (error) {
        console.error('Error inserting job:', error, 'Job data:', jobData);
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
