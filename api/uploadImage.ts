import { createClient } from '@supabase/supabase-js';

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

const supabaseUrl = process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseBucket = process.env.SUPABASE_BUCKET || 'public';

const supabase = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

type ImageAssetInsert = {
  job_id: string;
  filename: string;
  variant: string;
  type: string;
  url: string;
  bucket?: string;
};

type Payload = {
  jobId?: string;
  filename?: string;
  variant?: string;
  type?: string;
  url?: string;
};

const allowedVariants = new Set(['thumb', 'medium', 'full']);
const allowedTypes = new Set(['photo']);

function applyCors(res: HttpResponse) {
  if (typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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

  if (!supabase) {
    res.status(500).json({ success: false, message: 'Supabase credentials are missing' });
    return;
  }

  let body: Payload = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body as Payload) || {};
  } catch (parseErr) {
    res.status(400).json({ success: false, message: 'Invalid JSON payload' });
    return;
  }
  const { jobId, filename, variant, type, url } = body;

  if (!jobId || !filename || !variant || !type || !url) {
    res.status(400).json({ success: false, message: 'Missing required fields' });
    return;
  }

  if (!allowedVariants.has(variant)) {
    res.status(400).json({ success: false, message: 'Unsupported variant' });
    return;
  }

  if (!allowedTypes.has(type)) {
    res.status(400).json({ success: false, message: 'Unsupported type' });
    return;
  }

  try {
    const { error } = await supabase.from<ImageAssetInsert>('image_assets').insert({
      job_id: jobId,
      filename,
      variant,
      type,
      url,
      bucket: supabaseBucket,
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
