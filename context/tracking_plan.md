# Tracking Plan

## Platforms
- **GA4 Property:** ospreyexterior.com
- **GTM Container:** GTM-OSPREY (web)
- **CRM Sync:** HubSpot via webhook endpoint

## Key Events
| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `lead_form_submit` | Lead form submission success callback | `form_id`, `service_interest`, `geo_target` |
| `cta_click` | Click on primary CTA buttons | `cta_location`, `cta_text` |
| `phone_click` | Click-to-call links | `phone_number`, `page_type` |
| `quote_widget_open` | User opens request-a-quote modal | `page_type`, `device` |

## Attribution Notes
- Use GA4 enhanced measurement except site search.
- Map UTM parameters to HubSpot fields via hidden inputs.
- Fire LinkedIn and Meta pixel events through GTM custom HTML tags with consent gating.

## QA Checklist
1. Validate all events in GA4 DebugView before launch.
2. Ensure cookie consent status is passed to GTM as `dataLayer.consentState`.
3. Confirm phone number clicks are tracked across desktop and mobile templates.
