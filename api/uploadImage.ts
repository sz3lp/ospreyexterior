import { createClient } from '@supabase/supabase-js';
import exifParser from 'exif-parser';
import NodeGeocoder from 'node-geocoder';
import sharp from 'sharp';

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

type Payload = {
  jobId?: string;
  filename?: string;
  variant?: string;
  type?: string;
  url?: string;
  objectPath?: string;
  originalName?: string;
};

type ImageAssetInsert = {
  job_id: string;
  filename: string;
  variant: string;
  type: string;
  url: string;
  bucket?: string;
};

type JobRow = {
  job_id: string;
  bucket: string;
  object_path: string;
  filename: string;
  variant: string;
  type: string;
  url: string;
  descriptors?: string[];
  service_type?: string;
  city?: string;
  region?: string;
  zip?: string;
  lat?: number | null;
  lng?: number | null;
  alt_text?: string;
};

const supabaseUrl = process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseBucket = process.env.SUPABASE_BUCKET || 'public';

const supabase =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

const geocoder = NodeGeocoder({ provider: 'openstreetmap' });
const geocodeCache = new Map<string, { city: string; region: string; zip: string; lat: number; lng: number }>();

const allowedVariants = new Set(['thumb', 'medium', 'full']);
const allowedTypes = new Set(['photo']);

