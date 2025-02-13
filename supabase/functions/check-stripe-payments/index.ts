
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
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    if (!stripeSecretKey) {
      throw new Error('Missing Stripe secret key');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    console.log('Checking for paid Stripe sessions...');

    // Ανάκτηση όλων των συνεδριών των τελευταίων 24 ωρών
    const yesterday = Math.floor(Date.now() / 1000) - (24 * 60 * 60);
    
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      created: { gte: yesterday },
      expand: ['data.payment_intent']
    });

    console.log(`Found ${sessions.data.length} recent sessions`);

    // Φιλτράρισμα για ολοκληρωμένες συνεδρίες
    const completedSessions = sessions.data.filter(
      session => session.status === 'complete' && session.client_reference_id
    );

    console.log(`Found ${completedSessions.length} completed sessions with reference IDs`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    let processedCount = 0;

    // Πρώτα βρίσκουμε όλες τις εκκρεμείς αγγελίες
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
    
    if (pendingJobs) {
      for (const job of pendingJobs) {
        console.log(`Checking job ID: ${job.id}`);
      }
    }

    // Επεξεργασία κάθε ολοκληρωμένης συνεδρίας
    for (const session of completedSessions) {
      try {
        console.log(`\nProcessing session ${session.id}`);
        console.log('Session status:', session.status);
        console.log('Payment status:', session.payment_status);
        console.log('Client reference ID:', session.client_reference_id);
        
        if (!session.client_reference_id) {
          console.log('No client reference ID found for session:', session.id);
          continue;
        }

        // Αποκωδικοποίηση δεδομένων αγγελίας
        let jobData;
        try {
          jobData = JSON.parse(decodeURIComponent(session.client_reference_id));
          console.log('Successfully decoded job data:', jobData);
        } catch (error) {
          console.error('Error decoding job data:', error);
          continue;
        }
        
        // Ενημέρωση της υπάρχουσας εγγραφής με βάση το ID
        const { error: updateError, data: updatedData } = await supabase
          .from('jobs')
          .update({
            payment_status: 'completed',
            is_active: true
          })
          .eq('id', jobData.id)
          .eq('payment_status', 'pending')
          .select();

        if (updateError) {
          console.error(`Error updating job for session ${session.id}:`, updateError);
          continue;
        }

        console.log('Update result:', updatedData);

        if (!updatedData || updatedData.length === 0) {
          // Αν δεν βρέθηκε η αγγελία, ψάχνουμε να δούμε αν υπάρχει γενικά
          const { data: existingJob, error: checkError } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', jobData.id)
            .single();

          if (checkError) {
            console.error(`Error checking job existence for ID ${jobData.id}:`, checkError);
          } else {
            console.log(`Job status for ID ${jobData.id}:`, {
              exists: !!existingJob,
              payment_status: existingJob?.payment_status,
              is_active: existingJob?.is_active
            });
          }
          
          continue;
        }

        processedCount++;
        console.log(`Successfully processed job for session ${session.id}`);

      } catch (error) {
        console.error(`Error processing session ${session.id}:`, error);
        continue;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalSessions: sessions.data.length,
        completedSessions: completedSessions.length,
        processedJobs: processedCount,
        pendingJobs: pendingJobs?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
