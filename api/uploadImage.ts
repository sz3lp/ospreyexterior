import { createClient } from '@supabase/supabase-js';
type HttpRequest = {
  method?: string;
  body?: unknown;
};

type HttpResponse = {
  status: (code: number) => HttpResponse;
  json: (body: Record<string, unknown>) => void;
};

const supabaseUrl = process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL is required');
}

if (!serviceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type ImageAssetInsert = {
  job_id: string;
  filename: string;
  variant: string;
  type: string;
  url: string;
};

type Payload = {
  jobId?: string;
  filename?: string;
  variant?: string;
  type?: string;
  url?: string;
};

export default async function handler(req: HttpRequest, res: HttpResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  let body: Payload = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  } catch (parseErr) {
    res.status(400).json({ success: false, message: 'Invalid JSON payload' });
    return;
  }
  const { jobId, filename, variant, type, url } = body;

  if (!jobId || !filename || !variant || !type || !url) {
    res.status(400).json({ success: false, message: 'Missing required fields' });
    return;
  }

  try {
    const { error } = await supabase.from<ImageAssetInsert>('image_assets').insert({
      job_id: jobId,
      filename,
      variant,
      type,
      url,
    });

    if (error) {
      res.status(500).json({ success: false, message: error.message });
      return;
    }

    res.status(200).json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ success: false, message });
  }
}
