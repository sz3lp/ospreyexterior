(function () {
  const GA_IDS = ["G-3MENPSSF97", "G-P1VX9FY873", "AW-11395982028"].filter(Boolean);
  const GTM_ID = "";
  const HUBSPOT_PORTAL_ID = "244291121";

  const dataLayer = (window.dataLayer = window.dataLayer || []);
  const params = new URLSearchParams(window.location.search);
  const baseDimensions = {
    traffic_source: params.get("utm_source") || "direct",
  };

  window.analyticsDimensions = baseDimensions;

  window.pushAnalyticsEvent = function (eventName, details = {}) {
    const payload = {
      event: eventName,
      ...baseDimensions,
      ...details,
    };
    dataLayer.push(payload);
    if (typeof window.gtag === "function") {
      const gtagPayload = {
        ...baseDimensions,
        ...details,
      };
      try {
        window.gtag("event", eventName, gtagPayload);
      } catch (err) {
        if (window.console && console.debug) {
          console.debug("Analytics event fallback", err);
        }
      }
    }
    return payload;
  };

  function loadScript(src, callback) {
    const script = document.createElement("script");
    script.async = true;
    script.src = src;
    if (callback) {
      script.addEventListener("load", callback);
    }
    document.head.appendChild(script);
  }

  if (GTM_ID) {
    loadScript(`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`);
  }

  if (GA_IDS.length) {
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA_IDS[0]}`, () => {
      window.gtag = function gtag() {
        dataLayer.push(arguments);
      };
      window.gtag("js", new Date());
      GA_IDS.forEach((id) => {
        window.gtag("config", id, {
          custom_map: {
            dimension1: "city",
            dimension2: "service_type",
            dimension3: "traffic_source",
          },
        });
      });
    });
  }

  if (HUBSPOT_PORTAL_ID) {
    const existingHubspotLoader = document.getElementById("hs-script-loader");
    if (!existingHubspotLoader) {
      const hubspotScript = document.createElement("script");
      hubspotScript.id = "hs-script-loader";
      hubspotScript.async = true;
      hubspotScript.defer = true;
      hubspotScript.src = `https://js-na2.hs-scripts.com/${HUBSPOT_PORTAL_ID}.js`;
      document.head.appendChild(hubspotScript);
    }
  }

  window.analyticsIntegrations = {
    registerPixel(id) {
      if (!id) return;
      loadScript(`https://connect.facebook.net/en_US/fbevents.js`, () => {
        if (window.fbq) return;
        const fbq = function () {
          fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
        };
        fbq.push = fbq;
        fbq.loaded = true;
        fbq.version = "2.0";
        fbq.queue = [];
        window.fbq = fbq;
        fbq("init", id);
      });
    },
    registerClarity(projectId) {
      if (!projectId) return;
      if (window.clarity) return;
      loadScript(`https://www.clarity.ms/tag/${projectId}`);
    },
  };
})();
