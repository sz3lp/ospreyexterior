window.dataLayer = window.dataLayer || [];

const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_TABLE = "leads";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

function pushEvent(event, details = {}) {
  window.dataLayer.push({
    event,
    ...details,
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-track]").forEach((element) => {
    element.addEventListener("click", () => {
      const eventName = element.getAttribute("data-track");
      const label = element.getAttribute("data-label") || element.textContent.trim();
      pushEvent(eventName, { label });
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
        pushEvent(eventName, { service: payload.service_type || payload.service || "general" });

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
