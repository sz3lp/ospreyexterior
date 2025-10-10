import Script from 'next/script';
import { trackingConfig } from '@/lib/tracking';

const {
  googleAnalyticsId,
  googleTagManagerId,
  googleAdsConversionId,
  metaPixelId,
  linkedinPartnerId,
  microsoftClarityId,
  pinterestTagId,
  tiktokPixelId
} = trackingConfig;

export const TrackingScripts = () => {
  if (!googleAnalyticsId && !googleTagManagerId && !metaPixelId && !linkedinPartnerId && !microsoftClarityId && !pinterestTagId && !tiktokPixelId && !googleAdsConversionId) {
    return null;
  }

  return (
    <>
      {googleTagManagerId && (
        <>
          <Script id="gtm-loader" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){
                w[l]=w[l]||[];
                w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
                var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:'';
                j.async=true;
                j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${googleTagManagerId}');
            `}
          </Script>
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`
            }}
          />
        </>
      )}

      {(googleAnalyticsId || googleAdsConversionId) && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId || googleAdsConversionId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-gtag" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              ${googleAnalyticsId ? `gtag('config', '${googleAnalyticsId}', { send_page_view: false });` : ''}
              ${googleAdsConversionId ? `gtag('config', '${googleAdsConversionId}', { send_page_view: false });` : ''}
            `}
          </Script>
        </>
      )}

      {metaPixelId && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !(function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)})(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1" alt="" />`
            }}
          />
        </>
      )}

      {linkedinPartnerId && (
        <>
          <Script id="linkedin-insight" strategy="afterInteractive">
            {`
              window._linkedin_partner_id = '${linkedinPartnerId}';
              if (!window._linkedin_data_partner_ids) {
                window._linkedin_data_partner_ids = [];
              }
              window._linkedin_data_partner_ids.push(window._linkedin_partner_id);
            `}
          </Script>
          <Script id="linkedin-loader" strategy="afterInteractive">
            {`
              (function(){
                var s = document.getElementsByTagName('script')[0];
                var b = document.createElement('script');
                b.type = 'text/javascript';
                b.async = true;
                b.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
                s.parentNode.insertBefore(b, s);
              })();
            `}
          </Script>
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<img height="1" width="1" style="display:none" src="https://px.ads.linkedin.com/collect/?pid=${linkedinPartnerId}&fmt=gif" alt="" />`
            }}
          />
        </>
      )}

      {microsoftClarityId && (
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, 'clarity', 'script', '${microsoftClarityId}');
          `}
        </Script>
      )}

      {pinterestTagId && (
        <>
          <Script id="pinterest-base" strategy="afterInteractive">
            {`
              !function(e){if(!window.pintrk){window.pintrk = function () {
                window.pintrk.queue.push(Array.prototype.slice.call(arguments));
              };var n=window.pintrk;n.queue=[],n.version="3.0";var
              t=document.createElement("script");t.async=!0,t.src=e;var
              r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r);}}
              ('https://s.pinimg.com/ct/core.js');
              pintrk('load', '${pinterestTagId}');
              pintrk('page');
            `}
          </Script>
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<img height="1" width="1" style="display:none" src="https://ct.pinterest.com/v3/?event=init&tid=${pinterestTagId}&noscript=1" alt="" />`
            }}
          />
        </>
      )}

      {tiktokPixelId && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject = t;
              var ttq = w[t] = w[t] || [];
              ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie'];
              ttq.setAndDefer = function(t, e) {
                t[e] = function() {
                  t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
                };
              };
              for (var i = 0; i < ttq.methods.length; i++) {
                ttq.setAndDefer(ttq, ttq.methods[i]);
              }
              ttq.instance = function(t) {
                var e = ttq._i[t] || [];
                for (var n = 0; n < ttq.methods.length; n++) {
                  ttq.setAndDefer(e, ttq.methods[n]);
                }
                return e;
              };
              ttq.load = function(e, n) {
                var i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
                ttq._i = ttq._i || {};
                ttq._i[e] = [];
                ttq._i[e]._u = i;
                ttq._t = ttq._t || {};
                ttq._t[e] = +new Date;
                ttq._o = ttq._o || {};
                ttq._o[e] = n || {};
                var o = document.createElement('script');
                o.type = 'text/javascript';
                o.async = !0;
                o.src = i + '?sdkid=' + e + '&lib=' + t;
                var a = document.getElementsByTagName('script')[0];
                a.parentNode.insertBefore(o, a);
              };
              ttq.load('${tiktokPixelId}');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>
      )}
    </>
  );
};
