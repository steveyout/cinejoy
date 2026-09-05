import type { Metadata } from 'next';
import { getDomainBranding } from '@/src/utils/domainBranding';
import { getBackdropUrl, getImageUrl } from '@/src/services/tmdb';
import { generateSlug } from '@/src/utils/slug';
import type { MediaItem } from '@/src/types';

export function getMediaCanonicalPath(media: MediaItem): string {
  const type = media.media_type === 'tv' ? 'tv' : 'movie';
  return `/${type}/${generateSlug(media.title || media.name, media.id)}`;
}

export function createMediaMetadata(media: MediaItem): Metadata {
  const branding = getDomainBranding();
  const title = media.title || media.name || 'Untitled';
  const date = media.release_date || media.first_air_date;
  const year = date?.slice(0, 4);
  const typeLabel = media.media_type === 'tv' ? 'TV Show' : 'Movie';
  const titleWithYear = year ? `${title} (${year})` : title;
  const overview = (media.overview || '').replace(/\s+/g, ' ').trim();
  const description = `Watch ${titleWithYear} online free in HD on ${branding.brandName}. ${overview}`.slice(0, 160);
  const canonical = `https://${branding.domain}${getMediaCanonicalPath(media)}`;
  const image = getBackdropUrl(media.backdrop_path, 'w1280') || getImageUrl(media.poster_path, 'w500');

  return {
    title: `Watch ${titleWithYear} Online Free | ${branding.brandName}`,
    description,
    keywords: [title, `watch ${title} online`, `watch ${title} free`, `${title} ${typeLabel.toLowerCase()}`, branding.brandName, 'free streaming'],
    alternates: { canonical },
    openGraph: {
      title: `Watch ${titleWithYear} Online Free | ${branding.brandName}`,
      description,
      url: canonical,
      siteName: branding.brandName,
      type: 'website',
      images: [{ url: image, width: 1280, height: 720, alt: `${title} ${typeLabel}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Watch ${titleWithYear} Online Free | ${branding.brandName}`,
      description,
      images: [image],
    },
    robots: { index: true, follow: true },
  };
}

export function createMediaJsonLd(media: MediaItem): Record<string, unknown> {
  const title = media.title || media.name || 'Untitled';
  return {
    '@context': 'https://schema.org',
    '@type': media.media_type === 'tv' ? 'TVSeries' : 'Movie',
    name: title,
    url: `https://${getDomainBranding().domain}${getMediaCanonicalPath(media)}`,
    image: [getImageUrl(media.poster_path, 'w500'), getBackdropUrl(media.backdrop_path, 'w1280')],
    description: media.overview,
    datePublished: media.release_date || media.first_air_date,
    genre: media.genres?.map((genre) => genre.name),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: media.vote_average,
      bestRating: 10,
      worstRating: 1,
      ratingCount: media.vote_count,
    },
    ...(media.media_type === 'tv' && media.number_of_seasons
      ? { numberOfSeasons: media.number_of_seasons }
      : {}),
  };
}
