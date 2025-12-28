# Frontend API Updates Required

Update these files to use the new consolidated API endpoints:

## Files to Update

### 1. `assets/js/booking.js`
Change:
```javascript
fetch('/api/bookings', { ... })
```
To:
```javascript
fetch('/api/api?endpoint=bookings', { ... })
```

### 2. `assets/js/estimates.js`
Change:
```javascript
fetch('/api/estimates', { ... })
```
To:
```javascript
fetch('/api/api?endpoint=estimates', { ... })
```

### 3. `assets/js/customer-portal.js`
Update all API calls:
- `/api/jobs` → `/api/api?endpoint=jobs`
- `/api/appointments` → `/api/api?endpoint=appointments`
- `/api/invoices` → `/api/payments` (invoices handled in payments)
- `/api/recurring-services` → `/api/services?endpoint=recurring-services`

### 4. `assets/js/business-dashboard.js`
- `/api/admin/metrics` → `/api/admin?endpoint=metrics`
- `/api/admin/revenue-trend` → `/api/admin?endpoint=revenue-trend`
- `/api/admin/jobs-by-service` → `/api/admin?endpoint=jobs-by-service`

### 5. `app/admin/hubspot-dashboard.html`
- `/api/hubspot-analytics` → `/api/hubspot?endpoint=hubspot-analytics`

### 6. `app/upload/field-app.js`
- `/api/jobs` → `/api/api?endpoint=jobs`

## Quick Find & Replace

Search for these patterns and replace:
- `/api/bookings` → `/api/api?endpoint=bookings`
- `/api/jobs` → `/api/api?endpoint=jobs`
- `/api/customers` → `/api/api?endpoint=customers`
- `/api/appointments` → `/api/api?endpoint=appointments`
- `/api/estimates` → `/api/api?endpoint=estimates`
- `/api/recurring-services` → `/api/services?endpoint=recurring-services`
- `/api/sms-automation` → `/api/notifications?endpoint=sms-automation`
- `/api/hubspot-sync` → `/api/hubspot`
- `/api/hubspot-analytics` → `/api/hubspot?endpoint=hubspot-analytics`
- `/api/admin/metrics` → `/api/admin?endpoint=metrics`
- `/api/admin/revenue-trend` → `/api/admin?endpoint=revenue-trend`
- `/api/admin/jobs-by-service` → `/api/admin?endpoint=jobs-by-service`

