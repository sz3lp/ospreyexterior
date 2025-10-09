'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SERVICE_AREA_SLUGS } from '@/lib/data';
import { Navigation } from './Navigation';

const serviceAreaLinks = SERVICE_AREA_SLUGS.map((slug) => ({
  href: `/service-areas/${slug}`,
  label: slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}));

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="container-default flex items-center justify-between py-5">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">OE</span>
          <span>Osprey Exterior</span>
        </Link>
        <Navigation />
        <button
          className="inline-flex items-center justify-center rounded-full border border-slate-200 p-2 text-slate-600 transition hover:border-primary hover:text-primary md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5M3.75 12h16.5m-16.5 6.75h16.5" />
          </svg>
        </button>
      </div>
      {isOpen && (
        <div className="border-t border-slate-100 bg-white px-4 pb-6 pt-4 md:hidden">
          <div className="flex flex-col gap-4 text-sm font-semibold uppercase tracking-wide text-slate-700">
            <Link href="/" onClick={() => setIsOpen(false)} className="hover:text-primary">
              Home
            </Link>
            <Link href="/blog" onClick={() => setIsOpen(false)} className="hover:text-primary">
              Blog
            </Link>
            <div className="grid gap-2">
              <span className="text-xs font-bold text-slate-400">Service Areas</span>
              {serviceAreaLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className="rounded-lg bg-slate-50 px-3 py-2">
                  {link.label}
                </Link>
              ))}
            </div>
            <a href="#contact" onClick={() => setIsOpen(false)} className="hover:text-primary">
              Contact
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
