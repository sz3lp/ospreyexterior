/**
 * Proxy for HubSpot form submissions. Adds client IP, forwards to Forms API,
 * and creates contact via CRM API (form submissions alone often don't create contacts).
 */
const HUBSPOT_PORTAL_ID = '244291121';
const HUBSPOT_FORM_GUID = '198e9b40-f90d-40ca-9a46-4af906a2699d';
const hubspotApiKey = process.env.HUBSPOT_API_KEY || '';

type HttpRequest = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[]>;
};

type HttpResponse = {
  status: (code: number) => HttpResponse;
  json: (body: Record<string, unknown>) => void;
  setHeader?: (name: string, value: string) => void;
};

function applyCors(res: HttpResponse) {
  if (typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}

function getClientIp(headers?: Record<string, string | string[]>): string | undefined {
  if (!headers) return undefined;
  const forwarded = headers['x-forwarded-for'];
  const realIp = headers['x-real-ip'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return String(forwarded[0]).split(',')[0].trim();
  }
  if (typeof realIp === 'string') return realIp;
  if (Array.isArray(realIp) && realIp[0]) return String(realIp[0]);
  return undefined;
}

function getField(fields: { name: string; value: string }[], name: string): string {
  const f = fields.find((x) => x.name === name);
  return (f?.value || '').trim();
}

async function createOrUpdateContact(fields: { name: string; value: string }[]): Promise<string | null> {
  if (!hubspotApiKey) return null;
  const email = getField(fields, 'email');
  const phone = getField(fields, 'phone');
  if (!email && !phone) return null;

  try {
    let contactId: string | null = null;
    const searchProp = email ? 'email' : 'phone';
    const searchVal = email || phone;
    const searchRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${hubspotApiKey}`,
      },
      body: JSON.stringify({
        filterGroups: [{ filters: [{ propertyName: searchProp, operator: 'EQ', value: searchVal }] }],
      }),
    });
    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data.results?.length) contactId = data.results[0].id;
    }

    const properties: Record<string, string> = {};
    if (email) properties.email = email;
    if (phone) properties.phone = phone;
    const firstname = getField(fields, 'firstname');
    const lastname = getField(fields, 'lastname');
    const address = getField(fields, 'address');
    if (firstname) properties.firstname = firstname;
    if (lastname) properties.lastname = lastname;
    if (address) properties.address = address;

    const url = contactId
      ? `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`
      : 'https://api.hubapi.com/crm/v3/objects/contacts';
    const method = contactId ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${hubspotApiKey}`,
      },
      body: JSON.stringify({ properties }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errMsg = (data as { message?: string; errors?: { message?: string }[] })?.message
        || (data as { errors?: { message?: string }[] })?.errors?.[0]?.message
        || JSON.stringify(data);
      throw new Error(`HubSpot CRM ${res.status}: ${errMsg}`);
    }
    return data.id || contactId;
  } catch (err) {
    throw err;
  }
}

async function createDeal(contactId: string, dealname: string): Promise<void> {
  if (!hubspotApiKey) return;
  try {
    await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${hubspotApiKey}`,
      },
      body: JSON.stringify({
        properties: { dealname, dealstage: 'lead' },
        associations: [{
          to: { id: contactId },
          types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }],
        }],
      }),
    });
  } catch {
    /* ignore */
  }
}

export default async function handler(req: HttpRequest, res: HttpResponse) {
  applyCors(res);

  if (req.method === 'OPTIONS') {
    res.status(200).json({ success: true });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body as Record<string, unknown>);
    const { fields, context = {} } = body;

    if (!Array.isArray(fields) || fields.length === 0) {
      res.status(400).json({ success: false, message: 'Missing fields' });
      return;
    }

    const ip = getClientIp(req.headers as Record<string, string | string[]>);
    const contextWithIp = { ...context };
    if (ip) contextWithIp.ipAddress = ip;

    const hubspotRes = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_GUID}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields, context: contextWithIp }),
      }
    );

    const data = await hubspotRes.json().catch(() => ({}));

    if (!hubspotRes.ok) {
      const errMsg = data.errors?.[0]?.message || data.message || 'HubSpot submission failed';
      res.status(hubspotRes.status).json({ success: false, message: errMsg });
      return;
    }

    let contactId: string | null = null;
    try {
      contactId = await createOrUpdateContact(fields);
      if (contactId) {
        const address = getField(fields, 'address');
        const fullName = getField(fields, 'full_name') || `${getField(fields, 'firstname')} ${getField(fields, 'lastname')}`.trim();
        await createDeal(contactId, `Gutter Cleaning - ${address || fullName || 'Lead'}`);
      }
    } catch (contactErr) {
      const msg = contactErr instanceof Error ? contactErr.message : String(contactErr);
      res.status(200).json({ success: true, contactCreated: false, contactError: msg });
      return;
    }

    res.status(200).json({ success: true, contactCreated: !!contactId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
}
