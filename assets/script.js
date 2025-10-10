(function () {
  const yearTarget = document.getElementById('current-year');
  if (yearTarget) {
    yearTarget.textContent = new Date().getFullYear();
  }

  const animatedBlocks = document.querySelectorAll('[data-animate]');
  const revealBlocks = document.querySelectorAll('[data-scroll-reveal]');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    animatedBlocks.forEach((block) => observer.observe(block));
  } else {
    animatedBlocks.forEach((block) => block.classList.add('is-visible'));
  }

  if (revealBlocks.length) {
    const slider = document.querySelector('.reveal-slider');
    const beforeOverlay = document.querySelector('.before-overlay');
    if (slider && beforeOverlay) {
      const updateReveal = (value) => {
        const percentage = Math.min(Math.max(parseInt(value, 10), 0), 100);
        beforeOverlay.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
      };
      slider.addEventListener('input', (event) => {
        updateReveal(event.target.value);
      });
      updateReveal(slider.value);

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-active');
            }
          });
        },
        { threshold: 0.2 }
      );
      revealBlocks.forEach((block) => observer.observe(block));
    }
  }

  const form = document.getElementById('contact-form');
  if (form) {
    const submitButton = form.querySelector('button[type="submit"]');
    const feedback = form.querySelector('.form-feedback');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        feedback.textContent = 'Please complete the required fields highlighted above.';
        form.classList.add('has-errors');
        form.reportValidity();
        return;
      }

      form.classList.remove('has-errors');
      feedback.textContent = '';

      if (submitButton) {
        submitButton.classList.add('is-loading');
        submitButton.setAttribute('aria-busy', 'true');
        submitButton.disabled = true;
      }

      const formData = new FormData(form);
      const payload = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        service: formData.get('service'),
        message: formData.get('message'),
        submitted_at: new Date().toISOString()
      };

      const supabaseUrl = form.dataset.supabaseUrl;
      const supabaseKey = form.dataset.supabaseKey;
      const supabaseTable = form.dataset.supabaseTable || 'leads';

      const isConfigured =
        supabaseUrl &&
        supabaseKey &&
        !supabaseUrl.includes('YOUR-SUPABASE-PROJECT') &&
        !supabaseKey.includes('YOUR_PUBLIC_ANON_KEY');

      let submissionSucceeded = false;

      if (isConfigured) {
        try {
          const response = await fetch(`${supabaseUrl}/rest/v1/${supabaseTable}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              Prefer: 'return=representation'
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          submissionSucceeded = true;
        } catch (error) {
          console.warn('Supabase submission failed, falling back to local storage.', error);
        }
      }

      if (!submissionSucceeded) {
        try {
          const stored = JSON.parse(localStorage.getItem('rainwise_leads') || '[]');
          stored.push(payload);
          localStorage.setItem('rainwise_leads', JSON.stringify(stored));
        } catch (storageError) {
          console.warn('Local storage unavailable, lead stored in memory.', storageError);
          window.__rainwiseFallbackLeads = window.__rainwiseFallbackLeads || [];
          window.__rainwiseFallbackLeads.push(payload);
        }
      }

      form.reset();
      if (submitButton) {
        submitButton.classList.remove('is-loading');
        submitButton.removeAttribute('aria-busy');
        submitButton.disabled = false;
      }
      feedback.textContent = 'Thank you! We will confirm your RainWise inspection shortly.';

      if (typeof window.trackEvent === 'function') {
        window.trackEvent('lead_form_submit', {
          form_id: form.getAttribute('id') || 'contact-form',
          service: payload.service
        });
      }
    });
  }
})();
