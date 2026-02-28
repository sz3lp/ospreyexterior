/**
 * Google tag (gtag.js) - GA4 + Google Ads
 * Include this script on every page. Loads gtag and configures both GA4 and Ads.
 */
(function() {
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=G-P1VX9FY873';
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', 'G-P1VX9FY873');
  gtag('config', 'AW-11395982028');

  /** Appointment Booked conversion - call on form submit or CTA click. Pass url to redirect after conversion, or omit to fire without redirect. */
  window.gtag_report_conversion = function(url) {
    var callback = function() {
      if (typeof url !== 'undefined') {
        window.location = url;
      }
    };
    gtag('event', 'conversion', {
      'send_to': 'AW-11395982028/rBIyCJrlvbQaEMzFg7oq',
      'value': 1.0,
      'currency': 'USD',
      'event_callback': callback
    });
    return false;
  };
})();
