/**
 * Centralized SEO Configuration
 * Handles domain-specific SEO settings, structured data templates, and best practices
 */

import { getDomainBranding, DomainBrandConfig } from '@/src/utils/domainBranding';

export interface SEOSettings {
  brand: DomainBrandConfig;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string;
  domain: string;
  canonicalBase: string;
  ogImage: string;
  ogImageAlt: string;
  twitterCard: string;
  twitterSite: string;
  twitterCreator: string;
}

/**
 * Get domain-specific SEO settings
 */
export function getSEOSettings(): SEOSettings {
  const brand = getDomainBranding();
  const domain = brand.domain;
  const baseUrl = `https://${domain}`;
  
  // Clean brand name for social handles
  const cleanBrand = brand.brandName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  return {
    brand,
    defaultTitle: brand.documentTitle,
    defaultDescription: brand.description,
    defaultKeywords: brand.keywords,
    domain,
    canonicalBase: baseUrl,
    ogImage: `${baseUrl}/favicon.png`,
    ogImageAlt: brand.ogImageAlt || `${brand.brandName} Cinema Discovery App`,
    twitterCard: 'summary_large_image',
    twitterSite: `@${cleanBrand}`,
    twitterCreator: `@${cleanBrand}`,
  };
}

/**
 * Generate complete SEO metadata object
 */
export function generateSEOMetadata(
  settings: SEOSettings,
  customMetadata: Partial<Record<string, any>> = {}
): Record<string, any> {
  const baseMetadata = {
    title: settings.defaultTitle,
    description: settings.defaultDescription,
    keywords: settings.defaultKeywords,
    canonicalUrl: settings.canonicalBase,
    ogType: 'website',
    ogImage: settings.ogImage,
    ogImageAlt: settings.ogImageAlt,
    ogLocale: 'en_US',
    twitterCard: settings.twitterCard,
    twitterSite: settings.twitterSite,
    twitterCreator: settings.twitterCreator,
    robots: {
      index: true,
      follow: true,
      maxImagePreview: 'large',
      maxSnippet: -1,
      maxVideoPreview: -1,
    },
    structuredData: generateBaseStructuredData(settings),
    ...customMetadata,
  };

  return baseMetadata;
}

/**
 * Generate base structured data for the site
 */
function generateBaseStructuredData(settings: SEOSettings): any[] {
  const { brand, domain } = settings;
  const baseUrl = `https://${domain}`;
  const cleanBrand = brand.brandName.toLowerCase().replace(/[^a-z0-9]/g, '');

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: brand.brandName,
      alternateName: [
        `${brand.brandName} Official`,
        `${brand.brandName} Streaming`,
        brand.brandShortName,
      ],
      url: baseUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${baseUrl}/?tab=search&q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: brand.brandName,
      url: baseUrl,
      applicationCategory: 'EntertainmentApplication',
      genre: 'Movies & TV',
      operatingSystem: 'All',
      description: brand.description,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '1540',
      },
      author: {
        '@type': 'Organization',
        name: brand.brandName,
        url: baseUrl,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: brand.brandName,
      url: baseUrl,
      logo: `${baseUrl}/favicon.png`,
      description: brand.description,
      sameAs: [
        `https://twitter.com/${cleanBrand}`,
        `https://facebook.com/${cleanBrand}`,
        `https://instagram.com/${cleanBrand}`,
      ],
    },
  ];
}

/**
 * Generate media-specific structured data
 */
export function generateMediaStructuredData(
  media: any,
  mediaType: 'movie' | 'tv',
  settings: SEOSettings
): any[] {
  const { brand, domain } = settings;
  const baseUrl = `https://${domain}`;
  
  const title = media.title || media.name || 'Untitled';
  const releaseDate = media.release_date || media.first_air_date || '';
  const year = releaseDate ? releaseDate.slice(0, 4) : '';
  const genres = media.genres?.map((g: any) => g.name) || [];
  const rating = media.vote_average ? media.vote_average.toFixed(1) : '7.0';
  const voteCount = media.vote_count || 1000;
  const cleanOverview = media.overview ? media.overview.replace(/\s+/g, ' ').trim() : '';
  
  const backdropUrl = media.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${media.backdrop_path}`
    : media.poster_path
      ? `https://image.tmdb.org/t/p/w780${media.poster_path}`
      : `${baseUrl}/favicon.png`;

  const posterUrl = media.poster_path
    ? `https://image.tmdb.org/t/p/w500${media.poster_path}`
    : backdropUrl;

  // Media schema
  const mediaSchema = {
    '@context': 'https://schema.org',
    '@type': mediaType === 'movie' ? 'Movie' : 'TVSeries',
    name: title,
    alternateName: media.original_title || media.original_name || title,
    url: `${baseUrl}/${mediaType}/${media.id}-${title.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`,
    identifier: media.id.toString(),
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    image: [backdropUrl, posterUrl],
    description: cleanOverview || settings.defaultDescription,
    datePublished: releaseDate || '2026-01-01',
    genre: genres.length > 0 ? genres : ['Drama', 'Action'],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating,
      bestRating: '10',
      worstRating: '1',
      ratingCount: voteCount,
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: brand.brandName,
        url: baseUrl,
      },
    },
  };

  // Breadcrumb schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: mediaType === 'movie' ? 'Movies' : 'TV Shows',
        item: `${baseUrl}/browse/${mediaType}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: `${baseUrl}/${mediaType}/${media.id}-${title.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`,
      },
    ],
  };

  // FAQ schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Can I watch ${title} for free?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes, you can stream ${title} for free in HD on ${brand.brandName}.`,
        },
      },
      {
        '@type': 'Question',
        name: `Where to watch ${title} online?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Stream ${title} on ${brand.brandName} (${domain}) with fast servers and zero ads.`,
        },
      },
      {
        '@type': 'Question',
        name: `Is ${title} available in HD?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes, ${brand.brandName} offers ${title} in full HD quality with multiple streaming sources.`,
        },
      },
    ],
  };

  // Watch action schema
  const watchActionSchema = {
    '@context': 'https://schema.org',
    '@type': 'WatchAction',
    target: `${baseUrl}/${mediaType}/${media.id}-${title.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`,
    expectsAcceptanceOf: {
      '@type': 'Offer',
      category: 'free',
      eligibleRegion: {
        '@type': 'Country',
        name: 'US',
      },
    },
  };

  return [mediaSchema, breadcrumbSchema, faqSchema, watchActionSchema];
}
