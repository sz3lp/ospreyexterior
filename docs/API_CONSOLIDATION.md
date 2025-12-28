# API Consolidation Guide

All API endpoints have been consolidated to stay under Vercel's 12-function limit.

## Consolidated Functions

### 1. `/api/api.ts` - Main API Router
Handles multiple endpoints via path routing:
- `/api/api/bookings` - POST: Create booking
- `/api/api/jobs` - GET/PATCH: Job management
- `/api/api/customers` - GET: Customer data
- `/api/api/appointments` - GET: Appointment data
- `/api/api/estimates` - GET/POST/PATCH: Estimate management

### 2. `/api/hubspot.ts` - HubSpot Integration
- `/api/hubspot` or `/api/hubspot-sync` - POST: Sync leads to HubSpot
- `/api/hubspot-analytics` - GET: HubSpot analytics data

### 3. `/api/payments.ts` - Payment Processing
- `/api/payments` - GET/POST: Stripe payment processing

### 4. `/api/admin.ts` - Admin Dashboard
- `/api/admin/metrics` - GET: Business metrics
- `/api/admin/revenue-trend` - GET: Revenue chart data
- `/api/admin/jobs-by-service` - GET: Service distribution

### 5. `/api/services.ts` - Recurring Services
- `/api/services/recurring-services` or `/api/services/recurring` - GET/POST/PATCH/DELETE: Recurring service management

### 6. `/api/notifications.ts` - SMS/Email
- `/api/notifications/sms-automation` or `/api/notifications/sms` - POST: Send SMS

### 7. `/api/uploadConfig.ts` - Upload Config (existing)
### 8. `/api/uploadImage.ts` - Image Upload (existing)

**Total: 8 functions** (well under the 12-function limit)

## Frontend Updates Needed

Update all API calls to use the new consolidated endpoints:

### Before:
```javascript
fetch('/api/bookings', { ... })
fetch('/api/jobs', { ... })
fetch('/api/customers', { ... })
```

### After:
```javascript
fetch('/api/api/bookings', { ... })
fetch('/api/api/jobs', { ... })
fetch('/api/api/customers', { ... })
```

Or use query parameters:
```javascript
fetch('/api/api?endpoint=bookings', { ... })
```

## URL Structure

The consolidated functions use path-based routing:
- Extract the endpoint from the URL path
- Route to the appropriate handler within the function
- All functions support CORS and standard HTTP methods

## Benefits

- Reduced from 15+ functions to 8 functions
- Stays well under Vercel's 12-function limit
- Easier to maintain (related endpoints grouped together)
- No functionality lost - all endpoints still available

