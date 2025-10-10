import 'server-only';

import { cache } from 'react';
import { supabaseServerClient } from './supabaseServer';
import { City, Post } from './types';
import { SERVICE_AREA_SLUGS, formatServiceAreaName } from './serviceAreas';

const hasSupabaseCredentials = Boolean(
  (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)
);

const FALLBACK_CITIES: City[] = SERVICE_AREA_SLUGS.map((slug) => {
  const name = formatServiceAreaName(slug);

  return {
    id: slug,
    slug,
    name,
    hero_title: `${name} exterior remodeling experts`,
    hero_description: `Premium roofing, siding, and outdoor living projects delivered by Osprey Exterior across ${name}.`,
    service_highlights: [
      'Architectural roofing systems',
      'High-performance siding upgrades',
      'Outdoor living and hardscape design',
      'Seasonal maintenance plans'
    ],
    faqs: [
      {
        question: `How soon can Osprey Exterior start a project in ${name}?`,
        answer:
          'Most projects begin within 4-6 weeks depending on permitting and material lead times. We keep you informed at every step.'
      },
      {
        question: 'Do you handle design and permitting?',
        answer:
          'Yes. Our team manages concept design, HOA coordination, and permitting so your project stays on schedule.'
      }
    ],
    updated_at: new Date().toISOString()
  };
});

const FALLBACK_POSTS: Post[] = [
  {
    id: 'bellevue-modern-roof-refresh',
    slug: 'bellevue-modern-roof-refresh',
    title: 'Bellevue Modern Roof Refresh',
    excerpt:
      'See how our team transformed an aging Bellevue roof into a sleek, energy-efficient system built for Pacific Northwest weather.',
    content:
      '<p>Our Bellevue client wanted a durable, modern roof that could stand up to year-round rain without sacrificing curb appeal. We upgraded their home with architectural shingles, a concealed gutter system, and enhanced attic ventilation to keep energy bills in check. The project wrapped in just five days with zero change orders.</p><p>Highlights included premium underlayment for moisture protection, upgraded flashing at all penetrations, and a post-install roof tune-up to make sure everything drained flawlessly.</p>',
    featured_image:
      'https://images.unsplash.com/photo-1505692794403-35d0c0f84f35?auto=format&fit=crop&w=1200&q=80',
    city_slug: 'bellevue',
    published_at: '2024-04-12T00:00:00.000Z',
    updated_at: '2024-04-12T00:00:00.000Z'
  },
  {
    id: 'kirkland-outdoor-living-retreat',
    slug: 'kirkland-outdoor-living-retreat',
    title: 'Kirkland Outdoor Living Retreat',
    excerpt:
      'A lakeside deck, cedar pergola, and integrated lighting created a year-round outdoor escape for this Kirkland family.',
    content:
      '<p>This lakeside property needed a seamless transition between indoor and outdoor spaces. We engineered a composite deck with hidden fasteners, added a cedar pergola for filtered shade, and wired dimmable lighting to set the mood after sunset. Custom steel cable railing keeps sightlines open to the lake while meeting code.</p><p>The project also included a drainage upgrade with permeable pavers beneath the deck to keep the crawlspace dry all winter long.</p>',
    featured_image:
      'https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c?auto=format&fit=crop&w=1200&q=80',
    city_slug: 'kirkland',
    published_at: '2024-03-22T00:00:00.000Z',
    updated_at: '2024-03-22T00:00:00.000Z'
  },
  {
    id: 'sammamish-siding-and-stone',
    slug: 'sammamish-siding-and-stone',
    title: 'Sammamish Siding & Stone Makeover',
    excerpt:
      'Fiber cement siding and a stacked-stone entryway gave this Sammamish two-story a welcoming, low-maintenance refresh.',
    content:
      '<p>We replaced tired lap siding with prefinished fiber cement panels, integrated rainscreen detailing, and upgraded insulation to quiet the interior. The entry received stacked-stone columns and tongue-and-groove cedar soffits for a warm welcome.</p><p>Because Sammamish code requires strict drainage plane detailing, our crew installed metal flashing at every transition and performed blower door testing to confirm the envelope was sealed.</p>',
    featured_image:
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    city_slug: 'sammamish',
    published_at: '2024-02-15T00:00:00.000Z',
    updated_at: '2024-02-15T00:00:00.000Z'
  }
];

