"use client";

import Script from "next/script";
import { useEffect, useMemo, type ReactNode } from "react";

import { AnalyticsContext, useAnalyticsValue } from "@/lib/analytics";

export interface AnalyticsProviderProps {
  readonly children: ReactNode;
  readonly requestId: string;
  readonly traceId: string;
}

const gaIds = (process.env.NEXT_PUBLIC_GA_IDS || "")
  .split(",")
  .map((value) => value.trim())
  .filter((value) => value.length > 0);

const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

export default function AnalyticsProvider({
  children,
  requestId,
  traceId,
}: AnalyticsProviderProps): JSX.Element {
  const contextValue = useAnalyticsValue({ requestId, traceId });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.ospreyAnalytics = window.ospreyAnalytics || {
      gaIds: gaIds.slice(),
      gtmId: gtmId || null,
      requestId,
      traceId,
    };
  }, [requestId, traceId]);

  const scripts = useMemo(() => {
    if (gaIds.length === 0 && !gtmId) {
      return null;
    }

    const scriptElements: JSX.Element[] = [];
    if (gtmId) {
      scriptElements.push(
        <Script
          key="gtm"
          id="gtm-loader"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`}
        />,
      );
    }

    if (gaIds.length > 0) {
      const primaryId = gaIds[0];
      scriptElements.push(
        <Script
          key="gtag"
          id="gtag-loader"
          src={`https://www.googletagmanager.com/gtag/js?id=${primaryId}`}
          strategy="afterInteractive"
        />,
      );
      scriptElements.push(
        <Script
          key="gtag-init"
          id="gtag-init"
          strategy="afterInteractive"
        >
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            ${gaIds
              .map(
                (id) =>
                  `gtag('config', '${id}', { custom_map: { dimension1: 'city', dimension2: 'service_type', dimension3: 'traffic_source', dimension4: 'request_id' } });`,
              )
              .join("\n")}
          `}
        </Script>,
      );
    }

    return scriptElements;
  }, []);

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {scripts}
      {children}
    </AnalyticsContext.Provider>
  );
}
