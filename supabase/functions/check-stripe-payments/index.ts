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
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Αντί για την τρέχουσα ημέρα, ελέγχουμε όλες τις πληρωμές
    console.log('Checking all historical payments');

    // Ανάκτηση όλων των ολοκληρωμένων συνεδριών checkout
    const sessions = await stripe.checkout.sessions.list({
      limit: 100, // Μέγιστος αριθμός που επιτρέπει το Stripe API
      payment_status: 'paid',
      status: 'complete',
    });

    console.log(`Found ${sessions.data.length} completed payments`);

    // Σύνδεση με Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    let processedCount = 0;

    // Επεξεργασία κάθε πληρωμένης συνεδρίας
    for (const session of sessions.data) {
      if (!session.client_reference_id) {
        console.log(`Session ${session.id} has no client reference ID, skipping`);
        continue;
      }

      try {
        // Αποκωδικοποίηση των δεδομένων της αγγελίας
        let jobData;
        try {
          jobData = JSON.parse(decodeURIComponent(session.client_reference_id));
          console.log('Successfully decoded job data:', jobData);
        } catch (error) {
          console.error(`Error decoding job data for session ${session.id}:`, error);
          continue;
        }

        // Έλεγχος για τα απαραίτητα πεδία
        const requiredFields = ['title', 'company', 'location', 'description'];
        const missingFields = requiredFields.filter(field => !jobData[field]);
        
        if (missingFields.length > 0) {
          console.error(`Missing required fields for session ${session.id}:`, missingFields);
          continue;
        }

        // Έλεγχος αν η αγγελία έχει ήδη καταχωρηθεί
        const { data: existingJobs } = await supabaseClient
          .from('jobs')
          .select('id')
          .eq('source', 'web')
          .eq('title', jobData.title)
          .eq('company', jobData.company);

        if (existingJobs && existingJobs.length > 0) {
          console.log(`Job already exists for session ${session.id}, skipping`);
          continue;
        }

        // Υπολογισμός των ημερομηνιών με βάση την ημερομηνία πληρωμής
        const paymentDate = new Date(session.created * 1000);
        const expiresAt = new Date(paymentDate);
        expiresAt.setDate(expiresAt.getDate() + 30);

        const postedAt = new Date(paymentDate);
        postedAt.setHours(postedAt.getHours() + 2);

        // Καταχώρηση της αγγελίας
        const jobToInsert = {
          ...jobData,
          type: 'premium',
          is_active: true,
          posted_at: postedAt.toISOString(),
          expires_at: expiresAt.toISOString(),
          source: 'web',
          url: jobData.url || 'https://aggeliesergasias.eu'
        };

        const { error: insertError } = await supabaseClient
          .from('jobs')
          .insert([jobToInsert]);

        if (insertError) {
          console.error(`Error inserting job for session ${session.id}:`, insertError);
          continue;
        }

        processedCount++;
        console.log(`Successfully processed job for session ${session.id}`);

      } catch (error) {
        console.error(`Error processing session ${session.id}:`, error);
      }
    }

    const result = {
      totalPayments: sessions.data.length,
      processedJobs: processedCount,
      checkedAt: new Date().toISOString()
    };

    console.log('Processing completed:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error checking payments:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
