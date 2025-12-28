import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  if (req.method === 'GET') {
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

      const { data: allCustomers } = await supabase
        .from('customers')
        .select('id');

      let repeatCustomers = 0;
      if (allCustomers) {
        for (const customer of allCustomers) {
          const { count } = await supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('customer_id', customer.id)
            .eq('status', 'completed');
          
          if ((count || 0) >= 2) repeatCustomers++;
        }
      }

      const customerRetentionRate = allCustomers && allCustomers.length > 0
        ? repeatCustomers / allCustomers.length
        : 0;

      const { count: pendingLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .is('hubspot_contact_id', null);

      const { count: scheduledJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'scheduled');

      return new Response(
        JSON.stringify({
          success: true,
          metrics: {
            total_revenue: totalRevenue,
            total_jobs: totalJobs || 0,
            avg_job_value: avgJobValue,
            customer_retention_rate: customerRetentionRate,
            pending_leads: pendingLeads || 0,
            scheduled_jobs: scheduledJobs || 0,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return new Response(
        JSON.stringify({ success: false, message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  return new Response(
    JSON.stringify({ success: false, message: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});

