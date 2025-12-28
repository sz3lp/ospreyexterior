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
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || '';
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || '';
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '';

const supabase = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

function applyCors(res: HttpResponse) {
  if (typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
}

async function sendSMS(phoneNumber: string, message: string): Promise<boolean> {
  if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
    console.error('Twilio not configured');
    return false;
  }

  try {
    const auth = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');
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

  // SMS-AUTOMATION endpoint
  if ((endpoint === 'sms-automation' || endpoint === 'sms') && req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body as Record<string, unknown>);
      const { to, message } = body;

      if (!to || !message) {
        res.status(400).json({ success: false, message: 'Phone number and message required' });
        return;
      }

      const sent = await sendSMS(to, message);

      if (!sent) {
        res.status(500).json({ success: false, message: 'Failed to send SMS' });
        return;
      }

      res.status(200).json({ success: true, message: 'SMS sent successfully' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, message });
    }
    return;
  }

  res.status(404).json({ success: false, message: 'Endpoint not found' });
}

