import './globals.css';

import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { buildMetadata } from '@/lib/seo';
import { TrackingScripts } from '@/components/analytics/TrackingScripts';
import { AnalyticsListener } from '@/components/analytics/AnalyticsListener';

export const metadata: Metadata = buildMetadata({});

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900">
        <TrackingScripts />
        <AnalyticsListener />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
};

export default RootLayout;
