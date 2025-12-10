import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.47.0/dist/esm/index.js';

const supabaseUrl = window.__SUPABASE_URL__;
const supabaseKey = window.__SUPABASE_ANON_KEY__;
const supabaseBucket = window.__SUPABASE_BUCKET__ || 'public';

const statusEl = document.getElementById('status');
const messageEl = document.getElementById('messageText');
const progressList = document.getElementById('progressList');
const uploadBtn = document.getElementById('uploadBtn');
const jobIdInput = document.getElementById('jobId');
const fileInput = document.getElementById('photoInput');

const lastJobKey = 'osprey:lastJobId';
const allowedVariants = ['thumb', 'medium', 'full'];

if (localStorage.getItem(lastJobKey)) {
  jobIdInput.value = localStorage.getItem(lastJobKey) || '';
}

function setStatus(text, tone = 'neutral') {
  statusEl.textContent = text;
  statusEl.className = `status ${tone}`;
}

function setMessage(text, tone = 'neutral') {
  messageEl.textContent = text;
  messageEl.className = `message ${tone}`;
}

function ensureSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and anon key must be provided before uploading.');
  }
  return createClient(supabaseUrl, supabaseKey);
}

function createListItem(label) {
  const li = document.createElement('li');
  const nameSpan = document.createElement('span');
  nameSpan.textContent = label;
  const statusSpan = document.createElement('span');
  statusSpan.className = 'progress-status';
  statusSpan.textContent = 'pending';
  li.appendChild(nameSpan);
  li.appendChild(statusSpan);
  progressList.appendChild(li);
  return statusSpan;
}

function resizeImage(file, maxWidth) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            reject(new Error('Unable to create image blob'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        0.9
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image load failed'));
    };
    img.src = url;
  });
}

async function uploadVariant(supabase, jobId, variant, blob) {
  if (!allowedVariants.includes(variant)) {
    throw new Error('Unsupported variant');
  }
  const timestamp = Date.now();
  const filename = `${timestamp}.jpg`;
  const path = `jobs/${jobId}/${variant}/${filename}`;
  const { error } = await supabase.storage
    .from(supabaseBucket)
    .upload(path, blob, { contentType: 'image/jpeg', upsert: false });
  if (error) throw error;
  const { data: publicData } = supabase.storage.from(supabaseBucket).getPublicUrl(path);
  return { filename, url: publicData.publicUrl, variant };
}

async function notifyBackend(payload) {
  const response = await fetch('/api/uploadImage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || 'Failed to record metadata');
  }
  const body = await response.json();
  if (!body.success) {
    throw new Error(body.message || 'Backend rejected metadata');
  }
}

async function handleUpload() {
  setMessage('');
  progressList.innerHTML = '';

  const jobId = jobIdInput.value.trim();
  const file = fileInput.files && fileInput.files[0];

  if (!jobId) {
    setMessage('Enter a job ID before uploading.', 'error');
    return;
  }

  if (!file) {
    setMessage('Capture or select a photo first.', 'error');
    return;
  }

  let supabase;
  try {
    supabase = ensureSupabase();
  } catch (err) {
    setMessage(err.message, 'error');
    return;
  }

  const variants = [
    { label: 'thumb', maxWidth: 400 },
    { label: 'medium', maxWidth: 800 },
    { label: 'full', maxWidth: 1920 },
  ];

  const uploads = [];

  setStatus('Processing', 'pending');
  uploadBtn.disabled = true;

  for (const variant of variants) {
    const statusSpan = createListItem(`${variant.label} variant`);
    statusSpan.textContent = 'resizing';
    try {
      const blob = await resizeImage(file, variant.maxWidth);
      statusSpan.textContent = 'uploading';
      const result = await uploadVariant(supabase, jobId, variant.label, blob);
      statusSpan.textContent = 'recording';
      await notifyBackend({
        jobId,
        filename: result.filename,
        variant: variant.label,
        type: 'photo',
        url: result.url,
      });
      uploads.push(result);
      statusSpan.textContent = 'done';
    } catch (err) {
      statusSpan.textContent = 'error';
      setStatus('Error', 'error');
      setMessage(err.message || 'Upload failed', 'error');
      uploadBtn.disabled = false;
      return;
    }
  }

  localStorage.setItem(lastJobKey, jobId);
  setStatus('Uploaded', 'success');
  setMessage(`Uploaded ${uploads.length} variants.`, 'success');
  fileInput.value = '';
  uploadBtn.disabled = false;
}

uploadBtn.addEventListener('click', handleUpload);
