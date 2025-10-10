import Link from 'next/link';
import { LeadForm } from '@/components/forms/LeadForm';
import { PostCard } from '@/components/cards/PostCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { getCities, getPosts } from '@/lib/data';
import { buildLocalBusinessJsonLd } from '@/lib/seo';

const HomePage = async () => {
  const [cities, posts] = await Promise.all([getCities(), getPosts()]);
  const featuredPosts = posts.slice(0, 3);

  return (
    <>
      <JsonLd data={buildLocalBusinessJsonLd()} />
      <section className="section bg-gradient-to-b from-white via-slate-50 to-white">
        <div className="container-default grid items-center gap-12 md:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary">
              Trusted Exterior Experts
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Elevate your home&apos;s curb appeal with Osprey Exterior
            </h1>
            <p className="max-w-xl text-lg text-slate-600">
              We craft resilient roofing, striking siding, and intentional outdoor spaces for homeowners across the Eastside.
              From concept to completion, our team makes exterior remodeling effortless.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="#contact" className="btn-primary">
                Request a Quote
              </Link>
              <Link href="/service-areas/bellevue" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                View Bellevue Projects
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12l-3.75 3.75M21 12H3" />
                </svg>
              </Link>
            </div>
            <dl className="grid gap-6 pt-6 sm:grid-cols-3">
              {[
                { label: 'Projects Delivered', value: '450+' },
                { label: 'Average Rating', value: '4.9/5' },
                { label: 'Years Serving', value: '15' }
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-100 bg-white/80 p-4 text-center shadow-sm">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</dt>
                  <dd className="mt-2 text-2xl font-bold text-primary">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <LeadForm />
        </div>
      </section>

      <section className="section">
        <div className="container-default space-y-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-slate-900">Service areas</h2>
              <p className="text-sm text-slate-600">We proudly support homeowners across the Eastside and Greater Seattle.</p>
            </div>
            <Link href="/service-areas/bellevue" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Explore service cities
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12l-3.75 3.75M21 12H3" />
              </svg>
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((city) => (
              <Link key={city.slug} href={`/service-areas/${city.slug}`} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">{city.name}</h3>
                    {city.hero_description && <p className="mt-2 text-sm text-slate-600">{city.hero_description}</p>}
                  </div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12l-3.75 3.75M21 12H3" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {featuredPosts.length > 0 && (
        <section className="section bg-slate-50/80">
          <div className="container-default space-y-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-slate-900">From the project journal</h2>
                <p className="text-sm text-slate-600">Insights, inspiration, and exterior transformation stories.</p>
              </div>
              <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                View all posts
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12l-3.75 3.75M21 12H3" />
                </svg>
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {featuredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default HomePage;
