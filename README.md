# Osprey Exterior Image Pipeline

SA production-ready Node.js workflow that ingests raw photos, detects job metadata automatically, converts to optimized WebP variants, uploads to Supabase Storage, and emits JSON feeds for static HTML components.

## Setup
1. Install dependencies (Node 18+):
   ```bash
   npm install
   ```
2. Configure Supabase credentials in your environment:
   ```bash
   export SUPABASE_URL="https://your-project.supabase.co"
   export SUPABASE_SERVICE_ROLE_KEY="service-role-key"
   ```
3. Confirm the storage bucket `public` exists in Supabase with public access enabled.

## Automatic Job Ingestion
- Drop **any** supported images (JPG, JPEG, PNG, WEBP, TIFF) directly into `./incoming-photos/` (no folders or naming required).
- Run the pipeline (`npm run pipeline`), and the system will:
  - Read EXIF GPS + timestamp (fallback: file creation time).
  - Reverse-geocode GPS to city/region/zip (OpenStreetMap provider).
  - Cluster photos into jobs when they are **<1 mile** and **<4 hours** apart (timestamp-only clustering if GPS is missing).
  - Auto-detect service type with visual heuristics (moss → roof cleaning; brown needle clusters → gutter cleaning; bright concrete whitening → pressure washing; colorful point lights → holiday lighting; otherwise unknown).
  - Score debris to assign **before**/**after** (dirtiest → before, cleanest → after).
  - Generate SEO filenames, three WebP sizes, and Supabase public URLs.
  - Build `/jobs/{jobId}.json` and refresh `/jobs/index.json`.
  - Archive originals to `./incoming-photos/processed/{jobId}/`.

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

## Troubleshooting
- Missing uploads: verify Supabase credentials and that the `public` bucket allows public reads.
- Empty jobs: confirm EXIF timestamps exist or that files have correct creation times; ensure images reside directly in `incoming-photos/` (not inside the `processed` archive).
- Geocode gaps: if GPS is missing, the pipeline falls back to the last known location; otherwise, city is marked as `Unknown`.
