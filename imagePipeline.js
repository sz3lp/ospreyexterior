#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const chokidar = require('chokidar');
const { createClient } = require('@supabase/supabase-js');

const config = require('./imagePipeline.config');

const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey);
const jobIdsByFolder = new Map();

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

const pickService = (tokens, fallbackSlug) => {
  if (fallbackSlug) {
    const match = config.services.find((service) => service.slug === fallbackSlug);
    if (match) return match;
  }
  for (const service of config.services) {
    if (service.keywords.some((keyword) => tokens.includes(keyword))) {
      return service;
    }
  }
  return config.services[0];
};

const pickCity = (tokens, fallbackSlug) => {
  if (fallbackSlug) {
    const match = config.cities.find((city) => city.slug === fallbackSlug);
    if (match) return match;
  }
  for (const city of config.cities) {
    if (city.keywords.some((keyword) => tokens.includes(keyword))) {
      return city;
    }
  }
  return config.cities[0];
};

const detectDate = (tokens, fallback) => {
  if (fallback && /^(20\d{2})-(\d{2})-(\d{2})$/.test(fallback)) return fallback;
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

const detectDescriptorFromTokens = (tokens, service) => {
  const ignored = new Set(['before', 'after', 'pre', 'post', 'clean', 'dirty', 'final', 'done', 'result', 'complete']);
  for (const token of tokens) {
    if (!ignored.has(token) && !service.keywords.includes(token)) {
      return token;
    }
  }
  return service.descriptors[0];
};

const buildSeoFilename = ({ service, city, descriptor, type, date, uniqueId }) => {
  const descriptorPart = slugify(descriptor || service.slug);
  return `ospreyexterior-${service.slug}-${city.slug}-${descriptorPart}-${type}-${date.replace(/-/g, '')}-${uniqueId}`;
};

const generateAltText = ({ type, city, service, descriptor, storyHeight, debris, flow, roof }) => {
  const descriptorPhrase = descriptor ? descriptor.replace(/-/g, ' ') : service.slug.replace(/-/g, ' ');
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
    return `${storyPhrase} ${service.name.toLowerCase()} scene in ${city.name} ${conditionPhrase}, ${flowPhrase}, ${roofPhrase}, highlighting ${descriptorPhrase} before service.`;
  }
  return `${storyPhrase} ${service.name.toLowerCase()} result in ${city.name} with clean runs, ${flowPhrase}, ${roofPhrase}, emphasizing ${descriptorPhrase} after service.`;
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

const createJobId = (date) => {
  const uid = crypto.randomBytes(2).toString('hex');
  return `job-${date.replace(/-/g, '')}-${uid}`;
};

const parseJobFromFolder = (folderName) => {
  const parts = folderName.split('-').filter(Boolean);
  if (parts.length < 4) {
    return null;
  }
  const citySlug = parts[0];
  const serviceSlug = `${parts[1]}-${parts[2]}`;
  const datePart = parts.slice(3).join('-');
  return { citySlug, serviceSlug, date: datePart };
};

const analyzeImageContent = async (filePath, tokens) => {
  const image = sharp(filePath);
  const stats = await image.stats();
  const channelMeans = stats.channels.map((c) => c.mean);
  const channelStdevs = stats.channels.map((c) => c.stdev);
  const avgMean = channelMeans.reduce((a, b) => a + b, 0) / channelMeans.length;
  const avgStdev = channelStdevs.reduce((a, b) => a + b, 0) / channelStdevs.length;

  const descriptors = [];
  const redMean = channelMeans[0];
  const greenMean = channelMeans[1];
  const blueMean = channelMeans[2];
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

  const debrisScore = Math.max(0, 255 - avgMean) + avgStdev + (descriptors.includes('heavy-clog') ? 25 : 0) + (descriptors.includes('moss') ? 15 : 0);

  return { descriptors: Array.from(new Set(descriptors)), avgMean, avgStdev, debrisScore };
};

const assignBeforeAfterByDebris = (analyses) => {
  if (!analyses.length) return [];
  const scores = analyses.map((item) => item.debrisScore);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const ordered = analyses
    .map((item, index) => ({ index, debrisScore: item.debrisScore }))
    .sort((a, b) => b.debrisScore - a.debrisScore);
  const midpoint = Math.ceil(analyses.length / 2);

  const assignment = new Array(analyses.length).fill('after');
  if (maxScore - minScore < 5) {
    const firstHalf = Math.floor(analyses.length / 2);
    for (let i = 0; i < analyses.length; i++) {
      if (i < firstHalf) assignment[i] = 'before';
    }
    if (analyses.length % 2 !== 0) assignment[firstHalf] = 'before';
    return assignment;
  }

  for (let i = 0; i < ordered.length; i++) {
    const targetType = i < midpoint ? 'before' : 'after';
    assignment[ordered[i].index] = targetType;
  }
  return assignment;
};

const processJobFolder = async (folderPath) => {
  const folderName = path.basename(folderPath);
  const parsed = parseJobFromFolder(folderName);
  if (!parsed) {
    console.warn(`Skipping ${folderName}: folder name must follow city-service1-service2-YYYY-MM-DD pattern.`);
    return null;
  }

  const rawTokens = normalize(folderName).split(' ');
  const city = pickCity(rawTokens, parsed.citySlug);
  const service = pickService(rawTokens, parsed.serviceSlug);
  const date = detectDate(rawTokens, parsed.date);
  const jobId = jobIdsByFolder.get(folderPath) || createJobId(date);
  jobIdsByFolder.set(folderPath, jobId);

  const files = await listImages(folderPath);
  if (!files.length) {
    console.log(`No images found in ${folderPath}`);
    return null;
  }

  const analyses = [];
  for (const filePath of files) {
    const tokens = normalize(`${path.basename(filePath)} ${folderName}`).split(' ').filter(Boolean);
    const contentAnalysis = await analyzeImageContent(filePath, tokens);
    analyses.push({ filePath, tokens, ...contentAnalysis });
  }

  const typeAssignments = assignBeforeAfterByDebris(analyses);
  const allDescriptors = new Set();
  const imageEntries = [];

  for (let i = 0; i < analyses.length; i++) {
    const { filePath, tokens, descriptors, avgMean, avgStdev } = analyses[i];
    descriptors.forEach((d) => allDescriptors.add(d));
    const type = typeAssignments[i];
    const descriptorFromTokens = detectDescriptorFromTokens(tokens, service);
    const descriptor = descriptors[0] || descriptorFromTokens;
    if (descriptor) allDescriptors.add(descriptor);
    const storyHeight = detectStoryHeight(tokens);
    const debris = detectDebrisKeywords(tokens);
    const flow = detectFlowKeywords(tokens, service);
    const roof = detectRoofCondition(tokens);

    const sizes = [
      { key: 'full', ...config.imageSettings.full },
      { key: 'medium', ...config.imageSettings.medium },
      { key: 'mobile', ...config.imageSettings.mobile }
    ];

    const seoBase = buildSeoFilename({
      service,
      city,
      descriptor,
      type,
      date,
      uniqueId: crypto.randomBytes(2).toString('hex')
    });

    for (const size of sizes) {
      const resizedBuffer = await sharp(filePath)
        .rotate()
        .resize({ width: size.width, withoutEnlargement: true })
        .webp({ quality: size.quality })
        .toBuffer();

      const remotePath = `osprey/${service.slug}/${city.slug}/${jobId}/${type}/${seoBase}-${size.key}.webp`;
      const publicUrl = await uploadBuffer(resizedBuffer, remotePath);
      imageEntries.push({
        src: publicUrl,
        alt: generateAltText({ type, city, service, descriptor, storyHeight, debris, flow, roof }),
        size: size.key,
        type
      });
    }

    await archiveOriginal(filePath, jobId);

    if (avgMean > 0 || avgStdev > 0) {
      // No-op: ensures eslint/linters see stats usage
    }
  }

  return {
    city,
    service,
    date,
    jobID: jobId,
    descriptors: Array.from(allDescriptors),
    images: imageEntries
  };
};

const archiveOriginal = async (filePath, jobId) => {
  const destDir = path.join(config.processedArchiveDir, jobId);
  await fs.ensureDir(destDir);
  const destPath = path.join(destDir, path.basename(filePath));
  await fs.move(filePath, destPath, { overwrite: true });
};

const writeJobFiles = async (jobs) => {
  for (const job of jobs) {
    const cityDir = path.join(config.jobsDir, job.city.slug);
    const serviceDir = path.join(cityDir, job.service.slug);
    await fs.ensureDir(serviceDir);
    const payload = {
      city: job.city.slug,
      service: job.service.slug,
      date: job.date,
      jobID: job.jobID,
      descriptors: job.descriptors,
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
      current[idx] = { city: job.city.slug, service: job.service.slug, jobID: job.jobID, date: job.date, thumb };
    } else {
      current.push({ city: job.city.slug, service: job.service.slug, jobID: job.jobID, date: job.date, thumb });
    }
  }
  await writeIndex(current);
};

const runOnce = async () => {
  await ensureDirs();
  ensureSupabaseReady();
  const entries = await fs.readdir(config.incomingDir);
  const jobFolders = entries
    .map((entry) => path.join(config.incomingDir, entry))
    .filter((fullPath) => fs.statSync(fullPath).isDirectory() && !fullPath.includes('processed'));

  if (!jobFolders.length) {
    console.log('No new job folders found.');
    return;
  }

  const processedJobs = [];
  for (const folder of jobFolders) {
    try {
      console.log(`Processing job folder ${folder}`);
      const job = await processJobFolder(folder);
      if (job) processedJobs.push(job);
    } catch (error) {
      console.error(`Failed to process folder ${folder}:`, error.message);
    }
  }

  if (!processedJobs.length) return;
  await writeJobFiles(processedJobs);
  await updateJobIndex(processedJobs);
  console.log(`Finished processing ${processedJobs.length} job(s).`);
};

const watchAndProcess = async () => {
  await ensureDirs();
  ensureSupabaseReady();
  const watcher = chokidar.watch(config.incomingDir, { ignored: /processed/, persistent: true, ignoreInitial: true });
  watcher.on('add', async (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (!config.allowedExtensions.includes(ext)) return;
    if (filePath.includes('processed')) return;
    try {
      const folderPath = path.dirname(filePath);
      console.log(`Detected new file ${filePath}, processing folder ${folderPath}`);
      const job = await processJobFolder(folderPath);
      if (job) {
        await writeJobFiles([job]);
        await updateJobIndex([job]);
      }
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
