# Osprey Exterior Image Pipeline

A production-ready Node.js workflow that ingests raw photos, detects job metadata automatically, converts to optimized WebP variants, uploads to Supabase Storage, and emits JSON feeds for static HTML components.

> **Vercel-friendly ingest**: The `/api/uploadImage` serverless function now performs the same detection work without relying on the local file system. Field uploads land in Supabase Storage, and the serverless function downloads the `full` variant, analyzes it, and records metadata into a `jobs_table` row you can drive with Supabase triggers.

## Setup
1. Install dependencies (Node 18+):
   ```bash
   npm install
   ```
2. Configure Supabase credentials in your environment:
   ```bash
   export SUPABASE_URL="https://your-project.supabase.co"
   export SUPABASE_SERVICE_ROLE_KEY="service-role-key"
   export SUPABASE_BUCKET="public" # optional if you use a different bucket
   ```
3. Confirm the storage bucket `public` exists in Supabase with public access enabled.

## Serverless flow on Vercel + Supabase
1. Field techs upload directly to Supabase Storage (e.g., via `app/upload/`).
2. Each upload calls `/api/uploadImage` with the storage object path.
3. The function records the asset in `image_assets`, downloads the `full` image, runs the same image heuristics, and upserts a metadata row into `jobs_table` (`job_id`, `bucket`, `object_path`, `service_type`, descriptors, city/region/zip/lat/lng, `alt_text`).
4. Add a Supabase trigger (or cron) that listens to `jobs_table` inserts/updates to fan out work (e.g., build public JSON, notify a worker, or update a CDN feed). This replaces the local batch job that previously wrote `jobs/{jobId}.json`.

## Automatic Job Ingestion
- **Preferred (cloud)**: Let Supabase Storage + `/api/uploadImage` handle processing as described above. Use Supabase triggers to distribute JSON or notifications from `jobs_table`.
- **Legacy local batch**: Drop supported images (JPG, JPEG, PNG, WEBP, TIFF) into `./incoming-photos/` and run `npm run pipeline` to execute the original file-system workflow (EXIF parsing, clustering, JSON writing, archive of originals, etc.).

## Running the Pipeline
- One-time run:
  ```bash
  npm run pipeline
  ```
- Continuous watch mode:
  ```bash
  npm run pipeline:watch
  ```

## Storage Layout
- Supabase uploads: `public/{jobId}/{filename}.webp` (variants: full/medium/mobile).
- Originals archived at `./incoming-photos/processed/{jobId}/`.

## JSON Output
Per job (`./jobs/{jobId}.json`):
```json
{
  "job_id": "job-20250114-a3f29",
  "city": "Bellingham",
  "region": "Washington",
  "zip": "98225",
  "lat": 48.7423,
  "lng": -122.4781,
  "service_type": "gutter-cleaning",
  "start_time": 1736898322000,
  "end_time": 1736900028000,
  "before": [{ "src": "...", "alt": "...", "size": "full", "type": "before" }],
  "after": [{ "src": "...", "alt": "...", "size": "full", "type": "after" }],
  "all_photos": [{ "src": "...", "alt": "...", "size": "full", "type": "before" }, { "src": "...", "size": "medium", "type": "before" }]
}
```

Global index (`./jobs/index.json`):
```json
[
  {
    "city": "Bellingham",
    "service": "gutter-cleaning",
    "jobID": "job-20250114-a3f29",
    "date": "2025-01-14",
    "thumb": "FIRST_AFTER_IMAGE_URL"
  }
]
```

## Alt Text Strategy
- Descriptive SEO phrasing leveraging detected service type, locality (city/region), and before/after context.
- Debris-focused language for before shots; clean/flow-focused language for after shots.

## Detection Logic
- **Clustering:** Photos are grouped into a job when they are captured within 4 hours and within 1 mile (distance check skipped if GPS is missing; timestamp-only clustering used instead).
- **Location:** EXIF GPS → reverse geocode → city/region/zip; if absent, reuse the last known location; otherwise city becomes `Unknown`.
- **Service:** Visual heuristics—moss → roof cleaning; heavy debris/granules/guards → gutter cleaning; bright uniform whitening → pressure washing; high color spread with bright means → holiday lighting; fallback `unknown`.
- **Descriptors:** Image statistics drive descriptors (heavy-clog, granule-build-up, moss, overflow, installed-guard, clean-gutter).
- **Before/after:** Debris score ranks images (dirtiest → before, cleanest → after).

## HTML Integration
- Use `job-gallery.html` to render a grid of jobs fed by `jobs/index.json`.
- Use `job-slider.html` for per-job before/after sliders. Set `data-before` and `data-after` to desired URLs (medium size recommended).

## Mobile Upload Console
- Location: `app/upload/index.html` (style + JS alongside).
- Configure Supabase values in the `<head>` (or inject via your host) before loading `upload.js`:
  ```html
  <script>
    window.__SUPABASE_URL__ = 'https://your-project.supabase.co';
    window.__SUPABASE_ANON_KEY__ = 'anon-public-key';
    window.__SUPABASE_BUCKET__ = 'public';
  </script>
  ```
- On your phone, open `/app/upload/`, enter a `job-...` ID, and capture a photo (rear camera enforced). The UI compresses to thumb/medium/full JPEGs, uploads to `jobs/{jobId}/{variant}/{timestamp}.jpg`, and posts metadata (including the storage object path) to `/api/uploadImage` for serverless processing.
- Progress indicators update per variant; errors surface inline. The last-used job ID persists locally for quicker field use.
- If Supabase globals are missing at load time, the page will fetch `/api/uploadConfig` (anon key + bucket) and show a clear error if credentials are not present in the environment.

## Troubleshooting
- Missing uploads: verify Supabase credentials and that the `public` bucket allows public reads.
- Empty jobs: confirm EXIF timestamps exist or that files have correct creation times; ensure images reside directly in `incoming-photos/` (not inside the `processed` archive).
- Geocode gaps: if GPS is missing, the pipeline falls back to the last known location; otherwise, city is marked as `Unknown`.
