import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Osprey Exterior',
    template: '%s | Osprey Exterior',
  },
  description:
    'RainWise-certified exterior contractor delivering gutters, cisterns, and compliance installs across the greater Seattle area.',
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
