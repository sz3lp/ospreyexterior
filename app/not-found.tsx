import Link from 'next/link';

const NotFoundPage = () => (
  <section className="section">
    <div className="container-default mx-auto max-w-2xl text-center">
      <h1 className="text-5xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-4 text-lg text-slate-600">
        The page you&apos;re looking for is taking a break on the jobsite. Head back home or explore our service areas.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/" className="btn-primary">
          Back to home
        </Link>
        <Link href="/service-areas" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          Explore service areas
        </Link>
      </div>
    </div>
  </section>
);

export default NotFoundPage;
