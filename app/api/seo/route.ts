import { NextRequest, NextResponse } from 'next/server';
import { getDomainBranding } from '@/utils/domainBranding';
import { tmdbService } from '@/src/services/tmdb';
import { generateSlug } from '@/src/utils/slug';

// Cache configuration
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

// In-memory cache for TMDB responses
const mediaCache = new Map<string, { data: any | null; timestamp: number }>();

async function fetchTmdbDetail(type: 'movie' | 'tv', id: string | number) {
  const cacheKey = `${type}_${id}`;
  const cached = mediaCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const apiKey = process.env.TMDB_API_KEY || 'addfba41d0cb5aba2ebaae12ac92b671';
    const url = `https://api.themoviedb.org/3/${type}/${id}?api_key=${apiKey}&append_to_response=credits,videos&language=en-US`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      mediaCache.set(cacheKey, { data: null, timestamp: Date.now() });
      return null;
    }
    const data = await res.json();
    mediaCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (err) {
    console.error(`[SSR SEO] Error fetching TMDB ${type}/${id}:`, err);
    return null;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const hostname = request.headers.get('host') || 'cinejoy.to';
    const targetUrl = url.searchParams.get('url') || '/';
    
    const brand = getDomainBranding();
    const parsedUrl = new URL(targetUrl, `https://${brand.domain}`);
    const pathname = parsedUrl.pathname;
    const searchParams = parsedUrl.searchParams;

    // Check if a specific media item is requested
    let mediaType: 'movie' | 'tv' | null = null;
    let mediaId: string | null = null;

    // Query parameter formats: ?movie=123, ?tv=456, ?id=123&type=movie, ?watch=movie-123
    if (searchParams.get('movie')) {
      mediaType = 'movie';
      mediaId = searchParams.get('movie');
    } else if (searchParams.get('tv')) {
      mediaType = 'tv';
      mediaId = searchParams.get('tv');
    } else if (searchParams.get('id')) {
      mediaId = searchParams.get('id');
      mediaType = searchParams.get('type') === 'tv' ? 'tv' : 'movie';
    } else if (searchParams.get('watch')) {
      const watchVal = searchParams.get('watch') || '';
      if (watchVal.startsWith('tv-')) {
        mediaType = 'tv';
        mediaId = watchVal.replace('tv-', '');
      } else {
        mediaType = 'movie';
        mediaId = watchVal.replace('movie-', '');
      }
    }

    // Path formats: /movie/:id, /tv/:id, /movie/:slug, /tv/:slug, /watch/:type/:id
    const moviePathMatch = pathname.match(/\/movie\/([^\/]+)/i);
    const tvPathMatch = pathname.match(/\/tv\/([^\/]+)/i);
    const watchPathMatch = pathname.match(/\/watch\/(movie|tv)\/([0-9]+)/i);

    if (moviePathMatch) {
      mediaType = 'movie';
      mediaId = moviePathMatch[1];
    } else if (tvPathMatch) {
      mediaType = 'tv';
      mediaId = tvPathMatch[1];
    } else if (watchPathMatch) {
      mediaType = watchPathMatch[1] as 'movie' | 'tv';
      mediaId = watchPathMatch[2];
    }

    // Generate SEO metadata
    let metadata: Record<string, any> = {
      title: brand.documentTitle,
      description: brand.description,
      keywords: brand.keywords,
      canonicalUrl: `https://${brand.domain}/`,
      ogType: 'website',
      ogImage: `https://${brand.domain}/favicon.png`,
      ogImageAlt: brand.ogImageAlt || `${brand.brandName} Cinema Discovery App`,
      ogLocale: 'en_US',
      twitterCard: 'summary_large_image',
      twitterSite: `@${brand.brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: brand.brandName,
          alternateName: [`${brand.brandName} Official`, `${brand.brandName} Streaming`, brand.brandShortName],
          url: `https://${brand.domain}`,
          potentialAction: {
            '@type': 'SearchAction',
            target: `https://${brand.domain}/?tab=search&q={search_term_string}`,
            'query-input': 'required name=search_term_string'
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: brand.brandName,
          url: `https://${brand.domain}`,
          applicationCategory: 'EntertainmentApplication',
          genre: 'Movies & TV',
          operatingSystem: 'All',
          description: brand.description,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD'
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            reviewCount: '1540'
          },
          author: {
            '@type': 'Organization',
            name: brand.brandName,
            url: `https://${brand.domain}`
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: brand.brandName,
          url: `https://${brand.domain}`,
          logo: `https://${brand.domain}/favicon.png`,
          description: brand.description,
          sameAs: [
            `https://twitter.com/${brand.brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            `https://facebook.com/${brand.brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            `https://instagram.com/${brand.brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}`
          ]
        }
      ]
    };

    // Case 1: Specific Movie or TV Show Detail
    if (mediaType && mediaId) {
      const media = await fetchTmdbDetail(mediaType, mediaId);
      if (media) {
        const title = media.title || media.name || 'Untitled';
        const releaseDate = media.release_date || media.first_air_date || '';
        const year = releaseDate ? releaseDate.slice(0, 4) : '';
        const yearSuffix = year ? ` (${year})` : '';
        const genres = media.genres ? media.genres.map((g: any) => g.name).join(', ') : '';
        const rating = media.vote_average ? media.vote_average.toFixed(1) : '8.5';
        const voteCount = media.vote_count || 1000;
        
        const castList = media.credits?.cast?.slice(0, 4).map((c: any) => c.name).join(', ') || '';
        const director = media.credits?.crew?.find((c: any) => c.job === 'Director')?.name || '';
        
        const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
        const backdropUrl = media.backdrop_path 
          ? `${IMAGE_BASE_URL}/w1280${media.backdrop_path}`
          : (media.poster_path ? `${IMAGE_BASE_URL}/w780${media.poster_path}` : `https://${brand.domain}/favicon.png`);
        const posterUrl = media.poster_path 
          ? `${IMAGE_BASE_URL}/w500${media.poster_path}` 
          : backdropUrl;

        const isFlixHQ = brand.brandName === 'FlixHQ' || brand.domain === 'flixhq.to';
        const isCinejoy = brand.brandName === 'Cinejoy' || brand.domain === 'cinejoy.to';

        const pageTitle = isFlixHQ
          ? `Watch ${title}${yearSuffix} Online Free on FlixHQ`
          : isCinejoy
            ? `Watch ${title}${yearSuffix} Online Free on Cinejoy`
            : `Watch ${title}${yearSuffix} Online Free HD | ${brand.brandName} Official`;
        
        const cleanOverview = media.overview ? media.overview.replace(/\s+/g, ' ').trim() : '';
        const truncatedOverview = cleanOverview.length > 150 ? cleanOverview.slice(0, 147) + '...' : cleanOverview;
        
        const pageDescription = isFlixHQ
          ? (mediaType === 'tv'
              ? `Watch ${title} online free in full HD on FlixHQ. Stream all seasons and episodes of ${title} with zero ads on flixhq.to. ${truncatedOverview}`
              : `Watch ${title}${yearSuffix} online free in full HD on FlixHQ. ${truncatedOverview || `Stream ${title} without registration with zero ads on flixhq.to.`}`)
          : isCinejoy
            ? (mediaType === 'tv'
                ? `Stream ${title} on Cinejoy for free. Watch Free Movies & TV Shows Online, for free. ${truncatedOverview}`
                : `Stream ${title}${yearSuffix} on Cinejoy for free. Watch Free Movies & TV Shows Online, for free. ${truncatedOverview}`)
            : `Watch ${title}${yearSuffix} online in full 1080p HD on ${brand.brandName} (${brand.domain}). ${genres ? `Genres: ${genres}. ` : ''}${truncatedOverview || `Stream ${title} for free with fast servers.`}`;

        const pageOgDescription = isCinejoy
          ? (mediaType === 'tv'
              ? `Stream ${title} on Cinejoy for free. Watch Free Movies & TV Shows Online, for free.`
              : `Stream ${title}${yearSuffix} on Cinejoy for free. Watch Free Movies & TV Shows Online, for free.`)
          : pageDescription;
        
        const pageKeywords = isFlixHQ
          ? (mediaType === 'tv'
              ? `watch ${title} online free, stream ${title} tv show, ${title} full episodes, ${title} all seasons, flixhq, flixhq.to, watch tv shows online free`
              : `watch ${title} online free, ${title} full movie, stream ${title} hd, ${title} free streaming, ${title}${yearSuffix}, flixhq, flixhq.to, watch movies online free`)
          : isCinejoy
            ? `cinejoy, cinejoy.to, watch ${title} online free, stream ${title}, ${title} free streaming, ${title}${yearSuffix}, watch free movies, free movies to watch online, watch movies online free`
            : `${title}, watch ${title} online free, stream ${title} free, ${title} full ${mediaType === 'movie' ? 'movie' : 'episodes'}, ${title} HD 1080p, ${title}${yearSuffix}, ${brand.brandName}, ${genres}, watch free movies online, free movie streaming sites`;
        
        // Generate SEO-friendly slug for canonical URL
        const slug = generateSlug(media.title || media.name, media.id);
        const canonicalUrl = `https://${brand.domain}/${mediaType}/${slug}`;

        const mediaSchema = {
          '@context': 'https://schema.org',
          '@type': mediaType === 'movie' ? 'Movie' : 'TVSeries',
          name: title,
          alternateName: media.original_title || media.original_name || title,
          url: canonicalUrl,
          identifier: media.id.toString(),
          inLanguage: 'en-US',
          isAccessibleForFree: true,
          image: [backdropUrl, posterUrl],
          description: cleanOverview || pageDescription,
          datePublished: releaseDate || '2026-01-01',
          genre: media.genres?.map((g: any) => g.name) || ['Drama', 'Action'],
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating,
            bestRating: '10',
            worstRating: '1',
            ratingCount: voteCount
          },
          actor: media.credits?.cast?.slice(0, 5).map((c: any) => ({
            '@type': 'Person',
            name: c.name
          })) || [],
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
              name: brand.brandName,
              url: `https://${brand.domain}`
            }
          }
        };

        const breadcrumbSchema = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: `https://${brand.domain}/`
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: mediaType === 'movie' ? 'Movies' : 'TV Shows',
              item: `https://${brand.domain}/browse/${mediaType}`
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: title,
              item: canonicalUrl
            }
          ]
        };

        // WatchAction for direct streaming
        const watchActionSchema = {
          '@context': 'https://schema.org',
          '@type': 'WatchAction',
          target: canonicalUrl,
          expectsAcceptanceOf: {
            '@type': 'Offer',
            category: 'free',
            eligibleRegion: {
              '@type': 'Country',
              name: 'US'
            }
          }
        };

        // FAQ Schema for rich results
        const faqSchema = {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: `Can I watch ${title} for free?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `Yes, you can stream ${title} for free in HD on ${brand.brandName}.`
              }
            },
            {
              '@type': 'Question',
              name: `Where to watch ${title} online?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `Stream ${title} on ${brand.brandName} (${brand.domain}) with fast servers and zero ads.`
              }
            },
            {
              '@type': 'Question',
              name: `Is ${title} available in HD?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `Yes, ${brand.brandName} offers ${title} in full HD quality with multiple streaming sources.`
              }
            }
          ]
        };

        metadata = {
          title: pageTitle,
          description: pageDescription,
          keywords: pageKeywords,
          canonicalUrl,
          ogType: mediaType === 'movie' ? 'video.movie' : 'video.tv_show',
          ogImage: backdropUrl,
          ogImageAlt: brand.ogImageAlt || `${brand.brandName} Cinema Discovery App`,
          ogLocale: 'en_US',
          structuredData: [mediaSchema, breadcrumbSchema, watchActionSchema, faqSchema, ...metadata.structuredData]
        };
      }
    }

    return NextResponse.json({
      success: true,
      metadata,
      brand,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[SEO API Error]', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal Server Error'
    }, { status: 500 });
  }
}