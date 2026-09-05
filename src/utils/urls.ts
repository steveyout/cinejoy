import { generateSlug } from './slug';
import { MediaItem } from '../types';
import { getDomainBranding } from './domainBranding';

/**
 * Generate a full URL for a media item with SEO-friendly slug
 */
export function getMediaUrl(media: MediaItem): string {
  const branding = getDomainBranding();
  const slug = generateSlug(media.title || media.name, media.id);
  const mediaType = media.media_type === 'tv' ? 'tv' : 'movie';
  return `https://${branding.domain}/${mediaType}/${slug}`;
}

/**
 * Generate a relative path for a media item with SEO-friendly slug
 */
export function getMediaPath(media: MediaItem): string {
  const slug = generateSlug(media.title || media.name, media.id);
  const mediaType = media.media_type === 'tv' ? 'tv' : 'movie';
  return `/${mediaType}/${slug}`;
}

/**
 * Generate browse URL for a media type
 */
export function getBrowseUrl(mediaType: 'movie' | 'tv' | 'all' = 'all'): string {
  const branding = getDomainBranding();
  if (mediaType === 'all') {
    return `https://${branding.domain}/browse`;
  }
  return `https://${branding.domain}/browse/${mediaType}`;
}
