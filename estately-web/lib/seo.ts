import type { Metadata } from 'next';

const siteName = 'Estately';
const fallbackUrl = 'http://localhost:3000';

export const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  fallbackUrl
).replace(/\/$/, '');

export const defaultKeywords = [
  'real estate',
  'homes for sale',
  'rental properties',
  'apartments',
  'villas',
  'land listings',
  'Estately',
];

interface SeoMetadataInput {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
}

export function absoluteUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export function createSeoMetadata({
  title,
  description,
  path,
  keywords = [],
  image = '/branding/logo-full.png',
}: SeoMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    title,
    description,
    keywords: [...defaultKeywords, ...keywords],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName,
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}
