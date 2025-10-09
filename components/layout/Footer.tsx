import Link from 'next/link';
import { SERVICE_AREA_SLUGS } from '@/lib/data';

const serviceAreaLinks = SERVICE_AREA_SLUGS.map((slug) => ({
  href: `/service-areas/${slug}`,
  label: slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}));

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-100 bg-slate-50/60">
      <div className="container-default grid gap-12 py-16 md:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-bold text-primary">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">OE</span>
            <span>Osprey Exterior</span>
          </div>
          <p className="text-sm text-slate-600">
            Premium exterior remodeling, roofing, and outdoor upgrades serving the Eastside and Greater Seattle communities.
          </p>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Navigation</h3>
          <ul className="mt-4 grid gap-3 text-sm text-slate-600">
            <li>
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-primary">
                Blog
              </Link>
            </li>
            <li>
              <a href="#contact" className="hover:text-primary">
                Contact
              </a>
            </li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Service Areas</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600 sm:grid-cols-3">
            {serviceAreaLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-primary">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 bg-white py-6">
        <div className="container-default flex flex-col justify-between gap-4 text-xs text-slate-500 sm:flex-row">
          <span>© {currentYear} Osprey Exterior. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
