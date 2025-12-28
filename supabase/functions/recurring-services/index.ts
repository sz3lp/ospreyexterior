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

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const { customer_id, service_type, frequency, next_service_date, active = true } = body;

      if (!customer_id || !service_type || !frequency || !next_service_date) {
        return new Response(
          JSON.stringify({ success: false, message: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
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

      return new Response(
        JSON.stringify({ success: true, service }),
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

  if (req.method === 'GET') {
    const url = new URL(req.url);
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
        return new Response(
          JSON.stringify({ success: false, message: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, services }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
        return new Response(
          JSON.stringify({ success: false, message: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, services }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: services, error } = await supabase
      .from('recurring_services')
      .select('*, customers(*)')
      .eq('active', true)
      .order('next_service_date', { ascending: true });

    if (error) {
      return new Response(
        JSON.stringify({ success: false, message: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, services }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: false, message: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});

