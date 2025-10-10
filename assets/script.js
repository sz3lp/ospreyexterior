(function () {
  const yearTarget = document.getElementById('current-year');
  if (yearTarget) {
    yearTarget.textContent = new Date().getFullYear();
  }

  document.querySelectorAll('[data-track="cta"]').forEach((button) => {
    button.addEventListener('click', () => {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'cta_click',
        cta_location: button.dataset.location || 'unspecified',
        cta_text: button.textContent.trim()
      });
    });
  });
})();
