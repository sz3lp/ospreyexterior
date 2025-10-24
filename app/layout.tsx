import type { Metadata } from 'next';
import Link from 'next/link';

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
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <header className="site-header">
          <div className="site-header__inner">
            <Link className="site-logo" href="/">
              Osprey Exterior
            </Link>
            <nav aria-label="Primary" className="site-nav">
              <Link className="site-nav__link" href="/services.html">
                Services
              </Link>
              <Link className="site-nav__link" href="/rainwise.html">
                Rainwise
              </Link>
              <Link className="site-nav__link" href="/gutters.html">
                Gutters
              </Link>
              <Link className="site-nav__link" href="/portfolio.html">
                Portfolio
              </Link>
              <Link className="site-nav__link" href="/blog.html">
                Blog
              </Link>
              <Link className="site-nav__link site-nav__link--highlight" href="/christmas-lighting">
                Christmas Lighting
              </Link>
              <a className="site-nav__link site-nav__link--cta" href="tel:+14254070892">
                Call (425) 407-0892
              </a>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
