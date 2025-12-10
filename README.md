# Osprey Exterior Image Pipeline

A production-ready Node.js workflow that converts raw job photos into optimized WebP assets, publishes them to Supabase Storage, and outputs JSON feeds for your static HTML components.

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

## Folder Conventions
- Drop raw images into `./incoming-photos/` using **one folder per job** with the pattern `city-service-word2-YYYY-MM-DD`, e.g. `incoming-photos/anacortes-gutter-cleaning-2025-01-14/`.
- The pipeline parses the folder name into city, service, and job date automatically. Job IDs are generated as `job-YYYYMMDD-<shortid>`.
- Supported formats: JPG, JPEG, PNG, WEBP, TIFF.
- Filenames can be anything; tokens still help alt text (e.g., include "overflow" or "moss" if present), but no manual metadata entry is required.

## Running the Pipeline
- One-time run:
  ```bash
  npm run pipeline
  ```
- Continuous watch mode:
  ```bash
  npm run pipeline:watch
  ```

The script will:
1. Detect city, service, date, descriptors, story height, and before/after status automatically from the **job folder name** plus quick image-content analysis (brightness, color dominance, debris heuristics).
2. Generate SEO filenames like `ospreyexterior-gutter-cleaning-bellingham-heavy-clog-before-20250114-a3f-full.webp`.
3. Produce three sizes per image (full 2400px, medium 1200px, mobile 600px) in WebP.
4. Upload to Supabase Storage at `public/osprey/{service}/{city}/{jobID}/{before|after}/` and return public URLs.
5. Auto-build per-job JSON at `./jobs/{city}/{service}/{jobID}.json` (including descriptors and image metadata) and refresh `./jobs/index.json` using the first after-image as the thumbnail.
6. Archive originals to `./incoming-photos/processed/{jobID}/` to avoid reprocessing.

## JSON Output
Per job (`./jobs/{city}/{service}/{jobID}.json`):
```json
{
  "city": "Bellingham",
  "service": "Gutter Cleaning",
  "date": "2025-01-14",
  "jobID": "job-20250114-a3f",
  "images": [
    { "src": "PUBLIC_URL", "alt": "...", "size": "full", "type": "before" },
    { "src": "PUBLIC_URL", "alt": "...", "size": "medium", "type": "before" },
    { "src": "PUBLIC_URL", "alt": "...", "size": "mobile", "type": "before" },
    { "src": "PUBLIC_URL", "alt": "...", "size": "full", "type": "after" }
  ]
}
```

Global index (`./jobs/index.json`):
```json
[
  {
    "city": "Bellingham",
    "service": "Gutter Cleaning",
    "jobID": "job-20250114-a3f",
    "date": "2025-01-14",
    "thumb": "FIRST_AFTER_IMAGE_URL"
  }
]
```

## Alt Text Strategy
The pipeline builds descriptive, SEO-focused alt text using:
- Detected service and city
- Before/after context
- Debris and water-flow keywords from filenames
- Roof condition hints
- Story height phrases

Before shots emphasize the problem (clogging, overflow, staining); after shots highlight restored flow and clean roof edges.

## Autodetection Logic
- **Job metadata**: Folder name `city-service-word2-YYYY-MM-DD` yields city, service, and date; the pipeline auto-generates a job ID (`job-YYYYMMDD-xxxx`).
- **Descriptors**: Quick image statistics drive descriptors: dark, low-light channels → `heavy-clog`; warm sandy tones → `granule-build-up`; green-dominant → `moss`; blue/edge highlights or filename tokens → `overflow`; `guard/mesh` tokens → `installed-guard`; bright/low-variance → `clean-gutter`.
- **Before/after**: Each image gets a debris score (inverse brightness + variance plus organic-weighting). Higher scores become **before**; cleaner scores become **after**. If scores are nearly identical, the first half of images are treated as before and the rest as after.

## Adding Services or Cities
Edit `imagePipeline.config.js`:
- Add to `services` with `slug`, `name`, `keywords`, `descriptors`, and `flowKeywords`.
- Add to `cities` with `slug`, `name`, `state`, and `keywords`.

## HTML Integration
- Use `job-gallery.html` to render a grid of jobs fed by `jobs/index.json`.
- Use `job-slider.html` for a per-job before/after slider. Set `data-before` and `data-after` to the desired image URLs (medium size recommended).

## Troubleshooting
- If uploads fail, ensure service role key is configured and the `public` bucket allows public reads.
- If jobs are missing, verify filenames include city/service cues and that the incoming folder is not empty.
- Archive folder keeps originals; clear it anytime without affecting Supabase assets or JSON output.
