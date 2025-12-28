# Vercel API Consolidation - Complete

## Problem Solved
✅ Reduced from 15+ functions to **8 functions** (under the 12-function limit)

## Consolidated Functions

### 1. `/api/api.ts` → `/api/api`
Handles: bookings, jobs, customers, appointments, estimates
- POST `/api/api?endpoint=bookings` - Create booking
- GET `/api/api?endpoint=jobs&customer_id=...` - Get jobs
- PATCH `/api/api?endpoint=jobs&id=...` - Update job
- GET `/api/api?endpoint=customers&id=...` - Get customer
- GET `/api/api?endpoint=appointments&customer_id=...` - Get appointments
- POST `/api/api?endpoint=estimates` - Create estimate
- GET `/api/api?endpoint=estimates&id=...` - Get estimate
- PATCH `/api/api?endpoint=estimates&id=...` - Update estimate

### 2. `/api/hubspot.ts` → `/api/hubspot`
Handles: HubSpot sync and analytics
- POST `/api/hubspot` - Sync lead to HubSpot
- GET `/api/hubspot?endpoint=hubspot-analytics` - Get analytics

### 3. `/api/payments.ts` → `/api/payments`
Handles: Stripe payments
- POST `/api/payments` - Create payment intent
- GET `/api/payments?id=...` - Get payment

### 4. `/api/admin.ts` → `/api/admin`
Handles: Admin dashboard metrics
- GET `/api/admin?endpoint=metrics` - Business metrics
- GET `/api/admin?endpoint=revenue-trend` - Revenue chart
- GET `/api/admin?endpoint=jobs-by-service` - Service distribution

### 5. `/api/services.ts` → `/api/services`
Handles: Recurring services
- GET `/api/services?endpoint=recurring-services&customer_id=...`
- POST `/api/services?endpoint=recurring-services`
- PATCH `/api/services?endpoint=recurring-services&id=...`
- DELETE `/api/services?endpoint=recurring-services&id=...`

### 6. `/api/notifications.ts` → `/api/notifications`
Handles: SMS automation
- POST `/api/notifications?endpoint=sms-automation` - Send SMS

### 7. `/api/uploadConfig.ts` → `/api/uploadConfig` (existing)
### 8. `/api/uploadImage.ts` → `/api/uploadImage` (existing)

**Total: 8 functions** ✅

## Frontend Updates Required

All frontend files need to be updated to use query parameters. See `docs/FRONTEND_API_UPDATES.md` for the complete list.

## Quick Reference

| Old Endpoint | New Endpoint |
|-------------|--------------|
| `/api/bookings` | `/api/api?endpoint=bookings` |
| `/api/jobs` | `/api/api?endpoint=jobs` |
| `/api/customers` | `/api/api?endpoint=customers` |
| `/api/appointments` | `/api/api?endpoint=appointments` |
| `/api/estimates` | `/api/api?endpoint=estimates` |
| `/api/hubspot-sync` | `/api/hubspot` |
| `/api/hubspot-analytics` | `/api/hubspot?endpoint=hubspot-analytics` |
| `/api/admin/metrics` | `/api/admin?endpoint=metrics` |
| `/api/admin/revenue-trend` | `/api/admin?endpoint=revenue-trend` |
| `/api/admin/jobs-by-service` | `/api/admin?endpoint=jobs-by-service` |
| `/api/recurring-services` | `/api/services?endpoint=recurring-services` |
| `/api/sms-automation` | `/api/notifications?endpoint=sms-automation` |

## Status

✅ All consolidated functions created
✅ Old individual function files deleted
✅ Routing logic implemented
⏳ Frontend files need updating (see docs/FRONTEND_API_UPDATES.md)