function applyCors(res: HttpResponse) {
  if (typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

async function readExif(buffer: Buffer) {
  try {
    const parser = exifParser.create(buffer);
    const result = parser.parse();
    const tags = result.tags || {};
    const ts = tags.DateTimeOriginal || tags.CreateDate || tags.ModifyDate;
    const timestampMs = ts instanceof Date ? ts.getTime() : typeof ts === 'number' ? ts * 1000 : null;
    let lat = tags.GPSLatitude as number | undefined;
    let lng = tags.GPSLongitude as number | undefined;
    if (lat && lng) {
      if (tags.GPSLatitudeRef === 'S') lat = -Math.abs(lat);
      if (tags.GPSLongitudeRef === 'W') lng = -Math.abs(lng);
    }
    return { timestampMs, lat: lat ?? null, lng: lng ?? null };
  } catch (error) {
    console.warn('EXIF parse failed:', error instanceof Error ? error.message : 'unknown error');
    return { timestampMs: null, lat: null, lng: null };
  }
}

async function reverseGeocode(lat: number | null, lng: number | null) {
  if (lat == null || lng == null) return null;
  const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  if (geocodeCache.has(key)) return geocodeCache.get(key)!;
  try {
    const [result] = await geocoder.reverse({ lat, lon: lng });
    if (result) {
      const location = {
        city: result.city || result.town || result.village || 'Unknown',
        region: result.state || result.country || '',
        zip: result.zipcode || '',
        lat,
        lng,
      };
      geocodeCache.set(key, location);
      return location;
    }
  } catch (error) {
    console.warn('Reverse geocoding failed', error instanceof Error ? error.message : error);
  }
  return null;
}

async function analyzeImageContent(buffer: Buffer, tokens: string[]) {
  const image = sharp(buffer);
  const stats = await image.stats();
  const channelMeans = stats.channels.map((c) => c.mean);
  const channelStdevs = stats.channels.map((c) => c.stdev);
  const avgMean = channelMeans.reduce((a, b) => a + b, 0) / channelMeans.length;
  const avgStdev = channelStdevs.reduce((a, b) => a + b, 0) / channelStdevs.length;

  const descriptors: string[] = [];
  const [redMean, greenMean, blueMean] = channelMeans;
  const warmDominance = redMean - blueMean > 18 && greenMean - blueMean > 12;
  const greenDominance = greenMean - (redMean + blueMean) / 2 > 15;

  if (avgMean < 90 && avgStdev > 35) descriptors.push('heavy-clog');
  if (warmDominance && avgMean >= 80 && avgMean <= 175) descriptors.push('granule-build-up');
  if (greenDominance) descriptors.push('moss');

  const overflowTokens = ['overflow', 'spill', 'runoff', 'water', 'pooling'];
  const overflowDetected = overflowTokens.some((t) => tokens.includes(t)) || (blueMean > redMean + 12 && avgStdev > 60);
  if (overflowDetected) descriptors.push('overflow');

  const guardTokens = ['guard', 'screen', 'mesh', 'cover'];
  if (guardTokens.some((t) => tokens.includes(t))) descriptors.push('installed-guard');

  if (avgMean > 155 && avgStdev < 50) descriptors.push('clean-gutter');

  const debrisScore =
    Math.max(0, 255 - avgMean) + avgStdev + (descriptors.includes('heavy-clog') ? 25 : 0) + (descriptors.includes('moss') ? 15 : 0);

  return { descriptors: Array.from(new Set(descriptors)), avgMean, avgStdev, channelMeans, debrisScore };
}

function detectServiceType(analysisDescriptors: string[], channelMeans: number[]) {
  if (analysisDescriptors.includes('moss')) return 'roof-cleaning';
  if (analysisDescriptors.some((d) => ['heavy-clog', 'granule-build-up', 'overflow', 'clean-gutter', 'installed-guard'].includes(d)))
    return 'gutter-cleaning';

  const [red = 0, green = 0, blue = 0] = channelMeans || [];
  const avg = (red + green + blue) / 3;
  const colorSpread = Math.max(red, green, blue) - Math.min(red, green, blue);

  if (avg > 190 && colorSpread < 25) return 'pressure-washing';
  if (colorSpread > 80 && avg > 120) return 'holiday-lighting';
  return 'unknown';
}

function generateAltText({
  type,
  location,
  serviceType,
  descriptor,
}: {
  type: 'before' | 'after';
  location: { city?: string; region?: string } | null;
  serviceType: string;
  descriptor: string;
}) {
  const serviceNames: Record<string, string> = {
    'gutter-cleaning': 'Gutter Cleaning',
    'roof-cleaning': 'Roof Cleaning',
    'pressure-washing': 'Pressure Washing',
    'holiday-lighting': 'Holiday Lighting',
    unknown: 'Exterior Service',
  };
  const serviceName = serviceNames[serviceType] || serviceNames.unknown;
  const descriptorPhrase = descriptor.replace(/-/g, ' ');
  const locality = location?.city && location.city !== 'Unknown' ? `${location.city}${location.region ? `, ${location.region}` : ''}` : 'local area';
  const conditionPhrase = type === 'before' ? 'showing debris and buildup before service' : 'showing restored flow and clean surfaces after service';
  return `${serviceName} ${type} photo in ${locality} highlighting ${descriptorPhrase} ${conditionPhrase}.`;
}

function deriveStoragePath(objectPath?: string, url?: string) {
  if (objectPath) return objectPath;
  if (!url) return '';
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split('/').filter(Boolean);
    const objectIndex = segments.findIndex((segment) => segment === 'object');
    if (objectIndex !== -1 && segments[objectIndex + 2]) {
      const bucketFromUrl = segments[objectIndex + 2];
      const remainder = segments.slice(objectIndex + 3);
      if (bucketFromUrl === supabaseBucket && remainder.length) {
        return remainder.join('/');
      }
    }
  } catch (error) {
    console.warn('Could not derive storage path from URL:', error instanceof Error ? error.message : error);
  }
  return '';
}

async function downloadImage(storagePath: string) {
  const { data, error } = await supabase!.storage.from(supabaseBucket).download(storagePath);
  if (error || !data) {
    throw new Error(error?.message || `Unable to download ${storagePath}`);
  }
  const buffer = Buffer.from(await data.arrayBuffer());
  return buffer;
}

async function upsertJobMetadata(job: JobRow) {
  const { error } = await supabase!.from<JobRow>('jobs_table').upsert(job);
  if (error) {
    throw new Error(error.message);
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

  const { jobId, filename, variant, type, url, objectPath, originalName } = body;

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
    const { error } = await supabase.from<ImageAssetInsert>('image_assets').upsert({
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
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ success: false, message });
    return;
  }

  const storagePath = deriveStoragePath(objectPath, url);
  if (!storagePath) {
    res.status(200).json({ success: true, message: 'Recorded asset without processing (no storage path found)' });
    return;
  }

  if (variant !== 'full') {
    res.status(200).json({ success: true, message: 'Metadata recorded. Processing runs on full images only.' });
    return;
  }

  try {
    const buffer = await downloadImage(storagePath);
    const tokens = normalize(`${filename} ${originalName || ''} ${jobId}`).split(' ').filter(Boolean);
    const exif = await readExif(buffer);
    const location = (await reverseGeocode(exif.lat, exif.lng)) || null;
    const analysis = await analyzeImageContent(buffer, tokens);
    const serviceType = detectServiceType(analysis.descriptors, analysis.channelMeans);
    const descriptor = analysis.descriptors[0] || serviceType || 'exterior';
    const altText = generateAltText({ type: 'after', location, serviceType, descriptor });

    await upsertJobMetadata({
      job_id: jobId,
      bucket: supabaseBucket,
      object_path: storagePath,
      filename,
      variant,
      type,
      url,
      descriptors: analysis.descriptors,
      service_type: serviceType,
      city: location?.city || 'Unknown',
      region: location?.region || '',
      zip: location?.zip || '',
      lat: location?.lat ?? null,
      lng: location?.lng ?? null,
      alt_text: altText,
    });

    res.status(200).json({
      success: true,
      job: {
        jobId,
        serviceType,
        storagePath,
        descriptors: analysis.descriptors,
        city: location?.city || 'Unknown',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error during processing';
    res.status(500).json({ success: false, message });
  }
}
