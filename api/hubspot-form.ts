/**
 * Proxy for HubSpot form submissions. Adds client IP address (required for
 * contact creation and form analytics) and forwards to HubSpot Forms API.
 */
const HUBSPOT_PORTAL_ID = '244291121';
const HUBSPOT_FORM_GUID = '198e9b40-f90d-40ca-9a46-4af906a2699d';

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

    res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
}
