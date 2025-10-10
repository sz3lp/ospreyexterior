window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-3MENPSSF97', {
  anonymize_ip: true,
  send_page_view: true,
  custom_map: {
    dimension1: 'lead_city'
  }
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form[data-provider="supabase"]').forEach((form) => {
    form.addEventListener('submit', () => {
      const formCity = form.querySelector('[name="city"]')?.value || form.dataset.city || 'unspecified';
      window.dataLayer.push({
        event: 'lead_form_attempt',
        form_id: form.getAttribute('id') || 'rainwise-form',
        lead_city: formCity
      });
      if (typeof gtag === 'function') {
        gtag('event', 'lead_form_attempt', {
          event_category: 'lead',
          event_label: form.getAttribute('id') || 'rainwise-form',
          lead_city: formCity
        });
      }
    });
  });
});
