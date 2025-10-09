import { Metadata } from 'next';
import Link from 'next/link';
import { getCities } from '@/lib/data';
import { buildLocalBusinessJsonLd, buildMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = buildMetadata({
  title: 'Service Areas',
  description: 'Explore the Greater Seattle cities where Osprey Exterior delivers roofing, siding, and outdoor living upgrades.',
  canonical: 'https://ospreyexterior.com/service-areas'
});

const ServiceAreasPage = async () => {
  const cities = await getCities();

  return (
    <section className="section">
      <JsonLd data={buildLocalBusinessJsonLd()} />
      <div className="container-default space-y-10">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-4xl font-bold text-slate-900">Service Areas</h1>
          <p className="text-lg text-slate-600">
            We bring thoughtful exterior craftsmanship to neighborhoods across the Eastside and Seattle metro. Select your city
            to explore recent projects, FAQs, and tailored service details.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <Link key={city.slug} href={`/service-areas/${city.slug}`} className="card">
              <h2 className="text-xl font-semibold text-slate-900">{city.name}</h2>
              {city.hero_description && <p className="mt-2 text-sm text-slate-600">{city.hero_description}</p>}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceAreasPage;
