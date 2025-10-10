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

export type ServiceAreaSlug = (typeof SERVICE_AREA_SLUGS)[number];

export const formatServiceAreaName = (slug: string) =>
  slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const SERVICE_AREA_LINKS = SERVICE_AREA_SLUGS.map((slug) => ({
  slug,
  href: `/service-areas/${slug}`,
  label: formatServiceAreaName(slug)
}));
