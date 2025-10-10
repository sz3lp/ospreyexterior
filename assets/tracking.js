window.dataLayer = window.dataLayer || [];

const trackEvent = (event, payload = {}) => {
  window.dataLayer.push({
    event,
    ...payload
  });
};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-track="cta"]').forEach((element) => {
    element.addEventListener('click', () => {
      trackEvent('cta_click', {
        cta_location: element.dataset.location || 'unspecified',
        cta_text: element.textContent.trim()
      });
    });
  });

  document.querySelectorAll('form:not([data-track-managed="true"])').forEach((form) => {
    form.addEventListener('submit', () => {
      trackEvent('lead_form_submit', {
        form_id: form.getAttribute('id') || 'form',
        context: form.closest('section')?.getAttribute('class') || 'general'
      });
    });
  });

  document.querySelectorAll('details').forEach((faqItem) => {
    faqItem.addEventListener('toggle', () => {
      if (faqItem.open) {
        trackEvent('faq_open', {
          question: faqItem.querySelector('summary')?.textContent.trim() || 'unknown'
        });
      }
    });
  });
  window.trackEvent = trackEvent;
});
