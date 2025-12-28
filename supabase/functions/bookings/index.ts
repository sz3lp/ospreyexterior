import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0';
import { corsHeaders } from '../_shared/cors.ts';

interface BookingPayload {
  service_type: string;
  scheduled_date: string;
  scheduled_time: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const hubspotApiKey = Deno.env.get('HUBSPOT_API_KEY') || '';

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  async function syncBookingToHubSpot(bookingData: BookingPayload, customerId: string, appointmentId: string) {
    if (!hubspotApiKey) return;

    try {
      const searchResponse = await fetch(
        `https://api.hubapi.com/crm/v3/objects/contacts/search`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${hubspotApiKey}`,
          },
          body: JSON.stringify({
            filterGroups: [
              {
                filters: [
                  {
                    propertyName: 'email',
                    operator: 'EQ',
                    value: bookingData.email,
                  },
                ],
              },
            ],
          }),
        }
      );

      let contactId: string | null = null;
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.results && searchData.results.length > 0) {
          contactId = searchData.results[0].id;
        }
      }

      const nameParts = bookingData.full_name.split(' ');
      const properties: Record<string, string> = {
        email: bookingData.email,
        firstname: nameParts[0] || '',
        lastname: nameParts.slice(1).join(' ') || '',
        phone: bookingData.phone,
        service_type: bookingData.service_type,
      };

      const contactUrl = contactId
        ? `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`
        : 'https://api.hubapi.com/crm/v3/objects/contacts';

      const contactResponse = await fetch(contactUrl, {
        method: contactId ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${hubspotApiKey}`,
        },
        body: JSON.stringify({ properties }),
      });

      if (contactResponse.ok) {
        const contactData = await contactResponse.json();
        contactId = contactData.id || contactId;

        const dealResponse = await fetch(
          'https://api.hubapi.com/crm/v3/objects/deals',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${hubspotApiKey}`,
            },
            body: JSON.stringify({
              properties: {
                dealname: `${bookingData.service_type} - ${bookingData.scheduled_date}`,
                dealstage: 'job_scheduled',
                service_type: bookingData.service_type,
              },
              associations: [
                {
                  to: { id: contactId },
                  types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }],
                },
              ],
            }),
          }
        );

        if (dealResponse.ok) {
          const dealData = await dealResponse.json();
          if (supabase && dealData.id) {
            await supabase
              .from('appointments')
              .update({ hubspot_deal_id: dealData.id })
              .eq('id', appointmentId);
          }
        }
      }
    } catch (error) {
      console.error('HubSpot sync error:', error);
    }
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json() as BookingPayload;

      const { service_type, scheduled_date, scheduled_time, full_name, email, phone, address, notes } = body;

      if (!service_type || !scheduled_date || !scheduled_time || !full_name || !email || !phone || !address) {
        return new Response(
          JSON.stringify({ success: false, message: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
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

      syncBookingToHubSpot(body, customer.id, appointment.id).catch(console.error);

      return new Response(
        JSON.stringify({
          success: true,
          appointment_id: appointment.id,
          job_id: job.id,
          customer_id: customer.id,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Booking error:', error);
      return new Response(
        JSON.stringify({ success: false, message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  if (req.method === 'GET') {
    const url = new URL(req.url);
    const date = url.searchParams.get('date');

    if (!date) {
      return new Response(
        JSON.stringify({ success: false, message: 'Date parameter required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        available_slots: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: false, message: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});

