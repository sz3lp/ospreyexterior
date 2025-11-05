"use client";

import type { AnalyticsContextValue } from "@/lib/analytics";

export interface LegacyFeatureOptions {
  readonly trackEvent: AnalyticsContextValue["trackEvent"];
  readonly leadEndpoint: string;
}

interface BlogFeedItem {
  readonly id: string;
  readonly url: string;
  readonly title: string;
  readonly summary?: string;
  readonly date_published?: string;
}

const REDIRECT_DELAY_MS = 300;
const YEAR_ATTRIBUTE_SELECTOR = "[data-year]";
const TRACK_ATTRIBUTE_SELECTOR = "[data-track]";
const ACCORDION_SELECTOR = ".accordion-item";
const BEFORE_AFTER_SELECTOR = ".before-after";
const SUPABASE_FORM_SELECTOR = "form[data-supabase]";
const BLOG_GRID_SELECTOR = ".blog-grid[data-feed-source]";
const EXTERNAL_REL = "noopener";

export function initializeLegacyFeatures(
  container: HTMLElement,
  { trackEvent, leadEndpoint }: LegacyFeatureOptions,
): () => void {
  const cleanups: Array<() => void> = [];

  container.querySelectorAll<HTMLElement>(YEAR_ATTRIBUTE_SELECTOR).forEach((element) => {
    element.textContent = new Date().getFullYear().toString();
  });

  container.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((anchor) => {
    if (anchor.hostname !== window.location.hostname) {
      const rel = new Set((anchor.getAttribute("rel") || "").split(" ").filter(Boolean));
      rel.add(EXTERNAL_REL);
      rel.add("noreferrer");
      anchor.setAttribute("rel", Array.from(rel).join(" "));
      if (!anchor.getAttribute("target")) {
        anchor.setAttribute("target", "_blank");
      }
    }
  });

  container.querySelectorAll<HTMLImageElement>("img").forEach((image) => {
    if (!image.hasAttribute("loading")) {
      image.loading = "lazy";
    }
    image.decoding = "async";
  });

  container.querySelectorAll<HTMLElement>(TRACK_ATTRIBUTE_SELECTOR).forEach((element) => {
    const handler = () => {
      const eventName = element.dataset.track;
      if (!eventName) {
        return;
      }
      const payload: Record<string, string> = {};
      if (element.dataset.label) {
        payload.label = element.dataset.label;
      }
      if (element.dataset.city) {
        payload.city = element.dataset.city;
      }
      if (element.dataset.serviceType) {
        payload.service_type = element.dataset.serviceType;
      }
      trackEvent(eventName, payload);
    };
    element.addEventListener("click", handler);
    cleanups.push(() => element.removeEventListener("click", handler));
  });

  container.querySelectorAll<HTMLElement>(ACCORDION_SELECTOR).forEach((item) => {
    const button = item.querySelector<HTMLButtonElement>(".accordion-button");
    if (!button) {
      return;
    }
    const handler = () => {
      item.classList.toggle("active");
    };
    button.addEventListener("click", handler);
    cleanups.push(() => button.removeEventListener("click", handler));
  });

  container.querySelectorAll<HTMLElement>(BEFORE_AFTER_SELECTOR).forEach((component) => {
    const range = component.querySelector<HTMLInputElement>("input[type=range]");
    const afterImage = component.querySelector<HTMLElement>(".after-image");
    if (!range || !afterImage) {
      return;
    }
    const handler = () => {
      afterImage.style.setProperty("--reveal", range.value);
    };
    handler();
    range.addEventListener("input", handler);
    cleanups.push(() => range.removeEventListener("input", handler));
  });

  container.querySelectorAll<HTMLFormElement>(SUPABASE_FORM_SELECTOR).forEach((form) => {
    const geoField = form.querySelector<HTMLInputElement>("input[name=geo]");
    if (geoField && geoField.value.trim().length === 0) {
      try {
        geoField.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch (error) {
        geoField.value = "America/Los_Angeles";
      }
    }

    const utmField = form.querySelector<HTMLInputElement>("input[name=utm_source]");
    if (utmField) {
      const params = new URLSearchParams(window.location.search);
      utmField.value = params.get("utm_source") || "website";
    }

    const submitHandler = async (event: SubmitEvent) => {
      event.preventDefault();
      const submitButton = form.querySelector<HTMLButtonElement>("button[type=submit]");
      const originalText = submitButton?.textContent;
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      const eventName = form.dataset.event || "lead_submit";

      try {
        const response = await fetch(leadEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Lead submission rejected with status ${response.status}`);
        }
      } catch (error) {
        window.dispatchEvent(
          new CustomEvent("osprey:lead-error", {
            detail: {
              message: error instanceof Error ? error.message : String(error),
            },
          }),
        );
        form.classList.add("form-error");
        if (submitButton) {
          submitButton.textContent = "Try again";
          submitButton.disabled = false;
        }
        return;
      }

      const city = (formData.get("city") || formData.get("zip"))?.toString() ?? "unspecified";
      const service =
        formData.get("service_type")?.toString() || formData.get("service")?.toString() || "general";
      trackEvent(eventName, { city, service_type: service });
      form.reset();
      form.classList.remove("form-error");
      form.classList.add("form-success");
      if (submitButton) {
        submitButton.textContent = "Submitted";
      }
      window.setTimeout(() => {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalText ?? "Submit";
        }
        const redirect = new URL("/thank-you", window.location.origin);
        redirect.searchParams.set("service_type", service);
        window.location.href = redirect.toString();
      }, REDIRECT_DELAY_MS);
    };

    form.addEventListener("submit", submitHandler as EventListener);
    cleanups.push(() => form.removeEventListener("submit", submitHandler as EventListener));
  });

  const blogGrid = container.querySelector<HTMLElement>(BLOG_GRID_SELECTOR);
  if (blogGrid) {
    const feedUrl = blogGrid.getAttribute("data-feed-source") || "/feed.json";
    const abortController = new AbortController();
    fetch(feedUrl, { signal: abortController.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load blog feed");
        }
        const feed = (await response.json()) as { items?: BlogFeedItem[] };
        const items = feed.items || [];
        const fragment = document.createDocumentFragment();
        items.slice(0, 6).forEach((item) => {
          const article = document.createElement("article");
          article.className = "blog-card";
          article.setAttribute("itemprop", "itemListElement");

          const link = document.createElement("a");
          link.href = item.url;
          link.className = "blog-card-link";
          link.setAttribute("data-track", "blog_read");
          link.setAttribute("data-label", item.title);

          const heading = document.createElement("h3");
          heading.textContent = item.title;
          heading.className = "blog-card-title";

          const summary = document.createElement("p");
          summary.textContent = item.summary || "";
          summary.className = "blog-card-summary";

          const meta = document.createElement("span");
          meta.className = "blog-card-meta";
          if (item.date_published) {
            const date = new Date(item.date_published);
            meta.textContent = date.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
          }

          link.appendChild(heading);
          link.appendChild(summary);
          link.appendChild(meta);
          article.appendChild(link);
          fragment.appendChild(article);
        });
        blogGrid.innerHTML = "";
        blogGrid.appendChild(fragment);
      })
      .catch(() => {
        blogGrid.classList.add("blog-feed-error");
      });
    cleanups.push(() => abortController.abort());
  }

  return () => {
    cleanups.forEach((cleanup) => {
      cleanup();
    });
  };
}
