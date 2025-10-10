# Osprey Exterior Static Toolkit

This repository provides the structure, templates, and documentation required to plan and publish Osprey Exterior's marketing site. Executable automation code is intentionally omitted in favor of process notes and placeholders.

## Repository Layout
- `context/` — Strategic documentation, prompts, and automation references.
- `site/` — HTML templates for the home page, services, blog, and about page.
- `assets/` — Shared CSS, JavaScript, tracking snippets, and icon placeholders.
- `data/` — CSV/JSON data sources consumed by automation.
- `executable_1.py` — Placeholder for the content generation pipeline.
- `executable_2.py` — Placeholder for SEO enhancement and deployment pipeline.

## Usage
1. Review `context/` documentation to understand messaging, SEO, and tracking requirements.
2. Populate `data/` files with the latest posts, leads schema updates, and analytics events.
3. Implement automation logic (outside this repo) that reads templates in `site/` and produces static builds.
4. Ensure tracking snippets from `assets/tracking.js` and event handling from `assets/script.js` are loaded on every generated page.

## Dependencies
No runtime dependencies are committed. Automation scripts should be implemented separately following the guidance in `context/automation_flow.md`.
