#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const chokidar = require('chokidar');
const { createClient } = require('@supabase/supabase-js');

const config = require('./imagePipeline.config');

const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey);
const jobIdsByKey = new Map();

const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const slugify = (value) => normalize(value).replace(/\s+/g, '-');

const ensureDirs = async () => {
  await fs.ensureDir(config.incomingDir);
  await fs.ensureDir(config.processedArchiveDir);
  await fs.ensureDir(config.jobsDir);
};

const listImages = async (dir) => {
  const results = [];
  const walk = async (current) => {
    const entries = await fs.readdir(current);
    for (const entry of entries) {
      const full = path.join(current, entry);
      const stat = await fs.stat(full);
      if (stat.isDirectory()) {
        await walk(full);
      } else {
        const ext = path.extname(entry).toLowerCase();
        if (config.allowedExtensions.includes(ext)) {
          results.push(full);
        }
      }
    }
  };
  await walk(dir);
  return results;
};

const pickService = (tokens) => {
  for (const service of config.services) {
    if (service.keywords.some((keyword) => tokens.includes(keyword))) {
      return service;
    }
  }
  return config.services[0];
};

const pickCity = (tokens) => {
  for (const city of config.cities) {
    if (city.keywords.some((keyword) => tokens.includes(keyword))) {
      return city;
    }
  }
  return config.cities[0];
};

