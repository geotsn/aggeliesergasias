
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

    console.log(`Found ${completedSessions.length} completed sessions`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    let processedCount = 0;

    // Επεξεργασία κάθε ολοκληρωμένης συνεδρίας
    for (const session of completedSessions) {
      try {
        console.log(`Processing session ${session.id}`);
        
        // Αποκωδικοποίηση δεδομένων αγγελίας
        const jobData = JSON.parse(decodeURIComponent(session.client_reference_id!));
        
        // Έλεγχος για διπλότυπη καταχώρηση
        const { data: existingJobs } = await supabase
          .from('jobs')
          .select('id')
          .eq('source', 'web')
          .eq('title', jobData.title)
          .eq('company', jobData.company);

        if (existingJobs && existingJobs.length > 0) {
          console.log(`Job already exists for session ${session.id}, skipping`);
          continue;
        }

        // Υπολογισμός ημερομηνιών
        const now = new Date();
        const expiresAt = new Date(now);
        expiresAt.setDate(now.getDate() + 30);

        const postedAt = new Date(now);
        postedAt.setHours(now.getHours() + 2);

        // Προετοιμασία δεδομένων αγγελίας
        const jobToInsert = {
          ...jobData,
          type: 'premium',
          is_active: true,
          posted_at: postedAt.toISOString(),
          expires_at: expiresAt.toISOString(),
          source: 'web',
          url: jobData.url || 'https://aggeliesergasias.eu'
        };

        // Εισαγωγή της αγγελίας
        const { error: insertError } = await supabase
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
        continue;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalSessions: sessions.data.length,
        completedSessions: completedSessions.length,
        processedJobs: processedCount
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
