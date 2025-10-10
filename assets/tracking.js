window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-OSPREYEXT', {
  anonymize_ip: true,
  send_page_view: true
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form').forEach((form) => {
    form.addEventListener('submit', () => {
      window.dataLayer.push({
        event: 'lead_form_submit',
        form_id: form.getAttribute('id') || 'generic-form'
      });
    });
  });
});
