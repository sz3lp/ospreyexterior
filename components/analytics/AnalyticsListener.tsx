'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackingConfig } from '@/lib/tracking';

const {
  googleAnalyticsId,
  googleAdsConversionId,
  metaPixelId,
  pinterestTagId,
  tiktokPixelId
} = trackingConfig;

const trackPageView = (url: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (googleAnalyticsId && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: url,
      page_location: window.location.href
    });
  }

  if (googleAdsConversionId && typeof window.gtag === 'function') {
    window.gtag('config', googleAdsConversionId, {
      page_path: url
    });
  }

  if (metaPixelId && typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }

  if (pinterestTagId && typeof window.pintrk === 'function') {
    window.pintrk('page');
  }

  if (tiktokPixelId && typeof window.ttq === 'object' && typeof window.ttq.page === 'function') {
    window.ttq.page();
  }

  if (typeof window.clarity === 'function') {
    window.clarity('track', 'page_view', { page_path: url });
  }
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    pintrk?: (...args: unknown[]) => void;
    ttq?: {
      page: () => void;
      track: (event: string, payload?: Record<string, unknown>) => void;
    };
    clarity?: (...args: unknown[]) => void;
  }
}

export const AnalyticsListener = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) {
      return;
    }

    const url = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;
    trackPageView(url);
  }, [pathname, searchParams]);

  return null;
};
