import { Metadata } from 'next';
import { City, Post } from './types';

const siteName = 'Osprey Exterior';
const siteUrl = 'https://ospreyexterior.com';
const defaultDescription =
  'Exterior home services for the Greater Seattle area including roofing, siding, and outdoor living upgrades.';

export const buildMetadata = ({
  title,
  description,
  canonical
}: {
  title?: string;
  description?: string | null;
  canonical?: string;
}): Metadata => ({
  metadataBase: new URL(siteUrl),
  title: title ? `${title} | ${siteName}` : siteName,
  description: description || defaultDescription,
  openGraph: {
    title: title ? `${title} | ${siteName}` : siteName,
    description: description || defaultDescription,
    url: canonical,
    siteName,
    type: 'website'
  },
  alternates: canonical
    ? {
        canonical
      }
    : undefined,
  twitter: {
    card: 'summary_large_image',
    title: title ? `${title} | ${siteName}` : siteName,
    description: description || defaultDescription
  }
});

export const buildLocalBusinessJsonLd = (city?: City) => {
  const addressCity = city?.name || 'Bellevue';

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `${siteName}${city ? ` - ${city.name}` : ''}`,
    image: `${siteUrl}/assets/hero.jpg`,
    '@id': siteUrl,
    url: siteUrl,
    telephone: '+1-425-555-0123',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Lake View Dr',
      addressLocality: addressCity,
      addressRegion: 'WA',
      postalCode: '98004',
      addressCountry: 'US'
    },
    areaServed: {
      '@type': 'City',
      name: addressCity
    },
    priceRange: '$$'
  };
};

export const buildArticleJsonLd = (post: Post) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.title,
  description: post.excerpt,
  image: post.featured_image || `${siteUrl}/assets/hero.jpg`,
  author: {
    '@type': 'Organization',
    name: siteName
  },
  publisher: {
    '@type': 'Organization',
    name: siteName,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/favicon.png`
    }
  },
  datePublished: post.published_at,
  dateModified: post.updated_at || post.published_at,
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${siteUrl}/blog/${post.slug}`
  }
});

export const buildFaqJsonLd = (faqs: { question: string; answer: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer
    }
  }))
});
