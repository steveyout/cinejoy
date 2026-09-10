import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

function resolveDomain(host: string | null): string {
  const h = host?.toLowerCase() || '';
  if (h.includes('flixhq')) return h.includes('flixhq.ink') ? 'flixhq.ink' : 'flixhq.to';
  if (h.includes('flihq.to')) return 'flixhq.to';
  if (h.includes('cinejoy.online')) return 'cinejoy.online';
  return 'cinejoy.to';
}

// Static pages that should be in sitemap
const staticPages = [
  '',
  '/browse',
  '/browse/movie',
  '/browse/tv',
  '/search',
  '/library',
];

// Generate sitemap entries for popular media (would be fetched from API in production)
const popularMedia = [
  // These would be replaced with actual popular movies/TV shows from TMDB
  { id: 1368337, type: 'movie', slug: 'the-dark-knight-1368337' },
  { id: 1190499, type: 'movie', slug: 'the-batman-1190499' },
  { id: 157336, type: 'movie', slug: 'interstellar-157336' },
  { id: 603692, type: 'tv', slug: 'john-wick-603692' },
  { id: 82856, type: 'tv', slug: 'the-mandalorian-82856' },
  { id: 1399, type: 'tv', slug: 'game-of-thrones-1399' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const host = h.get('host') || h.get('x-forwarded-host') || null;
  const domain = resolveDomain(host);
  const baseUrl = `https://${domain}`;

  // Static pages
  const staticEntries: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: page === '' ? 'daily' : 'weekly',
    priority: page === '' ? 1.0 : 0.8,
  }));

  // Media pages (movies and TV shows)
  const mediaEntries: MetadataRoute.Sitemap = popularMedia.map((media) => ({
    url: `${baseUrl}/${media.type}/${media.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // Genre pages
  const genrePages = [
    { path: '/browse', type: 'all' },
    { path: '/browse/movie', type: 'movie' },
    { path: '/browse/tv', type: 'tv' },
  ];

  const genreEntries: MetadataRoute.Sitemap = genrePages.map((genre) => ({
    url: `${baseUrl}${genre.path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [
    ...staticEntries,
    ...mediaEntries,
    ...genreEntries,
  ];
}
