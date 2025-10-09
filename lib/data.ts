import 'server-only';

import { cache } from 'react';
import { supabaseServerClient } from './supabaseServer';
import { City, Post } from './types';

const hasSupabaseCredentials = Boolean(
  (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)
);

const FALLBACK_CITIES: City[] = SERVICE_AREA_SLUGS.map((slug) => {
  const name = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

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

export const SERVICE_AREA_SLUGS = [
  'bellevue',
  'redmond',
  'kirkland',
  'issaquah',
  'sammamish',
  'woodinville',
  'medina',
  'clyde-hill',
  'newcastle',
  'mercer-island'
] as const;

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
    return [];
  }

  return (data as City[]) || [];
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
    return null;
  }

  return (data as City) || null;
});

export const getPosts = cache(async (): Promise<Post[]> => {
  if (!hasSupabaseCredentials) {
    return [];
  }
  const supabase = supabaseServerClient();
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('[Supabase] getPosts error', error);
    return [];
  }

  return (data as Post[]) || [];
});

export const getPostsByCity = cache(async (slug: string): Promise<Post[]> => {
  if (!hasSupabaseCredentials) {
    return [];
  }
  const supabase = supabaseServerClient();
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('city_slug', slug)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('[Supabase] getPostsByCity error', error);
    return [];
  }

  return (data as Post[]) || [];
});

export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  if (!hasSupabaseCredentials) {
    return null;
  }
  const supabase = supabaseServerClient();
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('[Supabase] getPostBySlug error', error);
    return null;
  }

  return (data as Post) || null;
});
