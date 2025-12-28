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

const supabase = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

function applyCors(res: HttpResponse) {
  if (typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
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

  const url = new URL(req.url || '', 'http://localhost');
  let endpoint = url.searchParams.get('endpoint') || '';
  
  if (!endpoint) {
    endpoint = url.pathname.split('/').pop() || '';
  }

  // RECURRING-SERVICES endpoint
  if (endpoint === 'recurring-services' || endpoint === 'recurring') {
    if (req.method === 'POST') {
      try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body as Record<string, unknown>);
        const { customer_id, service_type, frequency, next_service_date, active = true } = body;

        if (!customer_id || !service_type || !frequency || !next_service_date) {
          res.status(400).json({ success: false, message: 'Missing required fields' });
          return;
        }

        const { data: service, error } = await supabase
          .from('recurring_services')
          .insert({
            customer_id,
            service_type,
            frequency,
            next_service_date,
            active,
          })
          .select()
          .single();

        if (error) throw error;

        res.status(200).json({ success: true, service });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message });
      }
      return;
    }

    if (req.method === 'GET') {
      const customerId = url.searchParams.get('customer_id');
      const dueSoon = url.searchParams.get('due_soon') === 'true';

      if (customerId) {
        const { data: services, error } = await supabase
          .from('recurring_services')
          .select('*')
          .eq('customer_id', customerId)
          .eq('active', true)
          .order('next_service_date', { ascending: true });

        if (error) {
          res.status(500).json({ success: false, message: error.message });
          return;
        }

        res.status(200).json({ success: true, services });
        return;
      }

      if (dueSoon) {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);

        const { data: services, error } = await supabase
          .from('recurring_services')
          .select('*, customers(*)')
          .eq('active', true)
          .lte('next_service_date', nextWeek.toISOString().split('T')[0])
          .order('next_service_date', { ascending: true });

        if (error) {
          res.status(500).json({ success: false, message: error.message });
          return;
        }

        res.status(200).json({ success: true, services });
        return;
      }

      const { data: services, error } = await supabase
        .from('recurring_services')
        .select('*, customers(*)')
        .eq('active', true)
        .order('next_service_date', { ascending: true });

      if (error) {
        res.status(500).json({ success: false, message: error.message });
        return;
      }

      res.status(200).json({ success: true, services });
      return;
    }

    if (req.method === 'PATCH') {
      try {
        const serviceId = url.searchParams.get('id');
        if (!serviceId) {
          res.status(400).json({ success: false, message: 'Service ID required' });
          return;
        }

        const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body as Record<string, unknown>);
        
        const { data: service, error } = await supabase
          .from('recurring_services')
          .update(body)
          .eq('id', serviceId)
          .select()
          .single();

        if (error) throw error;

        res.status(200).json({ success: true, service });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message });
      }
      return;
    }

    if (req.method === 'DELETE') {
      try {
        const serviceId = url.searchParams.get('id');
        if (!serviceId) {
          res.status(400).json({ success: false, message: 'Service ID required' });
          return;
        }

        const { error } = await supabase
          .from('recurring_services')
          .update({ active: false })
          .eq('id', serviceId);

        if (error) throw error;

        res.status(200).json({ success: true });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message });
      }
      return;
    }
  }

  res.status(404).json({ success: false, message: 'Endpoint not found' });
}

