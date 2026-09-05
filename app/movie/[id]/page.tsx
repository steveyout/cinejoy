import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { tmdbService } from '@/src/services/tmdb';
import { extractIdFromSlug, generateSlug } from '@/src/utils/slug';
import { createMediaJsonLd, createMediaMetadata } from '@/src/server/mediaMetadata';
import MovieDetailClient from './MovieDetailClient';

type PageProps = { params: Promise<{ id: string }> };

async function getMovie(id: string) {
  const mediaId = extractIdFromSlug(id);
  if (!mediaId) return null;
  const media = await tmdbService.getDetails(mediaId, 'movie');
  return media?.media_type === 'movie' ? media : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const media = await getMovie((await params).id);
  return media
    ? createMediaMetadata(media)
    : { title: 'Movie Not Found', robots: { index: false, follow: false } };
}

export default async function MoviePage({ params }: PageProps) {
  const { id } = await params;
  const media = await getMovie(id);
  if (!media) notFound();

  const canonicalSlug = generateSlug(media.title || media.name, media.id);
  if (id !== canonicalSlug) permanentRedirect(`/movie/${canonicalSlug}`);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(createMediaJsonLd(media)) }} />
      <MovieDetailClient initialMedia={media} />
    </>
  );
}
