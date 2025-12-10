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
- Drop raw images into `./incoming-photos/`. You can organize by job folder for easy grouping, e.g. `incoming-photos/job-20250114-a3f/filename.jpg`.
- Supported formats: JPG, JPEG, PNG, WEBP, TIFF.
- Filenames should include helpful hints: city, service, descriptors, and ideally a date (YYYYMMDD) plus before/after cues. Example: `bellingham-gutter-cleaning-two-story-before-20250114.jpg`.

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
1. Detect city, service, before/after status, descriptors, story height, and date from filenames and image statistics.
2. Generate SEO filenames like `ospreyexterior-gutter-cleaning-bellingham-two-story-before-20250114-a3f-full.webp`.
3. Produce three sizes per image (full 2400px, medium 1200px, mobile 600px) in WebP.
4. Upload to Supabase Storage at `public/osprey/{service}/{city}/{jobID}/{before|after}/` and return public URLs.
5. Write per-job JSON to `./jobs/{city}/{service}/{jobID}.json` and update `./jobs/index.json` with a thumbnail reference.
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
