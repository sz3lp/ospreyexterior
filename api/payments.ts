import { createClient } from '@supabase/supabase-js';

type HttpRequest = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[]>;
  url?: string;
};

type HttpResponse = {
  status: (code: number) => HttpResponse;
  json: (body: Record<string, unknown>) => void;
  setHeader?: (name: string, value: string) => void;
};

const supabaseUrl = process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const hubspotApiKey = process.env.HUBSPOT_API_KEY || '';

const supabase = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

function applyCors(res: HttpResponse) {
  if (typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
}

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

export default async function handler(req: HttpRequest, res: HttpResponse) {
  applyCors(res);

  if (req.method === 'OPTIONS') {
    res.status(200).json({ success: true });
    return;
  }

  if (!supabase) {
    res.status(500).json({ success: false, message: 'Supabase credentials are missing' });
    return;
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body as Record<string, unknown>);
      const { invoice_id, job_id, amount, customer_id, description } = body;

      if (!amount || !customer_id) {
        res.status(400).json({ success: false, message: 'Amount and customer ID required' });
        return;
      }

      const { data: customer } = await supabase
        .from('customers')
        .select('email, full_name')
        .eq('id', customer_id)
        .single();

      if (!customer) {
        res.status(404).json({ success: false, message: 'Customer not found' });
        return;
      }

      const paymentIntent = await createStripePaymentIntent(
        amount,
        customer.email,
        description || `Payment for ${job_id || invoice_id || 'service'}`
      );

      await supabase
        .from('payments')
        .insert({
          customer_id,
          job_id: job_id || null,
          invoice_id: invoice_id || null,
          amount,
          stripe_payment_intent_id: paymentIntent.id,
          status: 'pending',
        });

      if (invoice_id) {
        await supabase
          .from('invoices')
          .update({ status: 'paid', paid_at: new Date().toISOString() })
          .eq('id', invoice_id);
      }

      res.status(200).json({
        success: true,
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, message });
    }
    return;
  }

  if (req.method === 'GET') {
    const url = new URL(req.url || '', 'http://localhost');
    const paymentId = url.searchParams.get('id');
    const customerId = url.searchParams.get('customer_id');

    if (paymentId) {
      const { data: payment, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (error) {
        res.status(404).json({ success: false, message: 'Payment not found' });
        return;
      }

      res.status(200).json({ success: true, payment });
      return;
    }

    if (customerId) {
      const { data: payments, error } = await supabase
        .from('payments')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) {
        res.status(500).json({ success: false, message: error.message });
        return;
      }

      res.status(200).json({ success: true, payments });
      return;
    }

    res.status(400).json({ success: false, message: 'Payment ID or customer ID required' });
    return;
  }

  res.status(405).json({ success: false, message: 'Method not allowed' });
}