const detectDate = (tokens) => {
  const dateToken = tokens.find((token) => /^(20\d{2})(\d{2})(\d{2})$/.test(token) || /^(20\d{2})-(\d{2})-(\d{2})$/.test(token));
  if (dateToken) {
    const clean = dateToken.replace(/-/g, '');
    return `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}`;
  }
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const detectStoryHeight = (tokens) => {
  if (tokens.some((t) => ['three', '3', '3story', 'three-story', 'triple'].includes(t))) return 'three-story';
  if (tokens.some((t) => ['two', '2', '2story', 'two-story', 'double'].includes(t))) return 'two-story';
  if (tokens.some((t) => ['one', '1', '1story', 'one-story', 'single'].includes(t))) return 'single-story';
  return 'multi-story';
};

const detectDebrisKeywords = (tokens) => {
  const debrisTerms = ['clog', 'clogged', 'debris', 'leaf', 'leafy', 'pine', 'needle', 'moss', 'algae', 'stain', 'overflow', 'sag'];
  return debrisTerms.filter((term) => tokens.includes(term));
};

const detectFlowKeywords = (tokens, service) => {
  const flowTerms = new Set([...(service.flowKeywords || []), 'overflow', 'backed', 'spill', 'drain', 'pooling', 'standing', 'water']);
  return Array.from(flowTerms).filter((term) => tokens.includes(term));
};

const detectRoofCondition = (tokens) => {
  const roofTerms = ['moss', 'algae', 'stain', 'granule', 'shingle', 'metal'];
  return roofTerms.filter((term) => tokens.includes(term));
};

const detectDescriptor = (tokens, service) => {
  const ignored = new Set(['before', 'after', 'pre', 'post', 'clean', 'dirty', 'final', 'done', 'result', 'complete']);
  for (const token of tokens) {
    if (!ignored.has(token) && !service.keywords.includes(token)) {
      return token;
    }
  }
  return service.descriptors[0];
};

const detectBeforeAfter = async (filePath, tokens) => {
  const base = path.basename(filePath).toLowerCase();
  if (config.detection.afterKeywords.some((kw) => base.includes(kw))) return 'after';
  if (config.detection.beforeKeywords.some((kw) => base.includes(kw))) return 'before';

  const image = sharp(filePath);
  const stats = await image.stats();
  const { mean, stdev } = stats.channels.reduce(
    (agg, channel) => {
      return {
        mean: agg.mean + channel.mean,
        stdev: agg.stdev + channel.stdev
      };
    },
    { mean: 0, stdev: 0 }
  );
  const avgMean = mean / stats.channels.length;
  const avgStdev = stdev / stats.channels.length;
  return avgMean > 140 && avgStdev < 60 ? 'after' : 'before';
};

const buildSeoFilename = ({ service, city, descriptor, type, date, uniqueId }) => {
  const descriptorPart = slugify(descriptor || service.slug);
  return `ospreyexterior-${service.slug}-${city.slug}-${descriptorPart}-${type}-${date.replace(/-/g, '')}-${uniqueId}`;
};

const generateAltText = ({ type, city, service, descriptor, storyHeight, debris, flow, roof }) => {
  const conditionPhrase = debris.length
    ? `with ${debris.join(' and ')} blocking drainage`
    : type === 'before'
      ? 'showing debris along the gutter line'
      : 'showing clear gutter channels';
  const flowPhrase = flow.length
    ? `${type === 'before' ? 'noted for' : 'now free of'} ${flow.join(' and ')}`
    : type === 'before'
      ? 'showing slowed water flow'
      : 'restoring smooth water flow';
  const roofPhrase = roof.length
    ? `roof edge showing ${roof.join(' and ')}`
    : 'roofline in stable condition';
  const storyPhrase = storyHeight.replace('-', ' ');

  if (type === 'before') {
    return `${storyPhrase} ${service.name.toLowerCase()} scene in ${city.name} ${conditionPhrase}, ${flowPhrase}, and ${roofPhrase} before service.`;
  }
  return `${storyPhrase} ${service.name.toLowerCase()} result in ${city.name} with clean runs, ${flowPhrase}, and ${roofPhrase} after service.`;
};

const ensureSupabaseReady = () => {
  if (!config.supabase.url || !config.supabase.serviceRoleKey) {
    throw new Error('Supabase credentials are missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }
};

const uploadBuffer = async (buffer, storagePath) => {
  const { error: uploadError } = await supabase.storage
    .from(config.supabase.bucket)
    .upload(storagePath, buffer, {
      cacheControl: '31536000',
      contentType: 'image/webp',
      upsert: true
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(config.supabase.bucket).getPublicUrl(storagePath);
  if (!data || !data.publicUrl) {
    throw new Error(`Failed to retrieve public URL for ${storagePath}`);
  }
  return data.publicUrl;
};

const readIndex = async () => {
  const indexPath = path.join(config.jobsDir, 'index.json');
  if (!(await fs.pathExists(indexPath))) {
    return [];
  }
  return JSON.parse(await fs.readFile(indexPath, 'utf-8'));
};

const writeIndex = async (entries) => {
  const indexPath = path.join(config.jobsDir, 'index.json');
  const sorted = entries.sort((a, b) => new Date(b.date) - new Date(a.date));
  await fs.ensureDir(config.jobsDir);
  await fs.writeFile(indexPath, JSON.stringify(sorted, null, 2));
};

const createJobId = (date, hint) => {
  const uid = crypto.randomBytes(2).toString('hex');
  const hintPart = hint ? `-${slugify(hint).slice(0, 8)}` : '';
  return `job-${date.replace(/-/g, '')}-${uid}${hintPart}`;
};

const processImage = async (filePath) => {
  const relative = path.relative(config.incomingDir, filePath);
  const segments = relative.split(path.sep);
  const parentHint = segments.length > 1 ? segments[segments.length - 2] : '';

  const rawTokens = normalize(path.basename(filePath)).split(' ');
  if (parentHint) {
    rawTokens.push(...normalize(parentHint).split(' '));
  }
  const tokens = rawTokens.filter(Boolean);

  const service = pickService(tokens);
  const city = pickCity(tokens);
  const date = detectDate(tokens);
  const type = await detectBeforeAfter(filePath, tokens);
  const descriptor = detectDescriptor(tokens, service);
  const storyHeight = detectStoryHeight(tokens);
  const debris = detectDebrisKeywords(tokens);
  const flow = detectFlowKeywords(tokens, service);
  const roof = detectRoofCondition(tokens);

  const seoBase = buildSeoFilename({ service, city, descriptor, type, date, uniqueId: crypto.randomBytes(2).toString('hex') });
  const jobHint = segments.length > 1 ? segments[0] : '';
  const jobKey = jobHint || `${city.slug}-${service.slug}-${date}`;
  let jobId = jobIdsByKey.get(jobKey);
  if (!jobId) {
    jobId = jobHint && jobHint.startsWith('job-') ? slugify(jobHint) : createJobId(date, `${city.slug}-${service.slug}`);
    jobIdsByKey.set(jobKey, jobId);
  }

  const sizes = [
    { key: 'full', ...config.imageSettings.full },
    { key: 'medium', ...config.imageSettings.medium },
    { key: 'mobile', ...config.imageSettings.mobile }
  ];

  const uploads = [];
  for (const size of sizes) {
    const resizedBuffer = await sharp(filePath)
      .rotate()
      .resize({ width: size.width, withoutEnlargement: true })
      .webp({ quality: size.quality })
      .toBuffer();

    const remotePath = `osprey/${service.slug}/${city.slug}/${jobId}/${type}/${seoBase}-${size.key}.webp`;
    const publicUrl = await uploadBuffer(resizedBuffer, remotePath);
    uploads.push({
      src: publicUrl,
      alt: generateAltText({ type, city, service, descriptor, storyHeight, debris, flow, roof }),
      size: size.key,
      type
    });
  }

  await archiveOriginal(filePath, jobId);

  return {
    jobId,
    city,
    service,
    date,
    type,
    images: uploads,
    descriptor,
    storyHeight
  };
};

const archiveOriginal = async (filePath, jobId) => {
  const destDir = path.join(config.processedArchiveDir, jobId);
  await fs.ensureDir(destDir);
  const destPath = path.join(destDir, path.basename(filePath));
  await fs.move(filePath, destPath, { overwrite: true });
};

const groupJobs = (processed) => {
  const jobs = new Map();
  for (const item of processed) {
    const existing = jobs.get(item.jobId) || {
      city: item.city,
      service: item.service,
      date: item.date,
      jobID: item.jobId,
      images: []
    };
    existing.images.push(...item.images);
    jobs.set(item.jobId, existing);
  }
  return Array.from(jobs.values());
};

const writeJobFiles = async (jobs) => {
  for (const job of jobs) {
    const cityDir = path.join(config.jobsDir, job.city.slug);
    const serviceDir = path.join(cityDir, job.service.slug);
    await fs.ensureDir(serviceDir);
    const payload = {
      city: job.city.name,
      service: job.service.name,
      date: job.date,
      jobID: job.jobID,
      images: job.images
    };
    const filePath = path.join(serviceDir, `${job.jobID}.json`);
    await fs.writeFile(filePath, JSON.stringify(payload, null, 2));
  }
};

const updateJobIndex = async (jobs) => {
  const current = await readIndex();
  const existingKeys = new Set(current.map((entry) => entry.jobID));
  for (const job of jobs) {
    const firstAfter = job.images.find((img) => img.type === 'after' && img.size === 'medium') || job.images.find((img) => img.type === 'after');
    const thumb = firstAfter ? firstAfter.src : job.images[0]?.src;
    if (existingKeys.has(job.jobID)) {
      const idx = current.findIndex((entry) => entry.jobID === job.jobID);
      current[idx] = { city: job.city.name, service: job.service.name, jobID: job.jobID, date: job.date, thumb };
    } else {
      current.push({ city: job.city.name, service: job.service.name, jobID: job.jobID, date: job.date, thumb });
    }
  }
  await writeIndex(current);
};

const runOnce = async () => {
  await ensureDirs();
  ensureSupabaseReady();
  const files = await listImages(config.incomingDir);
  if (!files.length) {
    console.log('No new images found.');
    return;
  }
  const processed = [];
  for (const file of files) {
    try {
      console.log(`Processing ${file}`);
      const data = await processImage(file);
      processed.push(data);
    } catch (error) {
      console.error(`Failed to process ${file}:`, error.message);
    }
  }
  if (!processed.length) return;
  const jobs = groupJobs(processed);
  await writeJobFiles(jobs);
  await updateJobIndex(jobs);
  console.log(`Finished processing ${processed.length} image(s) across ${jobs.length} job(s).`);
};

const watchAndProcess = async () => {
  await ensureDirs();
  ensureSupabaseReady();
  const watcher = chokidar.watch(config.incomingDir, { ignored: /processed/, persistent: true, ignoreInitial: true });
  watcher.on('add', async (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (!config.allowedExtensions.includes(ext)) return;
    try {
      console.log(`Detected new file ${filePath}`);
      const data = await processImage(filePath);
      const jobs = groupJobs([data]);
      await writeJobFiles(jobs);
      await updateJobIndex(jobs);
    } catch (error) {
      console.error(`Failed to process ${filePath}:`, error.message);
    }
  });
  console.log('Watching for new images...');
};

const args = process.argv.slice(2);
if (args.includes('--watch')) {
  watchAndProcess();
} else {
  runOnce();
}
