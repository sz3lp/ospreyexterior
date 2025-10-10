window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-3MENPSSF97', {
  anonymize_ip: true,
  send_page_view: true
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form[data-provider="supabase"]').forEach((form) => {
    form.addEventListener('submit', () => {
      window.dataLayer.push({
        event: 'lead_form_attempt',
        form_id: form.getAttribute('id') || 'rainwise-form'
      });
    });
  });
});
