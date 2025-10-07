(function () {
  const rebateForm = document.getElementById('rebate-form');
  const roofAreaInput = document.getElementById('roof-area');
  const rebateAmount = document.getElementById('rebate-amount');
  const currentYear = document.getElementById('current-year');
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.getElementById('primary-navigation');

  const RATE_PER_SQFT = 7.9;

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  const closeNavigation = () => {
    if (!menuToggle || !siteNav) {
      return;
    }

    menuToggle.setAttribute('aria-expanded', 'false');
    siteNav.classList.remove('is-open');
    document.body.classList.remove('nav-open');
  };

  if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isExpanded));
      siteNav.classList.toggle('is-open', !isExpanded);
      document.body.classList.toggle('nav-open', !isExpanded);
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

  if (rebateForm && roofAreaInput && rebateAmount) {
    rebateForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const roofValue = parseFloat(roofAreaInput.value);
      if (Number.isNaN(roofValue) || roofValue <= 0) {
        rebateAmount.textContent = '$0';
        roofAreaInput.focus();
        return;
      }

      const rebate = roofValue * RATE_PER_SQFT;
      rebateAmount.textContent = rebate.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      });
    });
  }
})();
