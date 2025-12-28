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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
}

interface HubSpotContact {
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  service_type?: string;
  service_area?: string;
  zip_code?: string;
  lead_source?: string;
}

async function createOrUpdateHubSpotContact(contact: HubSpotContact): Promise<string | null> {
  if (!hubspotApiKey) return null;

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
          filterGroups: [{
            filters: [{
              propertyName: 'email',
              operator: 'EQ',
              value: contact.email,
            }],
          }],
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

    const properties: Record<string, string> = { email: contact.email };
    if (contact.firstname) properties.firstname = contact.firstname;
    if (contact.lastname) properties.lastname = contact.lastname;
    if (contact.phone) properties.phone = contact.phone;
    if (contact.service_type) properties.service_type = contact.service_type;
    if (contact.service_area) properties.service_area = contact.service_area;
    if (contact.zip_code) properties.zip_code = contact.zip_code;
    if (contact.lead_source) properties.lead_source = contact.lead_source;

    const url = contactId
      ? `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`
      : 'https://api.hubapi.com/crm/v3/objects/contacts';

    const response = await fetch(url, {
      method: contactId ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${hubspotApiKey}`,
      },
      body: JSON.stringify({ properties }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.id || contactId;
  } catch (error) {
    console.error('HubSpot contact sync error:', error);
    return null;
  }
}

async function createHubSpotDeal(contactId: string, dealname: string, serviceType?: string): Promise<string | null> {
  if (!hubspotApiKey) return null;

  try {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${hubspotApiKey}`,
      },
      body: JSON.stringify({
        properties: {
          dealname,
          dealstage: 'lead',
          service_type: serviceType,
        },
        associations: [{
          to: { id: contactId },
          types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }],
        }],
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('HubSpot deal creation error:', error);
    return null;
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

  // HUBSPOT-SYNC endpoint
  if (endpoint === 'hubspot-sync' || endpoint === 'hubspot') {
    if (req.method === 'POST') {
      try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body as Record<string, unknown>);
        const { leadId, action } = body;

        if (!leadId || !action) {
          res.status(400).json({ success: false, message: 'Missing leadId or action' });
          return;
        }

        const { data: lead, error: leadError } = await supabase
          .from('leads')
          .select('*')
          .eq('id', leadId)
          .single();

        if (leadError || !lead) {
          res.status(404).json({ success: false, message: 'Lead not found' });
          return;
        }

        const nameParts = (lead.full_name || '').split(' ');
        const contact: HubSpotContact = {
          email: lead.email || '',
          firstname: nameParts[0] || '',
          lastname: nameParts.slice(1).join(' ') || '',
          phone: lead.phone || undefined,
          service_type: lead.service_type || undefined,
          service_area: lead.city || undefined,
          zip_code: lead.zip || undefined,
          lead_source: lead.utm_source || 'website',
        };

        const hubspotContactId = await createOrUpdateHubSpotContact(contact);

        if (!hubspotContactId) {
          res.status(500).json({ success: false, message: 'Failed to sync contact to HubSpot' });
          return;
        }

        await supabase
          .from('leads')
          .update({ hubspot_contact_id: hubspotContactId })
          .eq('id', leadId);

        if (action === 'create_deal' || action === 'sync_all') {
          const dealId = await createHubSpotDeal(
            hubspotContactId,
            `${lead.service_type || 'Service'} - ${lead.city || 'Unknown'}`,
            lead.service_type || undefined
          );

          if (dealId) {
            await supabase
              .from('leads')
              .update({ hubspot_deal_id: dealId })
              .eq('id', leadId);
          }
        }

        res.status(200).json({
          success: true,
          hubspot_contact_id: hubspotContactId,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message });
      }
      return;
    }

    if (req.method === 'GET') {
      res.status(200).json({
        success: true,
        hubspot_configured: !!hubspotApiKey,
        supabase_configured: !!supabase,
      });
      return;
    }
  }

  // HUBSPOT-ANALYTICS endpoint
  if (endpoint === 'hubspot-analytics' && req.method === 'GET') {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const { count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      const { data: jobs } = await supabase
        .from('jobs')
        .select('service_type, total_amount')
        .eq('status', 'completed');

      const serviceRevenue: Record<string, number> = {};
      jobs?.forEach(job => {
        const serviceType = job.service_type || 'other';
        const amount = parseFloat(job.total_amount?.toString() || '0');
        serviceRevenue[serviceType] = (serviceRevenue[serviceType] || 0) + amount;
      });

      res.status(200).json({
        success: true,
        metrics: {
          total_leads: totalLeads || 0,
          conversion_rate: 0.25, // Placeholder
          avg_deal_value: 0,
          email_open_rate: 0.25,
          email_click_rate: 0.05,
        },
        service_revenue_data: {
          labels: Object.keys(serviceRevenue),
          values: Object.values(serviceRevenue),
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

