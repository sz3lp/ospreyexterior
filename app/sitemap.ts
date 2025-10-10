import { MetadataRoute } from 'next';
import { getPosts } from '@/lib/data';
import { SERVICE_AREA_SLUGS } from '@/lib/serviceAreas';

const baseUrl = 'https://ospreyexterior.com';

const routes = ['', '/blog', '/service-areas'];

const createRoute = (path: string): MetadataRoute.Sitemap[number] => ({
  url: `${baseUrl}${path}`,
  changeFrequency: 'weekly',
  priority: path === '' ? 1 : 0.7
});

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const posts = await getPosts();

  const postRoutes = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updated_at || post.published_at || new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: 0.6
  }));

  const cityRoutes = SERVICE_AREA_SLUGS.map((slug) => ({
    url: `${baseUrl}/service-areas/${slug}`,
    changeFrequency: 'monthly',
    priority: 0.8
  }));

  return [
    ...routes.map(createRoute),
    ...cityRoutes,
    ...postRoutes
  ];
};

export default sitemap;
