# Osprey Exterior Frontend

A Next.js + Tailwind CSS frontend for ospreyexterior.com powered by Supabase content. The site renders geo-targeted service area landing pages, a project journal, and shared lead capture components with JSON-LD structured data baked in.

## Features

- **Supabase-driven content** – Cities, posts, and leads stored in Supabase with typed fetch utilities for server and client usage.
- **Service area landing pages** – Ten Eastside city directories (Bellevue, Redmond, Kirkland, Issaquah, Sammamish, Woodinville, Medina, Clyde Hill, Newcastle, Mercer Island) with dynamic posts, FAQs, and contact forms.
- **Blog publishing** – `/blog` listing and `/blog/[slug]` article detail pages including Article schema and inline rich text rendering.
- **Lead generation** – Reusable quote form posts submissions directly to the Supabase `leads` table using `supabase-js`.
- **SEO optimizations** – Metadata builder, LocalBusiness/Article/FAQPage JSON-LD injection, sitemap.xml, and RSS feed.
- **Design system** – Clean blue-accent aesthetic with responsive layouts powered by Tailwind CSS utilities.

## Getting Started

```bash
npm install
npm run dev
```

The development server runs on [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create a `.env.local` file and set the Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

Server-side utilities also fall back to `SUPABASE_URL` and `SUPABASE_ANON_KEY` if you prefer non-public variable names.

## Project Structure

- `app/` – App Router pages, including service areas, blog, RSS feed, and sitemap.
- `components/` – Layout, card, form, and SEO helper components.
- `lib/` – Supabase clients, data fetching utilities, and SEO helpers.
- `public/` – Static assets such as the favicon and images.
- `tailwind.config.js` – Tailwind theme customization.
- `vercel.json` – Vercel routing overrides for sitemap and RSS endpoints.

## Deployment

The repository is configured for Vercel. Push to the default branch and configure the Supabase environment variables in your Vercel project settings. The site builds using `npm run build` and serves statically with incremental revalidation handled by Supabase-powered data fetching at build time.
