'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SERVICE_AREA_LINKS } from '@/lib/serviceAreas';

export const Navigation = () => {
  const pathname = usePathname();

  return (
    <nav className="hidden gap-6 text-sm font-semibold uppercase tracking-wide text-slate-700 md:flex">
      <Link
        href="/"
        className={`transition hover:text-primary ${pathname === '/' ? 'text-primary' : ''}`}
      >
        Home
      </Link>
      <Link
        href="/blog"
        className={`transition hover:text-primary ${pathname?.startsWith('/blog') ? 'text-primary' : ''}`}
      >
        Blog
      </Link>
      <div className="group relative">
        <span className="cursor-pointer transition group-hover:text-primary">Service Areas</span>
        <div className="invisible absolute top-full left-0 z-20 mt-3 w-64 rounded-2xl border border-slate-100 bg-white p-4 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
          <div className="grid gap-2 text-xs font-medium uppercase tracking-wide text-slate-600">
            {SERVICE_AREA_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-lg px-3 py-2 hover:bg-slate-50 hover:text-primary">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <a href="#contact" className="transition hover:text-primary">
        Contact
      </a>
    </nav>
  );
};
