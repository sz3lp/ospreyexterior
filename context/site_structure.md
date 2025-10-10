# Site Structure

## Overview
Osprey Exterior's marketing site is organized as a conversion-first static experience that scales across rain management, compliance, and maintenance services. Pages are grouped into primary funnels that guide visitors from discovery to lead capture, with secondary and future-ready destinations that reinforce authority and retention. Automation pipelines render each route from shared templates while pulling localized content from the `data/` directory.

## Information Architecture
### Primary pages
1. **`/` – Home**: Overview of service pillars, social proof, and an embedded lead form that routes to `/quote/`.
2. **`/rainwise/`**: Rebate eligibility explainer, enrollment process timeline, and an interactive savings calculator.
3. **`/gutters/`**: Replacement funnel covering inspections, materials, and leaf filter upsells.
4. **`/cisterns/`**: Storage system selector with sizing charts, maintenance checklist, and rebate cross-links.
5. **`/drainage/`**: Runoff mitigation hub detailing grading fixes, trench drains, and French drain options.
6. **`/compliance/`**: Ecological code references, permit flow, and inspection preparation guide.
7. **`/service-areas/{city}/`**: Localized SEO landers generated per city or ZIP using `data/geo_targets.json`.
8. **`/projects/`**: Gallery of before/after imagery, testimonials, and metrics drawn from `data/projects.csv` (placeholder).
9. **`/blog/`**: Dynamic index categorized into RainWise, maintenance, compliance, and seasonal insights.
10. **`/contact/`**: Contact form, map embed, phone CTA, and hours of operation.

### Secondary conversion pages
11. **`/quote/`**: Full intake form referenced by every CTA and the primary navigation button.
12. **`/thank-you/`**: Confirmation screen with next steps, calendar link, and relevant upsells.
13. **`/partnerships/`**: Subcontractor recruitment details and RainWise rebate alliance outreach.
14. **`/about/`**: Mission statement, credentials, licensing, insurance certificates, and team bios.
15. **`/faq/`**: Standalone schema-ready FAQ with JSON-LD markup for SERP enhancements.
16. **`/rebate-tracker/`**: Authenticated status dashboard powered by Supabase (future API hook).
17. **`/reviews/`**: Embedded Google/Yelp reviews with aggregate rating schema.
18. **`/resources/`**: Downloadable PDFs, rebate forms, and compliance checklists sourced from `assets/docs/` (planned).
19. **`/privacy/`**: Privacy policy and cookie disclosure required for compliance.
20. **`/sitemap.xml`**: Auto-generated XML feed for search engines (maintained under repository root).

### Optional future extensions
21. **`/dashboard/`**: Client login for inspection timelines, invoices, and document exchange.
22. **`/maintenance-plan/`**: Subscription upsell for annual cleanings and inspections.
23. **`/lighting/`**: Cross-sell page for exterior accent and holiday lighting installs.
24. **`/blog/{slug}/`**: Generated detail pages for AI-assisted editorial content.
25. **`/calculator/`**: Unified estimator merging roof runoff, gutter sizing, and cistern capacity logic.

## Template Mapping
- `site/index.html` renders the home page hero, featured services, testimonials, and lead capture module.
- `site/services/service_template.html` is cloned for `/rainwise/`, `/gutters/`, `/cisterns/`, `/drainage/`, and `/compliance/`, with localization tokens for `/service-areas/{city}/`.
- `site/blog_template.html` powers the `/blog/` listing, while `site/post_template.html` is used for `/blog/{slug}/` articles.
- `site/about.html` provides the base for `/about/`, `/partnerships/`, and `/reviews/` via content variations.
- Additional static templates (to be added) will cover `/projects/`, `/faq/`, `/quote/`, `/contact/`, and utility pages.

## Component Reuse
- Global header/footer partials are embedded across all templates to keep navigation consistent.
- The lead capture module from the home page is re-used on service pages and the `/quote/` form.
- Testimonial, project card, and blog card components pull shared styles from `assets/style.css` and scripts from `assets/script.js`.

## Data & Automation Touchpoints
- `data/posts.csv` feeds `/blog/` and `/blog/{slug}/` content, categorized for filtering.
- `data/geo_targets.json` enumerates city and ZIP permutations for `/service-areas/{city}/` builds.
- Placeholder automation scripts (`executable_1.py`, `executable_2.py`) will compile templates, inject JSON-LD for `/faq/` and `/reviews/`, and push updates to hosting.
- Tracking snippets in `assets/tracking.js` should load on every template, with event bindings defined in `assets/script.js`.

## SEO & Compliance Considerations
- Ensure each service and secondary page registers in the XML sitemap and references internal CTAs to `/quote/`.
- Structured data is required on `/faq/`, `/reviews/`, and `/projects/` to improve SERP visibility.
- Localized `/service-areas/{city}/` pages must incorporate geo metadata, NAP details, and RainWise eligibility notes.
- `/privacy/` should link from the footer and reference data handling for rebate submissions and Supabase integrations.
