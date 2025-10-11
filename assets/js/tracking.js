(function () {
  const GA_ID = "G-XXXXXXXXXX";
  const GTM_ID = "GTM-XXXXXXX";

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

  if (GA_ID) {
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`, () => {
      window.gtag = function gtag() {
        dataLayer.push(arguments);
      };
      window.gtag("js", new Date());
      window.gtag("config", GA_ID, {
        custom_map: {
          dimension1: "city",
          dimension2: "service_type",
          dimension3: "traffic_source",
        },
      });
    });
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
