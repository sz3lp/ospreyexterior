(function () {
  const yearTarget = document.getElementById('current-year');
  if (yearTarget) {
    yearTarget.textContent = new Date().getFullYear();
  }

  const animateTargets = document.querySelectorAll('[data-animate]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    animateTargets.forEach((target) => observer.observe(target));
  } else {
    animateTargets.forEach((target) => target.classList.add('is-visible'));
  }

  const trackEvent = (detail) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'interaction', ...detail });
  };

  document.querySelectorAll('[data-track="cta"]').forEach((el) => {
    el.addEventListener('click', () => {
      trackEvent({
        interaction_type: 'cta_click',
        location: el.dataset.location || 'unspecified',
        label: (el.textContent || '').trim()
      });
    });
  });

  document.querySelectorAll('form[data-provider="supabase"]').forEach((form) => {
    const loader = form.querySelector('.form-loader');
    const feedback = form.querySelector('.form-feedback');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      feedback.textContent = '';

      if (!form.reportValidity()) {
        feedback.textContent = 'Please complete the highlighted fields.';
        feedback.style.color = '#b91c1c';
        trackEvent({ interaction_type: 'form_error', form_id: form.id || 'rainwise-form' });
        return;
      }

      if (loader) loader.style.display = 'flex';
      form.classList.add('is-submitting');

      const formData = Object.fromEntries(new FormData(form).entries());
      trackEvent({
        interaction_type: 'form_submit',
        form_id: form.id || 'rainwise-form',
        rebate_status: formData.rebate_status || 'unspecified'
      });

      const supabaseConfig = Object.assign({}, window.__OSPREY_SUPABASE__ || {});
      const url = form.dataset.supabaseUrl || supabaseConfig.url;
      const key = form.dataset.supabaseKey || supabaseConfig.key;
      const table = form.dataset.supabaseTable || supabaseConfig.table || 'leads';

      let success = false;
      if (url && key) {
        try {
          const response = await fetch(`${url}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: key,
              Authorization: `Bearer ${key}`
            },
            body: JSON.stringify({
              ...formData,
              submitted_at: new Date().toISOString()
            })
          });
          success = response.ok;
        } catch (error) {
          success = false;
        }
      } else {
        success = true;
      }

      if (success) {
        feedback.textContent = form.dataset.successMessage || 'Thanks! We will be in touch soon.';
        feedback.style.color = '#1a9d8f';
        form.reset();
      } else {
        feedback.textContent = 'We could not submit your request. Please call 425 550 1727 or try again.';
        feedback.style.color = '#b91c1c';
      }

      if (loader) loader.style.display = 'none';
      form.classList.remove('is-submitting');
    });
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(() => {});
    });
  }
})();
