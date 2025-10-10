# Automation Flow

1. **Daily Trigger (07:00 EST):** Scheduler invokes `executable_1.py` with the day's geo target list.
2. **Content Generation:** Script requests outlines via Codex prompt (`context/prompts/generate_post.txt`) and populates templates in `/site`.
3. **Asset Injection:** Merge hero images and icon references in `assets/` based on service type.
4. **Quality Review:** Automated linting ensures metadata, schema, and tracking snippet placeholders exist.
5. **SEO & Geo Enhancement:** `executable_2.py` reads `context/geo_targets.json`, applies localized copy adjustments, and stamps meta tags defined in `context/seo_guide.md`.
6. **Deployment:** Built pages and assets pushed to staging branch; Vercel previews generated.
7. **Analytics Sync:** `data/analytics_events.json` and `data/leads.json` updates pushed to warehouse.
8. **Reporting:** Slack notification summarizes new URLs, target keywords, and tracking health.
