# Indexing Report Fix Plan – Osprey Exterior

**Report date:** 2026-02-22  
**Source:** Google Search Console Coverage export

---

## Critical Issues Summary (from your CSV)

| Issue | Pages | Severity |
|-------|-------|----------|
| Not found (404) | **95** | High |
| Duplicate without user-selected canonical | 4 | Moderate |
| Page with redirect | 2 | Low |
| Server error (5xx) | 1 | High |
| Blocked (403) | 1 | High |
| Blocked by robots.txt | 1 | — |

---

## What Was Fixed (Codebase Changes)

### 1. Sitemap – corrected malformed URLs
- **`sitemap-main.xml`:**  
  - `/35r` → `/35r.html`  
  - `/gutter-cleaning/` → `/gutter-cleaning.html`  
  - `/rainwise/` → `/rainwise.html`

### 2. Sitemap – blog URLs
- **`sitemap-blog.xml`:** All 13 blog URLs use `.html` format; fixed `neglected-gutters-costs` and `stormwater-compliance-guide` (were trailing-slash).

### 3. Sitemap – duplicates
- **`sitemap-main.xml`:** Removed duplicate `gutter-cleaning.html` entry.

### 4. Sitemap – restored valid locations
- **`sitemap-locations.xml`:** Restored `beaux-arts-village` and `bel-red` (they exist; were incorrectly removed).

### 5. Redirects (`vercel.json`)
- Added `trailingSlash: false` – all `/path/` requests redirect to `/path` (fixes many trailing-slash 404s).
- Added 301 redirects for old URL variants:
  - `/about/`, `/35r`, `/gutter-cleaning`, `/gutter-cleaning/`, `/rainwise`, `/rainwise/` → correct `.html` URLs
  - All blog trailing-slash URLs → `.html` URLs

---

## What You Still Need To Do

### Step 1: Export the actual 404 URLs from GSC

The CSV export only has counts, not the URLs. To see the 95 broken URLs:

1. Open [Google Search Console](https://search.google.com/search-console)
2. Select the **ospreyexterior.com** property
3. Go to **Pages** (or **Indexing** → **Pages**)
4. Click **Why pages aren’t indexed**
5. Click **Not found (404)**
6. Click **Export URLs** or **View data in Search Console** to see the list

### Step 2: Categorize the 404s

Once you have the list, group them by type:

| Category | Likely fix |
|----------|------------|
| **Trailing slash** (e.g. `/page/` vs `/page.html`) | Already handled by redirects |
| **Old location pages** (beaux-arts, bel-red) | Already redirected to Bellevue |
| **Blog trailing slash** | Already redirected |
| **www vs non-www** | Add redirect in Vercel/hosting |
| **HTTP vs HTTPS** | Usually handled by hosting |
| **Case sensitivity** (e.g. `/Pages/` vs `/pages/`) | Add redirect if needed |
| **Deleted/renamed pages** | 301 to closest current page |
| **Parameterized** (e.g. `?utm_`) | Canonical or ignore |

### Step 3: Fix the 5xx and 403

1. **5xx:** In GSC, find the exact URL returning 5xx. Check:
   - Server/hosting logs
   - Vercel function errors
   - Timeouts or resource limits

2. **403:** Find the blocked URL. Check:
   - `robots.txt` (you have `Disallow: /admin/` – confirm that’s intended)
   - Hosting permissions
   - Whether it’s a private or protected path

### Step 4: Fix duplicate canonicals (4 pages)

Duplicate canonical usually means Google sees both versions (e.g. `/page` and `/page/`) without a clear canonical. Ensure:

- Every page has a canonical tag pointing to its preferred URL
- Canonical points to the same URL format you use in the sitemap (e.g. trailing slash for directories, `.html` for files)

---

## Escrow Pages – Next Steps

After cleanup:

1. **Request indexing** in GSC for:
   - Escrow hub: `/real-estate/escrow/index.html`
   - `/real-estate/escrow/gutter-overflow-siding-rot-redmond.html`
   - `/real-estate/escrow/roof-moss-escrow-issue-redmond.html`
   - `/real-estate/escrow/wood-rot-fascia-repair-before-sale-redmond.html`

2. **Wait 14–21 days**, then review impressions per escrow page in GSC.

---

## Deployment

Deploy these changes so the sitemap and redirects take effect:

```bash
git add sitemap-main.xml sitemap-blog.xml sitemap-locations.xml vercel.json
git commit -m "Fix indexing: remove 404s from sitemap, add redirects"
git push
```

After deploy, resubmit the sitemap in GSC: **Sitemaps** → enter `https://ospreyexterior.com/sitemap.xml` → **Submit**.
