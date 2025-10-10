export type City = {
  id: string;
  slug: string;
  name: string;
  hero_title: string | null;
  hero_description: string | null;
  service_highlights: string[] | null;
  faqs: { question: string; answer: string }[] | null;
  updated_at: string | null;
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  city_slug: string | null;
  published_at: string | null;
  updated_at: string | null;
};

export type LeadPayload = {
  full_name: string;
  email: string;
  phone: string;
  city: string;
  message: string;
  source?: string;
};
