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
const hubspotApiKey = process.env.HUBSPOT_API_KEY || '';

const supabase = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

function applyCors(res: HttpResponse) {
  if (typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
}

// Consolidated API router - handles bookings, appointments, jobs, estimates, customers
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

  // Extract endpoint from query parameter or path
  const url = new URL(req.url || '', 'http://localhost');
  let endpoint = url.searchParams.get('endpoint') || '';
  
  if (!endpoint) {
    const path = url.pathname;
    endpoint = path.split('/').pop() || '';
  }

  // BOOKINGS endpoint
  if (endpoint === 'bookings' && req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body as Record<string, unknown>);
      const { service_type, scheduled_date, scheduled_time, full_name, email, phone, address, notes } = body;

      if (!service_type || !scheduled_date || !scheduled_time || !full_name || !email || !phone || !address) {
        res.status(400).json({ success: false, message: 'Missing required fields' });
        return;
      }

      const scheduledDateTime = new Date(`${scheduled_date}T${scheduled_time}`);

      let { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', email)
        .single();

      if (!customer) {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            full_name,
            email,
            phone,
            address: { address },
          })
          .select()
          .single();

        if (customerError) throw customerError;
        customer = newCustomer;
      }

      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          customer_id: customer.id,
          scheduled_time: scheduledDateTime.toISOString(),
          address: { address },
          status: 'scheduled',
          notes: notes || null,
        })
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert({
          customer_id: customer.id,
          service_type,
          status: 'scheduled',
          scheduled_date: scheduledDateTime.toISOString(),
        })
        .select()
        .single();

      if (jobError) throw jobError;

      await supabase
        .from('appointments')
        .update({ job_id: job.id })
        .eq('id', appointment.id);

      res.status(200).json({
        success: true,
        appointment_id: appointment.id,
        job_id: job.id,
        customer_id: customer.id,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, message });
    }
    return;
  }

  // JOBS endpoint
  if (endpoint === 'jobs') {
    if (req.method === 'GET') {
      const jobId = url.searchParams.get('job_id');
      const customerId = url.searchParams.get('customer_id');

      if (jobId) {
        const { data: job, error } = await supabase
          .from('jobs')
          .select('*, customers(*)')
          .eq('id', jobId)
          .single();

        if (error) {
          res.status(404).json({ success: false, message: 'Job not found' });
          return;
        }

        res.status(200).json({ success: true, job });
        return;
      }

      if (customerId) {
        const { data: jobs, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });

        if (error) {
          res.status(500).json({ success: false, message: error.message });
          return;
        }

        res.status(200).json({ success: true, jobs });
        return;
      }

      res.status(400).json({ success: false, message: 'Job ID or customer ID required' });
      return;
    }

    if (req.method === 'PATCH') {
      try {
        const jobId = url.searchParams.get('id') || url.searchParams.get('job_id');
        if (!jobId) {
          res.status(400).json({ success: false, message: 'Job ID required' });
          return;
        }

        const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body as Record<string, unknown>);

        const { data: job, error } = await supabase
          .from('jobs')
          .update(body)
          .eq('id', jobId)
          .select()
          .single();

        if (error) throw error;

        res.status(200).json({ success: true, job });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message });
      }
      return;
    }
  }

  // CUSTOMERS endpoint
  if (endpoint === 'customers' && req.method === 'GET') {
    const customerId = url.searchParams.get('id');
    const search = url.searchParams.get('search');

    if (customerId) {
      const { data: customer, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (error) {
        res.status(404).json({ success: false, message: 'Customer not found' });
        return;
      }

      res.status(200).json({ success: true, customer });
      return;
    }

    if (search) {
      const { data: customers, error } = await supabase
        .from('customers')
        .select('*')
        .or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
        .limit(10);

      if (error) {
        res.status(500).json({ success: false, message: error.message });
        return;
      }

      res.status(200).json({ success: true, customers: customers || [] });
      return;
    }

    res.status(400).json({ success: false, message: 'Customer ID or search query required' });
    return;
  }

  // APPOINTMENTS endpoint
  if (endpoint === 'appointments' && req.method === 'GET') {
    const customerId = url.searchParams.get('customer_id');
    const appointmentId = url.searchParams.get('id');

    if (appointmentId) {
      const { data: appointment, error } = await supabase
        .from('appointments')
        .select('*, customers(*), jobs(*)')
        .eq('id', appointmentId)
        .single();

      if (error) {
        res.status(404).json({ success: false, message: 'Appointment not found' });
        return;
      }

      res.status(200).json({ success: true, appointment });
      return;
    }

    if (customerId) {
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('*, jobs(service_type)')
        .eq('customer_id', customerId)
        .order('scheduled_time', { ascending: true });

      if (error) {
        res.status(500).json({ success: false, message: error.message });
        return;
      }

      res.status(200).json({ success: true, appointments: appointments || [] });
      return;
    }

    res.status(400).json({ success: false, message: 'Appointment ID or customer ID required' });
    return;
  }

  // ESTIMATES endpoint
  if (endpoint === 'estimates') {
    if (req.method === 'POST') {
      try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body as Record<string, unknown>);
        const { customer_id, customer_email, customer_name, service_type, line_items, notes, expires_days = 30 } = body;

        if (!service_type || !line_items || !Array.isArray(line_items) || line_items.length === 0) {
          res.status(400).json({ success: false, message: 'Missing required fields' });
          return;
        }

        const amount = line_items.reduce((sum: number, item: any) => 
          sum + (item.quantity * item.unit_price), 0);

        let finalCustomerId = customer_id;

        if (!finalCustomerId && customer_email) {
          let { data: existingCustomer } = await supabase
            .from('customers')
            .select('id')
            .eq('email', customer_email)
            .single();

          if (!existingCustomer) {
            const { data: newCustomer, error: customerError } = await supabase
              .from('customers')
              .insert({
                email: customer_email,
                full_name: customer_name || '',
              })
              .select()
              .single();

            if (customerError) throw customerError;
            existingCustomer = newCustomer;
          }

          finalCustomerId = existingCustomer.id;
        }

        if (!finalCustomerId) {
          res.status(400).json({ success: false, message: 'Customer ID or email required' });
          return;
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expires_days);

        const { data: estimate, error: estimateError } = await supabase
          .from('estimates')
          .insert({
            customer_id: finalCustomerId,
            service_type: service_type,
            amount: amount,
            status: 'pending',
            expires_at: expiresAt.toISOString(),
            notes: JSON.stringify({ line_items, original_notes: notes }),
          })
          .select()
          .single();

        if (estimateError) throw estimateError;

        res.status(200).json({
          success: true,
          estimate_id: estimate.id,
          amount: amount,
          expires_at: expiresAt.toISOString(),
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message });
      }
      return;
    }

    if (req.method === 'GET') {
      const estimateId = url.searchParams.get('id');
      const customerId = url.searchParams.get('customer_id');

      if (estimateId) {
        const { data: estimate, error } = await supabase
          .from('estimates')
          .select('*, customers(*)')
          .eq('id', estimateId)
          .single();

        if (error) {
          res.status(404).json({ success: false, message: 'Estimate not found' });
          return;
        }

        res.status(200).json({ success: true, estimate });
        return;
      }

      if (customerId) {
        const { data: estimates, error } = await supabase
          .from('estimates')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });

        if (error) {
          res.status(500).json({ success: false, message: error.message });
          return;
        }

        res.status(200).json({ success: true, estimates });
        return;
      }

      res.status(400).json({ success: false, message: 'Estimate ID or customer ID required' });
      return;
    }

    if (req.method === 'PATCH') {
      try {
        const estimateId = url.searchParams.get('id');
        if (!estimateId) {
          res.status(400).json({ success: false, message: 'Estimate ID required' });
          return;
        }

        const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body as Record<string, unknown>);
        const { status } = body;

        if (!status || !['pending', 'approved', 'rejected', 'expired'].includes(status as string)) {
          res.status(400).json({ success: false, message: 'Valid status required' });
          return;
        }

        const { data: estimate, error } = await supabase
          .from('estimates')
          .update({ status })
          .eq('id', estimateId)
          .select()
          .single();

        if (error) throw error;

        if (status === 'approved') {
          await supabase
            .from('jobs')
            .insert({
              customer_id: estimate.customer_id,
              service_type: estimate.service_type,
              estimate_id: estimate.id,
              total_amount: estimate.amount,
              status: 'scheduled',
            });
        }

        res.status(200).json({ success: true, estimate });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message });
      }
      return;
    }
  }

  res.status(404).json({ success: false, message: 'Endpoint not found' });
}

