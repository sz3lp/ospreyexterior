import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter, Poppins } from "next/font/google";
import { randomUUID } from "node:crypto";
import type { ReactNode } from "react";

import "./globals.css";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import StructuredData from "@/components/StructuredData";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ospreyexterior.com"),
  title: {
    default: "Osprey Exterior",
    template: "%s | Osprey Exterior",
  },
  description:
    "RainWise-certified exterior contractor delivering gutters, cisterns, and compliance installs across Seattle and the Eastside.",
  openGraph: {
    type: "website",
    title: "Osprey Exterior",
    description:
      "RainWise-certified exterior contractor delivering gutters, cisterns, and compliance installs across Seattle and the Eastside.",
    siteName: "Osprey Exterior",
    url: "https://ospreyexterior.com",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@ospreyexterior",
  },
};

const businessStructuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Osprey Exterior",
  url: "https://ospreyexterior.com",
  telephone: "+1-425-550-1727",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Seattle",
    addressRegion: "WA",
    postalCode: "98107",
  },
  areaServed: [
    "Seattle",
    "Bellevue",
    "Kirkland",
    "Redmond",
    "Issaquah",
  ],
  sameAs: [
    "https://www.google.com/maps/place/Seattle,+WA",
  ],
};

export default function RootLayout({
  children,
}: {
  readonly children: ReactNode;
}): JSX.Element {
  const headerList = headers();
  const headerRequestId = headerList.get("x-request-id");
  const headerTraceId = headerList.get("x-trace-id");
  const requestId = headerRequestId ?? randomUUID();
  const traceId = headerTraceId ?? requestId;

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable}`}
        data-request-id={requestId}
        data-trace-id={traceId}
      >
        <StructuredData data={businessStructuredData} />
        <AnalyticsProvider requestId={requestId} traceId={traceId}>
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
