'use client';

import React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getDomainBrandingClient } from '@/utils/domainBranding';

interface SchemaProps {
  type?: 'website' | 'movie' | 'tv_series' | 'search' | 'browse';
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  datePublished?: string;
  genre?: string[];
  rating?: number;
  voteCount?: number;
  actors?: Array<{ name: string }>;
  director?: string;
}

export function SchemaJsonLd({
  type = 'website',
  title,
  description,
  url,
  image,
  datePublished,
  genre,
  rating,
  voteCount,
  actors,
  director
}: SchemaProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const branding = getDomainBrandingClient();

  const domain = branding.domain;
  const baseUrl = `https://${domain}`;

  // Generate schema based on type
  const generateSchema = () => {
    switch (type) {
      case 'movie':
        return {
          '@context': 'https://schema.org',
          '@type': 'Movie',
          name: title,
          alternateName: title,
          url: url || `${baseUrl}${pathname}`,
          image: image || `${baseUrl}/favicon.png`,
          description: description || branding.description,
          datePublished: datePublished || '2026-01-01',
          genre: genre || ['Drama', 'Action'],
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating || '8.5',
            bestRating: '10',
            worstRating: '1',
            ratingCount: voteCount || 1000
          },
          actor: actors || [],
          ...(director ? {
            director: {
              '@type': 'Person',
              name: director
            }
          } : {}),
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            seller: {
              '@type': 'Organization',
              name: branding.brandName,
              url: baseUrl
            }
          }
        };

      case 'tv_series':
        return {
          '@context': 'https://schema.org',
          '@type': 'TVSeries',
          name: title,
          alternateName: title,
          url: url || `${baseUrl}${pathname}`,
          image: image || `${baseUrl}/favicon.png`,
          description: description || branding.description,
          datePublished: datePublished || '2026-01-01',
          genre: genre || ['Drama', 'Action'],
          numberOfSeasons: 1,
          numberOfEpisodes: 1,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating || '8.5',
            bestRating: '10',
            worstRating: '1',
            ratingCount: voteCount || 1000
          },
          actor: actors || [],
          ...(director ? {
            director: {
              '@type': 'Person',
              name: director
            }
          } : {}),
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            seller: {
              '@type': 'Organization',
              name: branding.brandName,
              url: baseUrl
            }
          }
        };

      case 'search':
        const query = searchParams.get('q') || '';
        return {
          '@context': 'https://schema.org',
          '@type': 'SearchResultsPage',
          name: `Search Results for "${query}" on ${branding.brandName}`,
          url: `${baseUrl}${pathname}`,
          description: `Search results for "${query}" on ${branding.brandName}`,
          about: {
            '@type': 'Thing',
            name: query
          }
        };

      case 'browse':
        const mediaType = searchParams.get('type') || 'movie';
        return {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `Browse ${mediaType === 'tv' ? 'TV Shows' : 'Movies'} on ${branding.brandName}`,
          url: `${baseUrl}${pathname}`,
          description: `Browse and discover ${mediaType === 'tv' ? 'popular TV shows' : 'thousands of movies'} on ${branding.brandName}`,
          hasPart: {
            '@type': 'ItemList',
            name: mediaType === 'tv' ? 'TV Shows' : 'Movies',
            description: `List of ${mediaType === 'tv' ? 'TV shows' : 'movies'} available on ${branding.brandName}`
          }
        };

      default:
        // Website schema with search action
        return [
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: branding.brandName,
            alternateName: [`${branding.brandName} Official`, `${branding.brandName} Streaming`, branding.brandShortName],
            url: baseUrl,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${baseUrl}/?tab=search&q={search_term_string}`,
              'query-input': 'required name=search_term_string'
            }
          },
          {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: branding.brandName,
            url: baseUrl,
            applicationCategory: 'EntertainmentApplication',
            genre: 'Movies & TV',
            operatingSystem: 'All',
            description: branding.description,
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD'
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.9',
              reviewCount: '1540'
            }
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: `${baseUrl}/?tab=home`
              }
            ]
          }
        ];
    }
  };

  const schema = generateSchema();

  // Handle multiple schemas (for website type)
  if (Array.isArray(schema)) {
    return (
      <>
        {schema.map((schemaData, index) => (
          <script
            key={`schema-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData, null, 2) }}
          />
        ))}
      </>
    );
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
    />
  );
}