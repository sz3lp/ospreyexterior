import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Christmas Lighting Installation in Redmond, WA',
  description:
    'Holiday lighting design, installation, maintenance, and takedown for Redmond and the Greater Eastside. Request a custom Christmas light display today.',
  openGraph: {
    title: 'Custom Christmas Lighting | Osprey Exterior',
    description:
      'RainWise-certified crews providing holiday light design, installation, and takedown for Redmond, Sammamish, and the Eastside.',
    type: 'website',
  },
};

export default function ChristmasLightingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-3MENPSSF97" strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-3MENPSSF97');
          gtag('config', 'G-P1VX9FY873');
        `}
      </Script>
      <Script id="facebook-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '841512635074584');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          alt=""
          height="1"
          width="1"
          style={{ display: 'none' }}
          src="https://www.facebook.com/tr?id=841512635074584&ev=PageView&noscript=1"
        />
      </noscript>
      {children}
    </>
  );
}
