(function () {
  const rebateForm = document.getElementById('rebate-form');
  const roofAreaInput = document.getElementById('roof-area');
  const rebateAmount = document.getElementById('rebate-amount');
  const currentYear = document.getElementById('current-year');

  const RATE_PER_SQFT = 7.9;

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
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
