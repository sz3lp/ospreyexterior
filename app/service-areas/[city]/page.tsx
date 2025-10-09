import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import { LeadForm } from '@/components/forms/LeadForm';
import { PostCard } from '@/components/cards/PostCard';
import { getCityBySlug, getPostsByCity, SERVICE_AREA_SLUGS } from '@/lib/data';
import { buildFaqJsonLd, buildLocalBusinessJsonLd, buildMetadata } from '@/lib/seo';

export const dynamicParams = false;

export const generateStaticParams = () => SERVICE_AREA_SLUGS.map((slug) => ({ city: slug }));

export const generateMetadata = async ({ params }: { params: { city: string } }): Promise<Metadata> => {
  const city = await getCityBySlug(params.city);

  if (!city) {
    return buildMetadata({ title: 'Service Area Not Found' });
  }

  return buildMetadata({
    title: `${city.name} Exterior Remodeling`,
    description: city.hero_description,
    canonical: `https://ospreyexterior.com/service-areas/${city.slug}`
  });
};

const ServiceAreaPage = async ({ params }: { params: { city: string } }) => {
  const city = await getCityBySlug(params.city);

  if (!city) {
    notFound();
  }

  const posts = await getPostsByCity(city.slug);
  const faqs = city.faqs || [];

  return (
    <>
      <JsonLd
        data={[
          buildLocalBusinessJsonLd(city),
          faqs.length > 0 ? buildFaqJsonLd(faqs) : null
        ].filter(Boolean) as Record<string, unknown>[]}
      />
      <section className="section bg-gradient-to-b from-white via-slate-50 to-white">
        <div className="container-default grid gap-12 md:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Serving {city.name}</p>
            <h1 className="text-4xl font-bold text-slate-900">{city.hero_title || `Exterior remodeling in ${city.name}`}</h1>
            {city.hero_description && <p className="text-lg text-slate-600">{city.hero_description}</p>}
            {city.service_highlights && city.service_highlights.length > 0 && (
              <ul className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                {city.service_highlights.map((highlight) => (
                  <li key={highlight} className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </span>
                    {highlight}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-4">
              <a href="#contact" className="btn-primary">
                Schedule a consultation
              </a>
              <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Browse recent projects
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12l-3.75 3.75M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
          <LeadForm city={city.name} />
        </div>
      </section>

      <section className="section">
        <div className="container-default space-y-8">
          <h2 className="text-2xl font-semibold text-slate-900">Recent {city.name} exterior projects</h2>
          {posts.length === 0 ? (
            <div className="card text-sm text-slate-600">We&apos;re lining up our next {city.name} project story. Check back soon!</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="section bg-slate-50/80">
          <div className="container-default space-y-8">
            <h2 className="text-2xl font-semibold text-slate-900">{city.name} homeowner questions</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <details key={faq.question} className="card">
                  <summary className="cursor-pointer text-lg font-semibold text-slate-900">{faq.question}</summary>
                  <p className="mt-3 text-sm text-slate-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default ServiceAreaPage;
