# Supabase Edge Functions Setup Guide

All API endpoints have been converted from Vercel Serverless Functions to Supabase Edge Functions to avoid the 12-function limit on the Hobby plan.

## Structure

All Edge Functions are located in `supabase/functions/` directory:

```
supabase/functions/
├── _shared/
│   └── cors.ts          # Shared CORS headers
├── hubspot-sync/
│   └── index.ts         # HubSpot contact/deal sync
├── bookings/
│   └── index.ts         # Online booking system
├── estimates/
│   └── index.ts         # Estimates/quotes
├── payments/
│   └── index.ts         # Stripe payment processing
├── jobs/
│   └── index.ts         # Job management
├── customers/
│   └── index.ts         # Customer data
├── appointments/
│   └── index.ts         # Appointment management
├── recurring-services/
│   └── index.ts         # Recurring service management
├── sms-automation/
│   └── index.ts         # Twilio SMS
├── hubspot-analytics/
│   └── index.ts         # HubSpot analytics
└── admin/
    ├── metrics/
    │   └── index.ts     # Business metrics
    ├── revenue-trend/
    │   └── index.ts     # Revenue charts
    └── jobs-by-service/
        └── index.ts     # Service distribution
```

## Deployment

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link to Your Project

```bash
supabase link --project-ref your-project-ref
```

### 4. Set Environment Variables

Set secrets for each function:

```bash
# HubSpot
supabase secrets set HUBSPOT_API_KEY=your-hubspot-api-key

# Stripe
supabase secrets set STRIPE_SECRET_KEY=your-stripe-secret-key

# Twilio
supabase secrets set TWILIO_ACCOUNT_SID=your-twilio-sid
supabase secrets set TWILIO_AUTH_TOKEN=your-twilio-token
supabase secrets set TWILIO_PHONE_NUMBER=your-twilio-number
```

### 5. Deploy Functions

Deploy all functions at once:

```bash
supabase functions deploy
```

Or deploy individually:

```bash
supabase functions deploy hubspot-sync
supabase functions deploy bookings
supabase functions deploy estimates
# ... etc
```

## URL Structure

After deployment, functions are available at:

```
https://your-project-ref.supabase.co/functions/v1/function-name
```

For example:
- `https://your-project.supabase.co/functions/v1/hubspot-sync`
- `https://your-project.supabase.co/functions/v1/bookings`
- `https://your-project.supabase.co/functions/v1/estimates`

## Frontend Updates Needed

Update all API calls in your frontend to use the new Supabase Edge Function URLs:

### Before (Vercel):
```javascript
fetch('/api/hubspot-sync', { ... })
```

### After (Supabase):
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
fetch(`${SUPABASE_URL}/functions/v1/hubspot-sync`, {
  headers: {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  },
  ...
})
```

## Key Differences from Vercel Functions

1. **Runtime**: Deno instead of Node.js
2. **Imports**: Use `https://esm.sh/` for npm packages
3. **Environment Variables**: Use `Deno.env.get()` instead of `process.env`
4. **Request/Response**: Use `Deno.serve()` and standard `Request`/`Response` objects
5. **CORS**: Must be handled manually (see `_shared/cors.ts`)

## Testing Locally

```bash
# Start local Supabase
supabase start

# Serve functions locally
supabase functions serve

# Test a function
curl -i --location --request POST 'http://localhost:54321/functions/v1/hubspot-sync' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"leadId":"...","action":"sync_all"}'
```

## Migration Checklist

- [x] Convert all API endpoints to Supabase Edge Functions
- [ ] Update frontend API calls to use new URLs
- [ ] Set environment variables/secrets
- [ ] Deploy all functions
- [ ] Test each endpoint
- [ ] Update documentation with new URLs
- [ ] Remove old `/api/` directory (optional, keep for reference)

## Notes

- All functions include CORS headers for cross-origin requests
- Functions automatically have access to Supabase client via environment variables
- No function count limits on Supabase (unlike Vercel Hobby plan)
- Functions can be deployed independently
- Use Supabase Dashboard to view function logs and metrics

