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
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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

  // METRICS endpoint
  if (endpoint === 'metrics' && req.method === 'GET') {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed')
        .gte('paid_at', startOfMonth.toISOString());

      const totalRevenue = payments?.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0) || 0;

      const { count: totalJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('completed_date', startOfMonth.toISOString());

      const { data: completedJobs } = await supabase
        .from('jobs')
        .select('total_amount')
        .eq('status', 'completed')
        .not('total_amount', 'is', null);

      const avgJobValue = completedJobs && completedJobs.length > 0
        ? completedJobs.reduce((sum, j) => sum + parseFloat(j.total_amount.toString()), 0) / completedJobs.length
        : 0;

      const { count: pendingLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .is('hubspot_contact_id', null);

      const { count: scheduledJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'scheduled');

      res.status(200).json({
        success: true,
        metrics: {
          total_revenue: totalRevenue,
          total_jobs: totalJobs || 0,
          avg_job_value: avgJobValue,
          customer_retention_rate: 0.6, // Placeholder
          pending_leads: pendingLeads || 0,
          scheduled_jobs: scheduledJobs || 0,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, message });
    }
    return;
  }

  // REVENUE-TREND endpoint
  if (endpoint === 'revenue-trend' && req.method === 'GET') {
    try {
      const labels: string[] = [];
      const values: number[] = [];

      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        labels.push(startOfMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));

        const { data: payments } = await supabase
          .from('payments')
          .select('amount')
          .eq('status', 'completed')
          .gte('paid_at', startOfMonth.toISOString())
          .lte('paid_at', endOfMonth.toISOString());

        const revenue = payments?.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0) || 0;
        values.push(revenue);
      }

      res.status(200).json({
        success: true,
        data: { labels, values },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, message });
    }
    return;
  }

  // JOBS-BY-SERVICE endpoint
  if (endpoint === 'jobs-by-service' && req.method === 'GET') {
    try {
      const { data: jobs } = await supabase
        .from('jobs')
        .select('service_type')
        .eq('status', 'completed');

      const serviceCounts: Record<string, number> = {};
      jobs?.forEach(job => {
        const serviceType = job.service_type || 'other';
        serviceCounts[serviceType] = (serviceCounts[serviceType] || 0) + 1;
      });

      res.status(200).json({
        success: true,
        data: {
          labels: Object.keys(serviceCounts),
          values: Object.values(serviceCounts),
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, message });
    }
    return;
  }

  res.status(404).json({ success: false, message: 'Endpoint not found' });
}

