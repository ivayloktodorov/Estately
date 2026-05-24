import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/sale', '/rent', '/properties/'],
      disallow: [
        '/admin',
        '/dashboard',
        '/dashboard/',
        '/messages',
        '/profile',
        '/favorites',
        '/login',
        '/register',
        '/api',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
