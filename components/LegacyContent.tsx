"use client";

import { useEffect, useRef } from "react";

import { useAnalytics } from "@/lib/analytics";
import { initializeLegacyFeatures } from "@/lib/legacy-features";
import type { ContentPage } from "@/services/content-loader";

const LEAD_ENDPOINT = "/api/leads";

export interface LegacyContentProps {
  readonly page: ContentPage;
}

export default function LegacyContent({ page }: LegacyContentProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    const cleanup = initializeLegacyFeatures(containerRef.current, {
      trackEvent,
      leadEndpoint: LEAD_ENDPOINT,
    });

    return cleanup;
  }, [trackEvent, page.html]);

  return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: page.html }} />;
}
