import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID') || '';
  const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN') || '';
  const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER') || '';
  const hubspotApiKey = Deno.env.get('HUBSPOT_API_KEY') || '';

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  async function sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.error('Twilio not configured');
      return false;
    }

    try {
      const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: twilioPhoneNumber,
            To: phoneNumber,
            Body: message,
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('SMS send error:', error);
      return false;
    }
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const { to, message, appointment_id, job_id, log_to_hubspot = true } = body;

      if (!to || !message) {
        return new Response(
          JSON.stringify({ success: false, message: 'Phone number and message required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const sent = await sendSMS(to, message);

      if (!sent) {
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to send SMS' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'SMS sent successfully' }),
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

