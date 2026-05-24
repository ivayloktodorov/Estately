import type { MetadataRoute } from 'next';
import { getSitemapProperties } from '@/lib/properties/discovery';
import { absoluteUrl } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await getSitemapProperties();
  const staticRoutes: MetadataRoute.Sitemap = ['/', '/sale', '/rent', '/about', '/contact'].map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.8,
  }));

  return [
    ...staticRoutes,
    ...properties.map((property) => ({
      url: absoluteUrl(`/properties/${property.id}`),
      lastModified: property.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
