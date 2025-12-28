# Supabase Edge Functions Migration

All API endpoints have been converted from Vercel Serverless Functions to Supabase Edge Functions to avoid the 12-function limit.

## Quick Start

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Login and link your project:**
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   ```

3. **Set environment variables:**
   ```bash
   supabase secrets set HUBSPOT_API_KEY=your-key
   supabase secrets set STRIPE_SECRET_KEY=your-key
   supabase secrets set TWILIO_ACCOUNT_SID=your-sid
   supabase secrets set TWILIO_AUTH_TOKEN=your-token
   supabase secrets set TWILIO_PHONE_NUMBER=your-number
   ```

4. **Deploy all functions:**
   ```bash
   supabase functions deploy
   ```

## Function URLs

After deployment, functions are available at:
```
https://your-project.supabase.co/functions/v1/function-name
```

## Frontend Updates

Update API calls to use the new URLs. See `docs/SUPABASE_EDGE_FUNCTIONS_SETUP.md` for details.

## Functions Created

- `hubspot-sync` - Sync leads to HubSpot
- `bookings` - Online booking system
- `estimates` - Estimate/quotes management
- `payments` - Stripe payment processing
- `jobs` - Job management
- `customers` - Customer data
- `appointments` - Appointment management
- `recurring-services` - Recurring service management
- `sms-automation` - Twilio SMS
- `admin-metrics` - Business metrics

See `supabase/functions/` directory for all functions.

