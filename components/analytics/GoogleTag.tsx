'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export const GoogleTag = () => {
  const measurementId = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID;
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pagePath = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;

  useEffect(() => {
    if (!measurementId) {
      return;
    }

    window.gtag?.('config', measurementId, {
      page_path: pagePath
    });
  }, [measurementId, pagePath]);

  if (!measurementId) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('NEXT_PUBLIC_GOOGLE_TAG_ID is not set; Google Tag will not be initialized.');
    }
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
        onLoad={() => {
          window.gtag?.('config', measurementId, {
            page_path: pagePath
          });
        }}
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: false });
        `}
      </Script>
    </>
  );
};