const toTitleFromSlug = (slug: string) =>
  slug
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

const normalizeCityRecord = (record: Record<string, unknown>): City | null => {
  const rawSlug = typeof record.slug === 'string' ? record.slug : null;
  const fallback = rawSlug ? FALLBACK_CITIES.find((city) => city.slug === rawSlug) : null;
  const slug = rawSlug || fallback?.slug;

  if (!slug) {
    return null;
  }

  const fallbackName = fallback?.name || formatServiceAreaName(slug);

  return {
    id: (record.id as string | number | undefined)?.toString() || fallback?.id || slug,
    slug,
    name: (record.name as string | null) || fallbackName,
    hero_title: (record.hero_title as string | null) || fallback?.hero_title || `Exterior remodeling in ${fallbackName}`,
    hero_description: (record.hero_description as string | null) || fallback?.hero_description,
    service_highlights: (record.service_highlights as string[] | null) || fallback?.service_highlights || null,
    faqs: (record.faqs as { question: string; answer: string }[] | null) || fallback?.faqs || null,
    updated_at: (record.updated_at as string | null) || fallback?.updated_at || null
  };
};

const normalizePostRecord = (record: Record<string, unknown>): Post | null => {
  const rawSlug = typeof record.slug === 'string' ? record.slug : null;
  const fallback = rawSlug ? FALLBACK_POSTS.find((post) => post.slug === rawSlug) : null;
  const slug = rawSlug || fallback?.slug;

  if (!slug) {
    return null;
  }

  const title = (record.title as string | null) || fallback?.title || toTitleFromSlug(slug);
  const publishedAt = (record.published_at as string | null) || fallback?.published_at || null;
  const updatedAt = (record.updated_at as string | null) || fallback?.updated_at || publishedAt;

  return {
    id: (record.id as string | number | undefined)?.toString() || fallback?.id || slug,
    slug,
    title,
    excerpt: (record.excerpt as string | null) || fallback?.excerpt || null,
    content: (record.content as string | null) || fallback?.content || null,
    featured_image: (record.featured_image as string | null) || fallback?.featured_image || null,
    city_slug: (record.city_slug as string | null) || fallback?.city_slug || null,
    published_at: publishedAt,
    updated_at: updatedAt
  };
};

export const getCities = cache(async (): Promise<City[]> => {
  if (!hasSupabaseCredentials) {
    return FALLBACK_CITIES;
  }
  const supabase = supabaseServerClient();
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .in('slug', SERVICE_AREA_SLUGS)
    .order('name', { ascending: true });

  if (error) {
    console.error('[Supabase] getCities error', error);
    return FALLBACK_CITIES;
  }

  const normalized = Array.isArray(data)
    ? (data
        .map((record) => normalizeCityRecord(record as Record<string, unknown>))
        .filter(Boolean) as City[])
    : [];

  return normalized.length > 0 ? normalized : FALLBACK_CITIES;
});

export const getCityBySlug = cache(async (slug: string): Promise<City | null> => {
  if (!hasSupabaseCredentials) {
    return FALLBACK_CITIES.find((city) => city.slug === slug) ?? null;
  }
  const supabase = supabaseServerClient();
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('[Supabase] getCityBySlug error', error);
    return FALLBACK_CITIES.find((city) => city.slug === slug) ?? null;
  }

  if (!data) {
    return FALLBACK_CITIES.find((city) => city.slug === slug) ?? null;
  }

  return normalizeCityRecord(data as Record<string, unknown>) ??
    FALLBACK_CITIES.find((city) => city.slug === slug) ??
    null;
});

export const getPosts = cache(async (): Promise<Post[]> => {
  if (!hasSupabaseCredentials) {
    return FALLBACK_POSTS;
  }
  const supabase = supabaseServerClient();
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('[Supabase] getPosts error', error);
    return FALLBACK_POSTS;
  }

  const normalized = Array.isArray(data)
    ? (data
        .map((record) => normalizePostRecord(record as Record<string, unknown>))
        .filter(Boolean) as Post[])
    : [];

  return normalized.length > 0 ? normalized : FALLBACK_POSTS;
});

export const getPostsByCity = cache(async (slug: string): Promise<Post[]> => {
  const posts = await getPosts();
  return posts.filter((post) => post.city_slug === slug);
});

export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  const posts = await getPosts();
  return posts.find((post) => post.slug === slug) ?? null;
});
