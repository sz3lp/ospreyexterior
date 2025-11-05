# Osprey Exterior Next.js Site

This repository serves the Osprey Exterior marketing site using the Next.js App Router with server-rendered legacy content, analytics instrumentation, and Supabase-backed lead capture.

## Getting started

```bash
pnpm install
pnpm dev
```

Visit `http://localhost:3000` in your browser. Legacy HTML pages are rendered through the `/app` router by loading sanitized templates from `content/html`.

## Quality checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

All commands must succeed before deploying.

## Environment variables

Create an `.env.local` file and supply the following values:

| Variable | Description |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key used for secure lead inserts. |
| `SUPABASE_LEADS_TABLE` | Table name for leads (defaults to `leads`). |
| `NEXT_PUBLIC_GA_IDS` | Comma-separated Google Analytics measurement IDs. |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager container ID. |
| `FEATURE_LEAD_SUBMISSION` | Set to `off` to disable lead submission without code changes. |

## Content management

- Source HTML lives in `content/html`. Add new `.html` files or folders to publish additional routes.
- Internal links ending in `.html` are normalized to extensionless Next.js routes at runtime.
- Static assets remain in `public/assets` and are referenced from sanitized templates.

## Lead pipeline

Lead forms invoke `/api/leads`, which:

1. Validates payloads with Zod.
2. Applies per-IP rate limiting (10 requests per minute).
3. Checks for duplicate submissions based on email or phone.
4. Inserts normalized records into Supabase with retry + jitter logging.

Logs include `requestId`, `traceId`, remediation hints, and cost metadata to support observability.

## Analytics

`AnalyticsProvider` bootstraps `window.dataLayer`, Google Analytics / GTM script loading, and exposes a `trackEvent` hook for legacy components. Additional integrations can read `window.ospreyAnalytics` for configuration.

## Testing

Unit tests for service functions live under `tests/` and run with Vitest.

```bash
pnpm test
```

## Deployment

The project targets Vercel deployment. Ensure environment variables are configured in the Vercel dashboard and that Supabase tables include the expected columns referenced in the lead payload.
