#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const chokidar = require('chokidar');
const exifParser = require('exif-parser');
const NodeGeocoder = require('node-geocoder');
const haversine = require('haversine-distance');
const { createClient } = require('@supabase/supabase-js');

const config = require('./imagePipeline.config');

const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey);
const geocoder = NodeGeocoder(config.geocoder);
const geocodeCache = new Map();
let lastKnownLocation = null;

const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const slugify = (value) => normalize(value).replace(/\s+/g, '-');

const ensureSupabaseReady = () => {
  if (!config.supabase.url || !config.supabase.serviceRoleKey) {
    throw new Error('Supabase credentials are missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }
};

const ensureDirs = async () => {
  await fs.ensureDir(config.incomingDir);
  await fs.ensureDir(config.processedArchiveDir);
  await fs.ensureDir(config.jobsDir);
};

const readExif = async (filePath) => {
  try {
    const buffer = await fs.readFile(filePath);
    const parser = exifParser.create(buffer);
    const result = parser.parse();
    const tags = result.tags || {};
    const ts = tags.DateTimeOriginal || tags.CreateDate || tags.ModifyDate;
    const timestampMs = ts instanceof Date ? ts.getTime() : typeof ts === 'number' ? ts * 1000 : null;
    let lat = tags.GPSLatitude;
    let lng = tags.GPSLongitude;
    if (lat && lng) {
      if (tags.GPSLatitudeRef === 'S') lat = -Math.abs(lat);
      if (tags.GPSLongitudeRef === 'W') lng = -Math.abs(lng);
    }
    return { timestampMs, lat, lng };
  } catch (error) {
    return { timestampMs: null, lat: null, lng: null };
  }
};

const reverseGeocode = async (lat, lng) => {
  if (lat == null || lng == null) return null;
  const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  if (geocodeCache.has(key)) return geocodeCache.get(key);
  try {
    const [result] = await geocoder.reverse({ lat, lon: lng });
    if (result) {
      const location = {
        city: result.city || result.town || result.village || 'Unknown',
        region: result.state || result.country || '',
        zip: result.zipcode || '',
        lat,
        lng
      };
      geocodeCache.set(key, location);
      lastKnownLocation = location;
      return location;
    }
  } catch (error) {
    console.warn('Reverse geocoding failed', error.message);
  }
  return null;
};

const analyzeImageContent = async (filePath, tokens) => {
  const image = sharp(filePath);
  const stats = await image.stats();
  const channelMeans = stats.channels.map((c) => c.mean);
  const channelStdevs = stats.channels.map((c) => c.stdev);
  const avgMean = channelMeans.reduce((a, b) => a + b, 0) / channelMeans.length;
  const avgStdev = channelStdevs.reduce((a, b) => a + b, 0) / channelStdevs.length;

  const descriptors = [];
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

  const debrisScore = Math.max(0, 255 - avgMean) + avgStdev + (descriptors.includes('heavy-clog') ? 25 : 0) + (descriptors.includes('moss') ? 15 : 0);

  return { descriptors: Array.from(new Set(descriptors)), avgMean, avgStdev, channelMeans, debrisScore };
};

const detectServiceType = (analysisDescriptors, channelMeans) => {
  if (analysisDescriptors.includes('moss')) return 'roof-cleaning';
  if (analysisDescriptors.some((d) => ['heavy-clog', 'granule-build-up', 'overflow', 'clean-gutter', 'installed-guard'].includes(d))) return 'gutter-cleaning';

  const [red = 0, green = 0, blue = 0] = channelMeans || [];
  const avg = (red + green + blue) / 3;
  const colorSpread = Math.max(red, green, blue) - Math.min(red, green, blue);

  if (avg > 190 && colorSpread < 25) return 'pressure-washing';
  if (colorSpread > 80 && avg > 120) return 'holiday-lighting';
  return 'unknown';
};

const buildSeoFilename = ({ serviceType, cityName, descriptor, type, date, uniqueId }) => {
  const descriptorPart = slugify(descriptor || serviceType || 'exterior');
  const cityPart = cityName ? slugify(cityName) : 'unknown-city';
  const servicePart = serviceType ? slugify(serviceType) : 'service';
  return `ospreyexterior-${servicePart}-${cityPart}-${descriptorPart}-${type}-${date.replace(/-/g, '')}-${uniqueId}`;
};

const generateAltText = ({ type, location, serviceType, descriptor }) => {
  const serviceName = config.serviceTypeNames[serviceType] || config.serviceTypeNames.unknown;
  const descriptorPhrase = descriptor ? descriptor.replace(/-/g, ' ') : serviceName.toLowerCase();
  const locality = location?.city && location.city !== 'Unknown' ? `${location.city}${location.region ? `, ${location.region}` : ''}` : 'local area';
  const conditionPhrase = type === 'before' ? 'showing debris and buildup before service' : 'showing restored flow and clean surfaces after service';
  return `${serviceName} ${type} photo in ${locality} highlighting ${descriptorPhrase} ${conditionPhrase}.`;
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

const recordImageAsset = async ({ jobId, url, filename, variant, type }) => {
  try {
    const { error } = await supabase.from('image_assets').upsert({
      job_id: jobId,
      url,
      filename,
      variant,
      type
    });
    if (error) {
      console.warn(`Failed to insert image asset for ${filename}: ${error.message}`);
    }
  } catch (error) {
    console.warn(`Supabase insert failed for ${filename}: ${error.message}`);
  }
};

const archiveOriginal = async (filePath, jobId) => {
  const destDir = path.join(config.processedArchiveDir, jobId);
  await fs.ensureDir(destDir);
  const destPath = path.join(destDir, path.basename(filePath));
  await fs.move(filePath, destPath, { overwrite: true });
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
  const uid = crypto.randomBytes(3).toString('hex');
  return `job-${date.replace(/-/g, '')}-${uid}`;
};

const listIncomingImages = async () => {
  const entries = await fs.readdir(config.incomingDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(config.incomingDir, entry.name))
    .filter((file) => !file.includes('processed'))
    .filter((file) => config.allowedExtensions.includes(path.extname(file).toLowerCase()));
  return files;
};

const collectPhotoMetadata = async (filePath) => {
  const tokens = normalize(path.basename(filePath)).split(' ').filter(Boolean);
  const exif = await readExif(filePath);
  const stats = await fs.stat(filePath);
  const timestampMs = exif.timestampMs || stats.birthtimeMs || stats.mtimeMs;
  const location = (await reverseGeocode(exif.lat, exif.lng)) || lastKnownLocation || null;
  const analysis = await analyzeImageContent(filePath, tokens);
  return {
    filePath,
    tokens,
    timestampMs,
    location,
    analysis,
    lat: exif.lat,
    lng: exif.lng
  };
};

const clusterPhotos = (photos) => {
  if (!photos.length) return [];
  const sorted = [...photos].sort((a, b) => a.timestampMs - b.timestampMs);
  const jobs = [];
  let current = [];

  const withinThreshold = (a, b) => {
    const timeDiff = Math.abs(a.timestampMs - b.timestampMs);
    if (timeDiff > config.clustering.maxMs) return false;
    if (a.lat == null || a.lng == null || b.lat == null || b.lng == null) return true;
    const meters = haversine({ lat: a.lat, lon: a.lng }, { lat: b.lat, lon: b.lng });
    const miles = meters / 1609.34;
    return miles < config.clustering.maxMiles;
  };

  for (const photo of sorted) {
    if (!current.length) {
      current.push(photo);
      continue;
    }
    const last = current[current.length - 1];
    if (withinThreshold(photo, last)) {
      current.push(photo);
    } else {
      jobs.push(current);
      current = [photo];
    }
  }
  if (current.length) jobs.push(current);
  return jobs;
};

const assignBeforeAfterByDebris = (analyses) => {
  if (!analyses.length) return [];
  const ordered = analyses
    .map((item, index) => ({ index, debrisScore: item.analysis.debrisScore }))
    .sort((a, b) => b.debrisScore - a.debrisScore);
  const midpoint = Math.ceil(analyses.length / 2);
  const assignment = new Array(analyses.length).fill('after');
  for (let i = 0; i < ordered.length; i++) {
    assignment[ordered[i].index] = i < midpoint ? 'before' : 'after';
  }
  return assignment;
};

const processJob = async (jobPhotos) => {
  const startTime = Math.min(...jobPhotos.map((p) => p.timestampMs));
  const endTime = Math.max(...jobPhotos.map((p) => p.timestampMs));
  const date = new Date(startTime).toISOString().slice(0, 10);
  const jobId = createJobId(date);

  const locationFromPhotos = jobPhotos.find((p) => p.location)?.location || null;
  const location = locationFromPhotos || lastKnownLocation || { city: 'Unknown', region: '', zip: '', lat: null, lng: null };
  if (location && location.city && location.city !== 'Unknown') {
    lastKnownLocation = location;
  }

  const aggregatedDescriptors = new Set();
  let lastChannelMeans = null;
  jobPhotos.forEach((p) => {
    p.analysis.descriptors.forEach((d) => aggregatedDescriptors.add(d));
    lastChannelMeans = p.analysis.channelMeans;
  });
  const serviceType = detectServiceType(Array.from(aggregatedDescriptors), lastChannelMeans);

  const typeAssignments = assignBeforeAfterByDebris(jobPhotos);
  const allPhotos = [];
  const beforePhotos = [];
  const afterPhotos = [];

  for (let i = 0; i < jobPhotos.length; i++) {
    const photo = jobPhotos[i];
    const type = typeAssignments[i];
    const descriptor = photo.analysis.descriptors[0] || 'exterior';
    const sizes = [
      { key: 'full', ...config.imageSettings.full },
      { key: 'medium', ...config.imageSettings.medium },
      { key: 'mobile', ...config.imageSettings.mobile }
    ];

    const seoBase = buildSeoFilename({
      serviceType,
      cityName: location.city,
      descriptor,
      type,
      date,
      uniqueId: crypto.randomBytes(2).toString('hex')
    });

    for (const size of sizes) {
      const resizedBuffer = await sharp(photo.filePath)
        .rotate()
        .resize({ width: size.width, withoutEnlargement: true })
        .webp({ quality: size.quality })
        .toBuffer();

      const filename = `${seoBase}-${size.key}.webp`;
      const remotePath = `public/${jobId}/${filename}`;
      const publicUrl = await uploadBuffer(resizedBuffer, remotePath);

      const entry = {
        src: publicUrl,
        alt: generateAltText({ type, location, serviceType, descriptor }),
        size: size.key,
        type
      };

      allPhotos.push(entry);
      if (type === 'before' && size.key === 'full') beforePhotos.push(entry);
      if (type === 'after' && size.key === 'full') afterPhotos.push(entry);
      await recordImageAsset({ jobId, url: publicUrl, filename, variant: size.key, type });
    }

    await archiveOriginal(photo.filePath, jobId);
  }

  const payload = {
    job_id: jobId,
    city: location.city || 'Unknown',
    region: location.region || '',
    zip: location.zip || '',
    lat: location.lat ?? null,
    lng: location.lng ?? null,
    service_type: serviceType,
    start_time: startTime,
    end_time: endTime,
    before: beforePhotos,
    after: afterPhotos,
    all_photos: allPhotos
  };

  const jobPath = path.join(config.jobsDir, `${jobId}.json`);
  await fs.ensureDir(config.jobsDir);
  await fs.writeFile(jobPath, JSON.stringify(payload, null, 2));
  return { payload, jobId, date, serviceType, thumb: afterPhotos[0]?.src || allPhotos[0]?.src || '' };
};

const updateJobIndex = async (jobs) => {
  const current = await readIndex();
  const existingKeys = new Set(current.map((entry) => entry.jobID || entry.job_id));
  for (const job of jobs) {
    const record = {
      city: job.payload.city,
      service: job.payload.service_type,
      jobID: job.payload.job_id,
      date: job.date,
      thumb: job.thumb
    };
    if (existingKeys.has(record.jobID)) {
      const idx = current.findIndex((entry) => entry.jobID === record.jobID || entry.job_id === record.jobID);
      current[idx] = record;
    } else {
      current.push(record);
    }
  }
  await writeIndex(current);
};

const runPipeline = async () => {
  await ensureDirs();
  ensureSupabaseReady();
  const incomingFiles = await listIncomingImages();
  if (!incomingFiles.length) {
    console.log('No new images found.');
    return;
  }

  const photoMetadata = [];
  for (const file of incomingFiles) {
    try {
      const meta = await collectPhotoMetadata(file);
      photoMetadata.push(meta);
    } catch (error) {
      console.error(`Failed to collect metadata for ${file}: ${error.message}`);
    }
  }

  const jobGroups = clusterPhotos(photoMetadata);
  if (!jobGroups.length) {
    console.log('No jobs detected.');
    return;
  }

  const processedJobs = [];
  for (const group of jobGroups) {
    try {
      const jobResult = await processJob(group);
      processedJobs.push(jobResult);
    } catch (error) {
      console.error('Failed to process job group:', error.message);
    }
  }

  if (processedJobs.length) {
    await updateJobIndex(processedJobs);
    console.log(`Finished processing ${processedJobs.length} job(s).`);
  }
};

const watchAndProcess = async () => {
  await ensureDirs();
  ensureSupabaseReady();
  const watcher = chokidar.watch(config.incomingDir, { ignored: /processed/, persistent: true, ignoreInitial: true });
  watcher.on('add', async () => {
    try {
      await runPipeline();
    } catch (error) {
      console.error('Watch pipeline failed:', error.message);
    }
  });
  console.log('Watching for new images...');
};

const args = process.argv.slice(2);
if (args.includes('--watch')) {
  watchAndProcess();
} else {
  runPipeline();
}
