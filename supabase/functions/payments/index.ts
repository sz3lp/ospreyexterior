import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0';
import { corsHeaders } from '../_shared/cors.ts';

interface PaymentIntentPayload {
  invoice_id?: string;
  job_id?: string;
  amount: number;
  customer_id: string;
  description?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
  const hubspotApiKey = Deno.env.get('HUBSPOT_API_KEY') || '';

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  async function createStripePaymentIntent(amount: number, customerEmail: string, description: string) {
    if (!stripeSecretKey) {
      throw new Error('Stripe not configured');
    }

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: Math.round(amount * 100).toString(),
        currency: 'usd',
        description: description,
        receipt_email: customerEmail,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Stripe API error: ${error}`);
    }

    return await response.json();
  }

  async function updateHubSpotDeal(jobId: string, amount: number) {
    if (!hubspotApiKey) return;

    try {
      const { data: job } = await supabase
        .from('jobs')
        .select('hubspot_deal_id')
        .eq('id', jobId)
        .single();

      if (!job?.hubspot_deal_id) return;

      await fetch(`https://api.hubapi.com/crm/v3/objects/deals/${job.hubspot_deal_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${hubspotApiKey}`,
        },
        body: JSON.stringify({
          properties: {
            amount: amount.toString(),
          },
        }),
      });
    } catch (error) {
      console.error('HubSpot update error:', error);
    }
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json() as PaymentIntentPayload;
      const { invoice_id, job_id, amount, customer_id, description } = body;

      if (!amount || !customer_id) {
        return new Response(
          JSON.stringify({ success: false, message: 'Amount and customer ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: customer } = await supabase
        .from('customers')
        .select('email, full_name')
        .eq('id', customer_id)
        .single();

      if (!customer) {
        return new Response(
          JSON.stringify({ success: false, message: 'Customer not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const paymentIntent = await createStripePaymentIntent(
        amount,
        customer.email,
        description || `Payment for ${job_id || invoice_id || 'service'}`
      );

      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          customer_id,
          job_id: job_id || null,
          invoice_id: invoice_id || null,
          amount,
          stripe_payment_intent_id: paymentIntent.id,
          status: 'pending',
        })
        .select()
        .single();

      if (paymentError) {
        console.error('Payment record error:', paymentError);
      }

      if (invoice_id) {
        await supabase
          .from('invoices')
          .update({ status: 'paid', paid_at: new Date().toISOString() })
          .eq('id', invoice_id);
      }

      if (job_id) {
        await updateHubSpotDeal(job_id, amount);
      }

      return new Response(
        JSON.stringify({
          success: true,
          client_secret: paymentIntent.client_secret,
          payment_intent_id: paymentIntent.id,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Payment creation error:', error);
      return new Response(
        JSON.stringify({ success: false, message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  if (req.method === 'GET') {
    const url = new URL(req.url);
    const paymentId = url.searchParams.get('id');
    const customerId = url.searchParams.get('customer_id');

    if (paymentId) {
      const { data: payment, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ success: false, message: 'Payment not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, payment }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (customerId) {
      const { data: payments, error } = await supabase
        .from('payments')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) {
        return new Response(
          JSON.stringify({ success: false, message: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, payments }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: 'Payment ID or customer ID required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: false, message: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});

