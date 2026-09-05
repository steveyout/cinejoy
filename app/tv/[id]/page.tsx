import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { tmdbService } from '@/src/services/tmdb';
import { extractIdFromSlug, generateSlug } from '@/src/utils/slug';
import { createMediaJsonLd, createMediaMetadata } from '@/src/server/mediaMetadata';
import TVDetailClient from './TVDetailClient';

type PageProps = { params: Promise<{ id: string }> };

async function getShow(id: string) {
  const mediaId = extractIdFromSlug(id);
  if (!mediaId) return null;
  const media = await tmdbService.getDetails(mediaId, 'tv');
  return media?.media_type === 'tv' ? media : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const media = await getShow((await params).id);
  return media
    ? createMediaMetadata(media)
    : { title: 'TV Show Not Found', robots: { index: false, follow: false } };
}

export default async function TVPage({ params }: PageProps) {
  const { id } = await params;
  const media = await getShow(id);
  if (!media) notFound();

  const canonicalSlug = generateSlug(media.title || media.name, media.id);
  if (id !== canonicalSlug) permanentRedirect(`/tv/${canonicalSlug}`);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(createMediaJsonLd(media)) }} />
      <TVDetailClient initialMedia={media} />
    </>
  );
}
