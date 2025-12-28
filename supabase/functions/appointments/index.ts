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
    const url = new URL(req.url);
    const customerId = url.searchParams.get('customer_id');
    const appointmentId = url.searchParams.get('id');

    if (appointmentId) {
      const { data: appointment, error } = await supabase
        .from('appointments')
        .select('*, customers(*), jobs(*)')
        .eq('id', appointmentId)
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ success: false, message: 'Appointment not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, appointment }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (customerId) {
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('*, jobs(service_type)')
        .eq('customer_id', customerId)
        .order('scheduled_time', { ascending: true });

      if (error) {
        return new Response(
          JSON.stringify({ success: false, message: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, appointments: appointments || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: 'Appointment ID or customer ID required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: false, message: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});

