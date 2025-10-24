import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Christmas Light Installation | Osprey Exterior',
    template: '%s | Osprey Exterior',
  },
  description:
    'Professional Christmas light installation for homeowners across the Eastside. Osprey Exterior handles install, maintenance, removal, and storage for a safe holiday display.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
