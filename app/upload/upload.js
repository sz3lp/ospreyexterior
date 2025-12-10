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
const dropArea = document.getElementById('dropArea');
const browseBtn = document.getElementById('browseBtn');
const fileCount = document.getElementById('fileCount');

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

function createListItem(fileName, variantLabel) {
  const li = document.createElement('li');
  const label = document.createElement('div');
  label.className = 'file-label';
  const nameSpan = document.createElement('span');
  nameSpan.className = 'file-name';
  nameSpan.textContent = fileName;
  const variantSpan = document.createElement('span');
  variantSpan.className = 'variant-label';
  variantSpan.textContent = variantLabel;
  label.appendChild(nameSpan);
  label.appendChild(variantSpan);

  const statusSpan = document.createElement('span');
  statusSpan.className = 'progress-status';
  statusSpan.textContent = 'pending';

  li.appendChild(label);
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

function updateFileCount(count) {
  fileCount.textContent = `${count} file${count === 1 ? '' : 's'}`;
}

function getSelectedFiles(event) {
  const files = event?.dataTransfer?.files || fileInput.files;
  const valid = Array.from(files || []).filter((file) => file.type.startsWith('image/'));
  if (valid.length !== (files ? files.length : 0)) {
    setMessage('Only image files are allowed.', 'error');
  }
  updateFileCount(valid.length);
  return valid;
}

async function processFile(supabase, jobId, file) {
  const variants = [
    { label: 'thumb', maxWidth: 400 },
    { label: 'medium', maxWidth: 800 },
    { label: 'full', maxWidth: 1920 },
  ];

  for (const variant of variants) {
    const statusSpan = createListItem(file.name, `${variant.label} variant`);
    statusSpan.textContent = 'resizing';
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
      originalName: file.name,
    });
    statusSpan.textContent = 'done';
  }
}

async function handleUpload(event) {
  event?.preventDefault();
  setMessage('');
  progressList.innerHTML = '';

  const jobId = jobIdInput.value.trim();
  if (!jobId) {
    setMessage('Enter a job ID before uploading.', 'error');
    return;
  }

  const files = getSelectedFiles(event);
  if (!files || files.length === 0) {
    setMessage('Add one or more photos first.', 'error');
    return;
  }

  let supabase;
  try {
    supabase = ensureSupabase();
  } catch (err) {
    setMessage(err.message, 'error');
    return;
  }

  setStatus('Processing', 'pending');
  uploadBtn.disabled = true;

  try {
    for (const file of files) {
      await processFile(supabase, jobId, file);
    }
    localStorage.setItem(lastJobKey, jobId);
    setStatus('Uploaded', 'success');
    setMessage(`Uploaded ${files.length} file${files.length === 1 ? '' : 's'} with multiple variants.`, 'success');
    fileInput.value = '';
    updateFileCount(0);
  } catch (err) {
    setStatus('Error', 'error');
    setMessage(err.message || 'Upload failed', 'error');
  } finally {
    uploadBtn.disabled = false;
  }
}

uploadBtn.addEventListener('click', handleUpload);
browseBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => updateFileCount(fileInput.files.length));

['dragenter', 'dragover'].forEach((eventName) => {
  dropArea.addEventListener(eventName, (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropArea.classList.add('dragover');
  });
});

['dragleave', 'drop'].forEach((eventName) => {
  dropArea.addEventListener(eventName, (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropArea.classList.remove('dragover');
  });
});

dropArea.addEventListener('drop', (event) => {
  const files = getSelectedFiles(event);
  if (files.length > 0) {
    handleUpload(event);
  }
});
