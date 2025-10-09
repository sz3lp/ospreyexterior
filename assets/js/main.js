(function () {
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.getElementById('primary-navigation');
  const currentYear = document.getElementById('current-year');
  const eligibilityCta = document.getElementById('eligibility-cta');
  const modal = document.getElementById('eligibility-modal');
  const modalCloseButtons = modal ? modal.querySelectorAll('[data-modal-close]') : [];
  const eligibilityForm = document.getElementById('eligibility-form');
  const successMessage = eligibilityForm ? eligibilityForm.querySelector('.modal-form__success') : null;
  let lastFocusedElement = null;

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  const closeNavigation = () => {
    if (!menuToggle || !siteNav) {
      return;
    }

    menuToggle.setAttribute('aria-expanded', 'false');
    siteNav.classList.remove('is-open');
  };

  if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isExpanded));
      siteNav.classList.toggle('is-open', !isExpanded);
    });

    siteNav.addEventListener('click', (event) => {
      if (event.target instanceof HTMLElement && event.target.tagName === 'A') {
        closeNavigation();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) {
        closeNavigation();
      }
    });

    window.addEventListener('keyup', (event) => {
      if (event.key === 'Escape') {
        closeNavigation();
      }
    });
  }

  const openModal = () => {
    if (!modal) {
      return;
    }

    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    const firstInput = modal.querySelector('input');
    if (firstInput) {
      firstInput.focus();
    }
  };

  const closeModal = () => {
    if (!modal) {
      return;
    }

    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');

    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  };

  if (eligibilityCta) {
    eligibilityCta.addEventListener('click', openModal);
  }

  if (modal) {
    modalCloseButtons.forEach((button) => {
      button.addEventListener('click', closeModal);
    });

    modal.addEventListener('click', (event) => {
      if (event.target instanceof HTMLElement && event.target.hasAttribute('data-modal-close')) {
        closeModal();
      }
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
        closeModal();
      }
    });
  }

  if (eligibilityForm) {
    eligibilityForm.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!successMessage) {
        closeModal();
        return;
      }

      successMessage.hidden = false;
      eligibilityForm.reset();
      const submitButton = eligibilityForm.querySelector('button[type="submit"]');
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = true;
        submitButton.textContent = 'Submitted';
      }

      setTimeout(() => {
        if (submitButton instanceof HTMLButtonElement) {
          submitButton.disabled = false;
          submitButton.textContent = 'Submit and Check Eligibility';
        }
        successMessage.hidden = true;
        closeModal();
      }, 3000);
    });
  }
})();
