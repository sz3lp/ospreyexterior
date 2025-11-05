"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export interface AnalyticsEventPayload {
  readonly event: string;
  readonly [key: string]: string | number | boolean | null | undefined;
}

export interface AnalyticsDimensions {
  readonly traffic_source: string;
  readonly request_id: string;
  readonly trace_id: string;
}

export interface AnalyticsContextValue {
  readonly trackEvent: (
    eventName: string,
    details?: Partial<Omit<AnalyticsEventPayload, "event">>,
  ) => AnalyticsEventPayload;
}

export interface UseAnalyticsValueInput {
  readonly requestId: string;
  readonly traceId: string;
}

export const AnalyticsContext = createContext<AnalyticsContextValue>({
  trackEvent: () => ({ event: "noop" }),
});

export function useAnalytics(): AnalyticsContextValue {
  return useContext(AnalyticsContext);
}

export function useAnalyticsValue({
  requestId,
  traceId,
}: UseAnalyticsValueInput): AnalyticsContextValue {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const trafficSource = searchParams?.get("utm_source") ?? "direct";

  const baseDimensions = useMemo<AnalyticsDimensions>(
    () => ({
      traffic_source: trafficSource,
      request_id: requestId,
      trace_id: traceId,
    }),
    [trafficSource, requestId, traceId],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.analyticsDimensions = baseDimensions;
    window.pushAnalyticsEvent = (eventName, details = {}) => {
      const payload: AnalyticsEventPayload = {
        event: eventName,
        ...baseDimensions,
        ...details,
        page_path: pathname,
      };
      const dataLayer = (window.dataLayer = window.dataLayer || []);
      dataLayer.push(payload);
      if (typeof window.gtag === "function") {
        try {
          window.gtag("event", eventName, payload);
        } catch (error) {
          window.dispatchEvent(
            new CustomEvent("osprey:analytics-error", {
              detail: {
                scope: "gtag",
                message: error instanceof Error ? error.message : String(error),
              },
            }),
          );
        }
      }
      return payload;
    };
  }, [baseDimensions, pathname]);

  return useMemo<AnalyticsContextValue>(
    () => ({
      trackEvent: (eventName, details = {}) => {
        if (typeof window !== "undefined" && typeof window.pushAnalyticsEvent === "function") {
          return window.pushAnalyticsEvent(eventName, details);
        }
        return {
          event: eventName,
          ...baseDimensions,
          ...details,
          page_path: pathname,
        };
      },
    }),
    [baseDimensions, pathname],
  );
}

declare global {
  interface Window {
    readonly dataLayer?: Array<Record<string, unknown>>;
    gtag?: (command: string, action: string | Date, params?: Record<string, unknown>) => void;
    pushAnalyticsEvent?: (
      eventName: string,
      details?: Partial<Omit<AnalyticsEventPayload, "event" | "page_path">>,
    ) => AnalyticsEventPayload;
    analyticsDimensions?: AnalyticsDimensions;
    ospreyAnalytics?: {
      readonly gaIds: string[];
      readonly gtmId: string | null;
      readonly requestId: string;
      readonly traceId: string;
    };
  }
}
