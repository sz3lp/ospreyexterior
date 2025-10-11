const DEFAULT_SUPABASE_CONFIG = {
  url: "https://your-project.supabase.co",
  table: "leads",
  anonKey: "YOUR_SUPABASE_ANON_KEY",
};

const RUNTIME_SUPABASE_CONFIG =
  (typeof window !== "undefined" && window.SUPABASE_CONFIG) || {};

const SUPABASE_URL = RUNTIME_SUPABASE_CONFIG.url || DEFAULT_SUPABASE_CONFIG.url;
const SUPABASE_TABLE =
  RUNTIME_SUPABASE_CONFIG.table || DEFAULT_SUPABASE_CONFIG.table;
const SUPABASE_ANON_KEY =
  RUNTIME_SUPABASE_CONFIG.anonKey || DEFAULT_SUPABASE_CONFIG.anonKey;

function pushEvent(event, details = {}) {
  if (typeof window.pushAnalyticsEvent === "function") {
    window.pushAnalyticsEvent(event, details);
  } else {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event,
      ...details,
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  document.querySelectorAll("[data-track]").forEach((element) => {
    element.addEventListener("click", () => {
      const eventName = element.getAttribute("data-track");
      const label = element.getAttribute("data-label") || element.textContent.trim();
      const city = element.getAttribute("data-city");
      const serviceType = element.getAttribute("data-service-type");
      const payload = { label };
      if (city) payload.city = city;
      if (serviceType) payload.service_type = serviceType;
      pushEvent(eventName, payload);
    });
  });

  document.querySelectorAll(".accordion-item").forEach((item) => {
    const button = item.querySelector(".accordion-button");
    button.addEventListener("click", () => {
      item.classList.toggle("active");
    });
  });

  document.querySelectorAll(".before-after").forEach((component) => {
    const range = component.querySelector("input[type=range]");
    const after = component.querySelector(".after-image");
    if (range && after) {
      range.addEventListener("input", () => {
        after.style.setProperty("--after-width", `${range.value}%`);
      });
    }
  });

  document.querySelectorAll("form[data-supabase]").forEach((form) => {
    const geoField = form.querySelector("input[name=geo]");
    if (geoField) {
      geoField.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    const utmField = form.querySelector("input[name=utm_source]");
    if (utmField) {
      const params = new URLSearchParams(window.location.search);
      utmField.value = params.get("utm_source") || "website";
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      const submitButton = form.querySelector("button[type=submit]");
      const originalText = submitButton ? submitButton.textContent : null;
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            Prefer: "return=representation",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Supabase request failed");
        }

        const eventName = form.getAttribute("data-event") || "lead_submit";
        const cityField = form.querySelector("[name=city]");
        const serviceField =
          form.querySelector("[name=service_type]") || form.querySelector("[name=service]");
        const serviceType = serviceField ? serviceField.value : payload.service_type || payload.service;
        const city = cityField ? cityField.value : payload.city;
        pushEvent(eventName, {
          service_type: serviceType || "general",
          city: city || "unspecified",
        });

        form.reset();
        form.classList.add("form-success");
        if (submitButton) {
          submitButton.textContent = "Submitted";
        }
      } catch (error) {
        console.error(error);
        form.classList.add("form-error");
        if (submitButton) {
          submitButton.textContent = "Try again";
        }
      } finally {
        if (submitButton) {
          setTimeout(() => {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
          }, 2000);
        }
      }
    });
  });
});
