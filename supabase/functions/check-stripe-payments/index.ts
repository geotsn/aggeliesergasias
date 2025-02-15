
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
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
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseAnonKey = authHeader.replace('Bearer ', '');
    if (!supabaseAnonKey) {
      throw new Error('Invalid authorization header');
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Missing Stripe secret key');
    }

    console.log('Starting payment check process...');

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    console.log('Initialized Stripe client');

    const yesterday = Math.floor(Date.now() / 1000) - (24 * 60 * 60);
    
    try {
      const sessions = await stripe.checkout.sessions.list({
        limit: 100,
        created: { gte: yesterday },
        expand: ['data.payment_intent']
      });

      console.log(`Found ${sessions.data.length} total Stripe sessions`);

      // Φιλτράρισμα για ολοκληρωμένες συνεδρίες με πληρωμένο PaymentIntent
      const completedSessions = sessions.data.filter(session => {
        const paymentIntent = session.payment_intent as Stripe.PaymentIntent;
        return session.status === 'complete' && 
               session.client_reference_id && 
               paymentIntent?.status === 'succeeded';
      });

      console.log(`Found ${completedSessions.length} completed sessions with reference IDs`);

      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase credentials');
      }

      console.log('Initializing Supabase client...');
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      console.log('Fetching pending jobs...');
      const { data: pendingJobs, error: pendingError } = await supabase
        .from('jobs')
        .select('*')
        .eq('payment_status', 'pending')
        .eq('is_active', false);

      if (pendingError) {
        console.error('Error fetching pending jobs:', pendingError);
        throw pendingError;
      }

      console.log(`Found ${pendingJobs?.length || 0} pending jobs in database`);
      
      const paidJobIds = new Set<string>();
      
      console.log('Processing completed sessions...');
      for (const session of completedSessions) {
        try {
          if (!session.client_reference_id) {
            console.log('Session has no client reference ID:', session.id);
            continue;
          }

          const paymentIntent = session.payment_intent as Stripe.PaymentIntent;
          if (paymentIntent?.status !== 'succeeded') {
            console.log(`Session ${session.id} payment not succeeded: ${paymentIntent?.status}`);
            continue;
          }

          const jobData = JSON.parse(decodeURIComponent(session.client_reference_id));
          if (jobData.id) {
            paidJobIds.add(jobData.id);
            console.log(`Found paid job ID: ${jobData.id} from session ${session.id}`);
          }
        } catch (error) {
          console.error('Error parsing session data:', error);
          console.error('Session:', session);
        }
      }

      console.log(`Found ${paidJobIds.size} unique paid job IDs`);

      let processedCount = 0;
      if (paidJobIds.size > 0) {
        for (const jobId of paidJobIds) {
          console.log(`Processing job ID: ${jobId}`);
          
          try {
            const { data: jobStatus, error: statusError } = await supabase
              .from('jobs')
              .select('payment_status, is_active')
              .eq('id', jobId)
              .single();

            if (statusError) {
              console.error(`Error checking status for job ${jobId}:`, statusError);
              continue;
            }

            console.log(`Current job status:`, jobStatus);

            if (jobStatus.payment_status !== 'completed' || !jobStatus.is_active) {
              const { error: updateError } = await supabase
                .from('jobs')
                .update({
                  payment_status: 'completed',
                  is_active: true
                })
                .eq('id', jobId);

              if (updateError) {
                console.error(`Error updating job ${jobId}:`, updateError);
              } else {
                console.log(`Successfully activated job ${jobId}`);
                processedCount++;
              }
            } else {
              console.log(`Job ${jobId} already activated`);
            }
          } catch (error) {
            console.error(`Error processing job ${jobId}:`, error);
          }
        }
      }

      console.log('Payment check process completed successfully');
      return new Response(
        JSON.stringify({
          success: true,
          totalSessions: sessions.data.length,
          completedSessions: completedSessions.length,
          uniquePaidJobs: paidJobIds.size,
          processedJobs: processedCount
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );

    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      throw stripeError;
    }

  } catch (error) {
    console.error('Error in payment check process:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        errorType: error.constructor.name,
        errorStack: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message.includes('authorization') ? 401 : 500
      }
    );
  }
});
