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
      after.style.setProperty("--reveal", range.value);
      range.addEventListener("input", () => {
        after.style.setProperty("--reveal", range.value);
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

        const redirectUrl = new URL("/thank-you.html", window.location.origin);
        if (serviceType) {
          redirectUrl.searchParams.set("service_type", serviceType);
        }

        setTimeout(() => {
          window.location.href = redirectUrl.toString();
        }, 300);
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

  const blogFeedGrid = document.querySelector(".blog-grid[data-feed-source]");
  if (blogFeedGrid) {
    const feedUrl = blogFeedGrid.getAttribute("data-feed-source") || "/feed.json";
    const placeholder = blogFeedGrid.innerHTML;

    const createBlogCard = (item) => {
      const article = document.createElement("article");
      article.className = "blog-card";
      article.setAttribute("itemprop", "itemListElement");
      article.setAttribute("itemscope", "");
      article.setAttribute("itemtype", "https://schema.org/BlogPosting");

      if (Array.isArray(item.tags) && item.tags.length) {
        article.setAttribute("data-tags", item.tags.join(","));
      }

      const imageSrc = item.image || "/assets/images/permeable-hardscape-and-xericulture.JPEG";
      const img = document.createElement("img");
      img.src = imageSrc;
      img.loading = "lazy";
      img.alt = item.title || "Osprey Exterior blog post";
      img.setAttribute("itemprop", "image");
      article.appendChild(img);

      const content = document.createElement("div");
      content.className = "content";

      const heading = document.createElement("h3");
      heading.setAttribute("itemprop", "headline");
      const link = document.createElement("a");
      link.href = item.url || item.id || "#";
      link.textContent = item.title || "Read more";
      link.setAttribute("itemprop", "url");
      heading.appendChild(link);
      content.appendChild(heading);

      if (item.summary) {
        const summary = document.createElement("p");
        summary.setAttribute("itemprop", "description");
        summary.textContent = item.summary;
        content.appendChild(summary);
      }

      if (item.date_published) {
        const time = document.createElement("time");
        time.dateTime = item.date_published;
        const publishedDate = new Date(item.date_published);
        if (!Number.isNaN(publishedDate.getTime())) {
          time.textContent = publishedDate.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        } else {
          time.textContent = item.date_published;
        }
        time.className = "blog-card-date";
        content.appendChild(time);
      }

      const readMore = document.createElement("a");
      readMore.href = item.url || item.id || "#";
      readMore.textContent = "Read article";
      readMore.setAttribute("aria-label", `Read ${item.title || "blog post"}`);
      readMore.className = "text-link";
      content.appendChild(readMore);

      article.appendChild(content);
      return article;
    };

    blogFeedGrid.setAttribute("aria-busy", "true");

    fetch(feedUrl)
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load blog feed");
        return response.json();
      })
      .then((data) => {
        if (!data || !Array.isArray(data.items)) {
          throw new Error("Invalid blog feed format");
        }

        blogFeedGrid.innerHTML = "";
        data.items.forEach((item) => {
          const card = createBlogCard(item);
          blogFeedGrid.appendChild(card);
        });
        blogFeedGrid.setAttribute("aria-busy", "false");
      })
      .catch((error) => {
        console.error(error);
        blogFeedGrid.innerHTML = placeholder;
        blogFeedGrid.setAttribute("data-feed-error", "true");
        blogFeedGrid.setAttribute("aria-busy", "false");
      });
  }
});
