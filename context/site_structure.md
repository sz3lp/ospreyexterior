# Site Structure

## Overview
The website is a marketing hub for Osprey Exterior, featuring a home page, services hub, blog, and company information. Navigation remains consistent across templates and is optimized for conversions.

## Navigation
- **Primary navigation:** Home, Services, Blog, About
- **Utility navigation:** Phone number CTA, Request a Quote button, language selector (future expansion)
- **Footer navigation:** Primary links duplicated, plus Privacy Policy, Terms, and social icons

## Folder Hierarchy
```
site/
├── index.html
├── blog_template.html
├── post_template.html
├── about.html
└── services/
    └── service_template.html
```

## Template Notes
- `index.html` pulls hero copy, featured services, testimonials, and a lead form embed.
- `blog_template.html` lists posts sourced from `data/posts.csv` and links to individual `post_template.html` instances.
- `post_template.html` is populated for each blog entry, using SEO title, excerpt, and article body provided by automation.
- `about.html` contains company story, leadership bios, and trust badges.
- `services/service_template.html` is cloned per service vertical with localized keywords from `geo_targets.json`.

## Component Reuse
- Header and footer partials are embedded via server-side includes or static copy-and-paste.
- Lead capture module is embedded in both the home hero and services templates for consistent UX.
- Blog cards and testimonial cards share styles defined in `assets/style.css`.

## Automation Touchpoints
- `executable_1.py` ingests template files and outputs fully rendered pages.
- `executable_2.py` enriches metadata, injects geo modifiers, and deploys to Vercel.
- Tracking snippets are consolidated in `assets/tracking.js` and included where needed.
