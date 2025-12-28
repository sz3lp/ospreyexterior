import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0';
import { corsHeaders } from '../_shared/cors.ts';

interface HubSpotContact {
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  service_type?: string;
  service_area?: string;
  zip_code?: string;
  lead_source?: string;
  job_value_estimate?: number;
  recurring_service?: boolean;
  next_service_date?: string;
}

interface HubSpotDeal {
  dealname: string;
  amount?: string;
  dealstage?: string;
  pipeline?: string;
  service_type?: string;
  service_area?: string;
  hubspot_owner_id?: string;
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

  async function createOrUpdateHubSpotContact(contact: HubSpotContact): Promise<string | null> {
    if (!hubspotApiKey) {
      console.error('HubSpot API key not configured');
      return null;
    }

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
                    value: contact.email,
                  },
                ],
              },
            ],
            properties: ['email', 'firstname', 'lastname', 'phone'],
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

      const properties: Record<string, string | number | boolean> = {
        email: contact.email,
      };

      if (contact.firstname) properties.firstname = contact.firstname;
      if (contact.lastname) properties.lastname = contact.lastname;
      if (contact.phone) properties.phone = contact.phone;
      if (contact.service_type) properties.service_type = contact.service_type;
      if (contact.service_area) properties.service_area = contact.service_area;
      if (contact.zip_code) properties.zip_code = contact.zip_code;
      if (contact.lead_source) properties.lead_source = contact.lead_source;
      if (contact.job_value_estimate) properties.job_value_estimate = contact.job_value_estimate;
      if (contact.recurring_service !== undefined) properties.recurring_service = contact.recurring_service;
      if (contact.next_service_date) properties.next_service_date = contact.next_service_date;

      const url = contactId
        ? `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`
        : 'https://api.hubapi.com/crm/v3/objects/contacts';

      const method = contactId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${hubspotApiKey}`,
        },
        body: JSON.stringify({ properties }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HubSpot API error: ${response.status} - ${errorText}`);
        return null;
      }

      const data = await response.json();
      return data.id || contactId;
    } catch (error) {
      console.error('Error syncing contact to HubSpot:', error);
      return null;
    }
  }

  async function createOrUpdateHubSpotDeal(
    deal: HubSpotDeal,
    contactId: string
  ): Promise<string | null> {
    if (!hubspotApiKey) {
      console.error('HubSpot API key not configured');
      return null;
    }

    try {
      const properties: Record<string, string> = {
        dealname: deal.dealname,
      };

      if (deal.amount) properties.amount = deal.amount;
      if (deal.dealstage) properties.dealstage = deal.dealstage;
      if (deal.pipeline) properties.pipeline = deal.pipeline;
      if (deal.service_type) properties.service_type = deal.service_type;
      if (deal.service_area) properties.service_area = deal.service_area;

      const response = await fetch(
        'https://api.hubapi.com/crm/v3/objects/deals',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${hubspotApiKey}`,
          },
          body: JSON.stringify({
            properties,
            associations: [
              {
                to: { id: contactId },
                types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HubSpot Deal API error: ${response.status} - ${errorText}`);
        return null;
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Error creating deal in HubSpot:', error);
      return null;
    }
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const { leadId, action } = body;

      if (!leadId || !action) {
        return new Response(
          JSON.stringify({ success: false, message: 'Missing leadId or action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (leadError || !lead) {
        return new Response(
          JSON.stringify({ success: false, message: 'Lead not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const nameParts = (lead.full_name || '').split(' ');
      const firstname = nameParts[0] || '';
      const lastname = nameParts.slice(1).join(' ') || '';

      const contact: HubSpotContact = {
        email: lead.email || '',
        firstname,
        lastname,
        phone: lead.phone || undefined,
        service_type: lead.service_type || undefined,
        service_area: lead.city || undefined,
        zip_code: lead.zip || undefined,
        lead_source: lead.utm_source || 'website',
      };

      const hubspotContactId = await createOrUpdateHubSpotContact(contact);

      if (!hubspotContactId) {
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to sync contact to HubSpot' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      await supabase
        .from('leads')
        .update({ hubspot_contact_id: hubspotContactId })
        .eq('id', leadId);

      if (action === 'create_deal' || action === 'sync_all') {
        const deal: HubSpotDeal = {
          dealname: `${lead.service_type || 'Service'} - ${lead.city || 'Unknown'}`,
          dealstage: 'lead',
          service_type: lead.service_type || undefined,
          service_area: lead.city || undefined,
        };

        const dealId = await createOrUpdateHubSpotDeal(deal, hubspotContactId);

        if (dealId) {
          await supabase
            .from('leads')
            .update({ hubspot_deal_id: dealId })
            .eq('id', leadId);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          hubspot_contact_id: hubspotContactId,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('HubSpot sync error:', error);
      return new Response(
        JSON.stringify({ success: false, message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({
        success: true,
        hubspot_configured: !!hubspotApiKey,
        supabase_configured: !!supabase,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: false, message: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});

