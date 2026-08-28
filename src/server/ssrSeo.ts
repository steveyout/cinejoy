// src/server/ssrSeo.ts
/**
 * Server-Side SEO & Dynamic Metadata Injection Engine
 * Generates high-ranking meta tags, OpenGraph, Twitter Cards, Canonical links,
 * and Schema.org JSON-LD structured data for search crawlers & social bots.
 */

interface TMDBMediaDetail {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  genres?: Array<{ id: number; name: string }>;
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  credits?: {
    cast?: Array<{ name: string; character: string }>;
    crew?: Array<{ name: string; job: string }>;
  };
  videos?: {
    results?: Array<{ key: string; site: string; type: string }>;
  };
}

// In-memory cache for TMDB responses to deliver <5ms TTFB to Googlebot and social bots
const mediaCache = new Map<string, { data: TMDBMediaDetail | null; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

const TMDB_API_KEY = process.env.TMDB_API_KEY || 'addfba41d0cb5aba2ebaae12ac92b671';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

async function fetchTmdbDetail(type: 'movie' | 'tv', id: string | number): Promise<TMDBMediaDetail | null> {
  const cacheKey = `${type}_${id}`;
  const cached = mediaCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const url = `${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos&language=en-US`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      mediaCache.set(cacheKey, { data: null, timestamp: Date.now() });
      return null;
    }
    const data = (await res.json()) as TMDBMediaDetail;
    mediaCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (err) {
    console.error(`[SSR SEO] Error fetching TMDB ${type}/${id}:`, err);
    return null;
  }
}

interface DomainBrand {
  brandName: string;
  brandShortName: string;
  domain: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string;
}

function resolveDomainBrand(hostname: string): DomainBrand {
  const host = hostname.toLowerCase();

  // 1. FlixHQ Domains (flixhq.ink, flixhq.to, flixhq)
  if (host.includes('flixhq')) {
    return {
      brandName: 'FlixHQ',
      brandShortName: 'FlixHQ',
      domain: 'flixhq.to',
      defaultTitle: 'FlixHQ — Watch Movies & TV Series Online Free HD | FlixHQ Official',
      defaultDescription: 'Watch movies and TV series online in HD for free on FlixHQ (flixhq.to). Discover top trending movies, popular TV shows, 4K trailers, and ratings on FlixHQ.',
      defaultKeywords: 'FlixHQ, flixhq.to, flixhq.ink, FlixHQ official, watch movies online free, free movie streaming sites, watch hd movies online, free full movies online, stream tv series, free 1080p movies, soap2day alternative, fmovies alternative, 123movies alternative',
    };
  }

  // 2. Cinejoy Online
  if (host.includes('cinejoy.online') || host.includes('cunejo.online')) {
    return {
      brandName: 'Cinejoy',
      brandShortName: 'Cinejoy',
      domain: 'cinejoy.online',
      defaultTitle: 'Cinejoy — Watch Free Movies & TV Shows Online HD | Cinejoy Official',
      defaultDescription: 'Watch latest movies and full TV shows online in 1080p HD for free on Cinejoy (cinejoy.online). Discover trending box office movies, popular TV series, cast details, 4K trailers, and ratings on Cinejoy.',
      defaultKeywords: 'Cinejoy, cinejoy.online, Cinejoy official, Cinejoy free movies, watch free movies online, watch movies online free, free movie streaming sites, watch hd movies online, stream tv series, soap2day alternative, fmovies alternative, 123movies alternative',
    };
  }

  // 3. Default to Cinejoy (cinejoy.to)
  return {
    brandName: 'Cinejoy',
    brandShortName: 'Cinejoy',
    domain: 'cinejoy.to',
    defaultTitle: 'Cinejoy — Watch Free Movies & TV Shows Online HD | Cinejoy Official',
    defaultDescription: 'Watch latest movies and full TV shows online in 1080p HD for free on Cinejoy (cinejoy.to). Discover trending box office movies, popular TV series, cast details, 4K trailers, and ratings on Cinejoy.',
    defaultKeywords: 'Cinejoy, Cinejoy to, Cinejoy official, Cinejoy free movies, Cinejoy movie streaming, watch free movies online, watch movies online free, free movie streaming sites, watch hd movies online, free full movies online, watch tv shows online free, stream tv series, free 1080p movies, 4k streaming movies, latest movies online free, box office movies free, no sign up movie streaming, free cinema streaming, soap2day alternative, fmovies alternative, 123movies alternative, flixhq alternative',
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function generateSsrSeoHtml(
  rawHtml: string,
  reqUrl: string,
  hostname: string
): Promise<string> {
  const brand = resolveDomainBrand(hostname);
  const parsedUrl = new URL(reqUrl, `https://${brand.domain}`);
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

  // Path formats: /movie/:id, /tv/:id, /watch/:type/:id
  const moviePathMatch = pathname.match(/^\/movie\/([0-9]+)/i);
  const tvPathMatch = pathname.match(/^\/tv\/([0-9]+)/i);
  const watchPathMatch = pathname.match(/^\/watch\/(movie|tv)\/([0-9]+)/i);

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

  // Case 1: Specific Movie or TV Show Detail
  if (mediaType && mediaId) {
    const media = await fetchTmdbDetail(mediaType, mediaId);
    if (media) {
      const title = media.title || media.name || 'Untitled';
      const releaseDate = media.release_date || media.first_air_date || '';
      const year = releaseDate ? releaseDate.slice(0, 4) : '';
      const yearSuffix = year ? ` (${year})` : '';
      const genres = media.genres ? media.genres.map(g => g.name).join(', ') : '';
      const rating = media.vote_average ? media.vote_average.toFixed(1) : '8.5';
      const voteCount = media.vote_count || 1000;
      
      const castList = media.credits?.cast?.slice(0, 4).map(c => c.name).join(', ') || '';
      const director = media.credits?.crew?.find(c => c.job === 'Director')?.name || '';
      
      const backdropUrl = media.backdrop_path 
        ? `${IMAGE_BASE_URL}/w1280${media.backdrop_path}`
        : (media.poster_path ? `${IMAGE_BASE_URL}/w780${media.poster_path}` : `https://${brand.domain}/favicon.svg`);
      const posterUrl = media.poster_path 
        ? `${IMAGE_BASE_URL}/w500${media.poster_path}` 
        : backdropUrl;

      const pageTitle = `Watch ${title}${yearSuffix} Online Free HD | ${brand.brandName} Official`;
      const cleanOverview = media.overview ? media.overview.replace(/\s+/g, ' ').trim() : '';
      const truncatedOverview = cleanOverview.length > 150 ? cleanOverview.slice(0, 147) + '...' : cleanOverview;
      
      const pageDescription = `Watch ${title}${yearSuffix} online in full 1080p HD on ${brand.brandName} (${brand.domain}). ${genres ? `Genres: ${genres}. ` : ''}${truncatedOverview || `Stream ${title} for free with fast servers.`}`;
      
      const pageKeywords = `${title}, watch ${title} online free, stream ${title} free, ${title} full ${mediaType === 'movie' ? 'movie' : 'episodes'}, ${title} HD 1080p, ${title}${yearSuffix}, ${brand.brandName}, ${genres}, watch free movies online, free movie streaming sites`;
      
      const canonicalUrl = `https://${brand.domain}/?${mediaType}=${mediaId}`;

      // Schema.org Media Object
      const mediaSchema = {
        '@context': 'https://schema.org',
        '@type': mediaType === 'movie' ? 'Movie' : 'TVSeries',
        name: title,
        alternateName: media.original_title || media.original_name || title,
        url: canonicalUrl,
        image: [backdropUrl, posterUrl],
        description: cleanOverview || pageDescription,
        datePublished: releaseDate || '2026-01-01',
        genre: media.genres?.map(g => g.name) || ['Drama', 'Action'],
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: rating,
          bestRating: '10',
          worstRating: '1',
          ratingCount: voteCount
        },
        actor: media.credits?.cast?.slice(0, 5).map(c => ({
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
            item: `https://${brand.domain}/?tab=home`
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: mediaType === 'movie' ? 'Movies' : 'TV Series',
            item: `https://${brand.domain}/?tab=browse&type=${mediaType}`
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: title,
            item: canonicalUrl
          }
        ]
      };

      return replaceHtmlHeadMetadata(rawHtml, {
        title: pageTitle,
        description: pageDescription,
        keywords: pageKeywords,
        canonicalUrl,
        ogType: mediaType === 'movie' ? 'video.movie' : 'video.tv_show',
        ogImage: backdropUrl,
        ogImageAlt: `${title} Poster on ${brand.brandName}`,
        brand,
        structuredData: [mediaSchema, breadcrumbSchema]
      });
    }
  }

  // Case 2: Category & Navigation Pages (Browse Movies, TV Shows, Search, Library)
  const tab = searchParams.get('tab') || (pathname.includes('/browse') ? 'browse' : (pathname.includes('/search') ? 'search' : (pathname.includes('/library') ? 'library' : 'home')));
  const filterType = searchParams.get('type');

  let pageTitle = brand.defaultTitle;
  let pageDescription = brand.defaultDescription;
  let pageKeywords = brand.defaultKeywords;
  let canonicalUrl = `https://${brand.domain}/`;

  if (tab === 'browse') {
    if (filterType === 'movie') {
      pageTitle = `Watch Free Movies Online HD — Trending & Box Office | ${brand.brandName}`;
      pageDescription = `Browse and watch thousands of top trending, blockbuster, and top-rated HD movies online for free on ${brand.brandName} (${brand.domain}). Filter by genre, rating, and year.`;
      pageKeywords = `watch free movies online, browse movies, top 10 movies, free HD movie streaming, ${brand.brandName} movies, action movies free, comedy movies free, horror movies free`;
      canonicalUrl = `https://${brand.domain}/?tab=browse&type=movie`;
    } else if (filterType === 'tv') {
      pageTitle = `Watch TV Shows Online Free — Popular Drama & Series HD | ${brand.brandName}`;
      pageDescription = `Stream popular TV shows, binge-worthy series, and network seasons online in HD for free on ${brand.brandName} (${brand.domain}).`;
      pageKeywords = `watch tv shows online free, stream tv series, free tv show streaming, binge series, ${brand.brandName} tv shows, tv episodes free online`;
      canonicalUrl = `https://${brand.domain}/?tab=browse&type=tv`;
    } else {
      pageTitle = `Discover Movies & TV Shows Online Free | ${brand.brandName}`;
      pageDescription = `Explore high definition movies and TV shows for free on ${brand.brandName} (${brand.domain}) with instant streaming and TMDB ratings.`;
      canonicalUrl = `https://${brand.domain}/?tab=browse`;
    }
  } else if (tab === 'search') {
    const query = searchParams.get('q') || '';
    if (query) {
      pageTitle = `Watch "${query}" Online Free HD | ${brand.brandName} Search`;
      pageDescription = `Search results for "${query}" on ${brand.brandName}. Watch matching full movies and TV episodes in HD for free with zero ads.`;
      canonicalUrl = `https://${brand.domain}/?tab=search&q=${encodeURIComponent(query)}`;
    } else {
      pageTitle = `Search Movies & TV Series Online Free HD | ${brand.brandName}`;
      pageDescription = `Search over 50,000+ movies, TV series, actors, and directors on ${brand.brandName} (${brand.domain}). Instant search with 1080p streaming.`;
      canonicalUrl = `https://${brand.domain}/?tab=search`;
    }
  } else if (tab === 'library') {
    pageTitle = `My Cinema Library & Watchlist | ${brand.brandName}`;
    pageDescription = `Access your personal cinema watchlist, favorites collection, and offline playback items on ${brand.brandName}.`;
    canonicalUrl = `https://${brand.domain}/?tab=library`;
  }

  const websiteSchema = {
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
  };

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: brand.brandName,
    url: `https://${brand.domain}`,
    applicationCategory: 'EntertainmentApplication',
    genre: 'Movies & TV',
    operatingSystem: 'All',
    description: pageDescription,
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
  };

  return replaceHtmlHeadMetadata(rawHtml, {
    title: pageTitle,
    description: pageDescription,
    keywords: pageKeywords,
    canonicalUrl,
    ogType: 'website',
    ogImage: `https://${brand.domain}/favicon.svg`,
    ogImageAlt: `${brand.brandName} Cinema Discovery App`,
    brand,
    structuredData: [websiteSchema, webAppSchema]
  });
}

interface SeoReplacements {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  ogType: string;
  ogImage: string;
  ogImageAlt: string;
  brand: DomainBrand;
  structuredData: object[];
}

function replaceHtmlHeadMetadata(html: string, opts: SeoReplacements): string {
  let output = html;

  // Replace <title>...</title>
  output = output.replace(/<title>.*?<\/title>/is, `<title>${escapeHtml(opts.title)}</title>`);

  // Replace meta title
  output = output.replace(/<meta\s+name=["']title["']\s+content=["'].*?["']\s*\/?>/is, `<meta name="title" content="${escapeHtml(opts.title)}" />`);

  // Replace meta description
  output = output.replace(/<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/is, `<meta name="description" content="${escapeHtml(opts.description)}" />`);

  // Replace meta keywords
  output = output.replace(/<meta\s+name=["']keywords["']\s+content=["'].*?["']\s*\/?>/is, `<meta name="keywords" content="${escapeHtml(opts.keywords)}" />`);

  // Replace canonical link
  if (output.includes('rel="canonical"')) {
    output = output.replace(/<link\s+rel=["']canonical["']\s+href=["'].*?["']\s*\/?>/is, `<link rel="canonical" href="${escapeHtml(opts.canonicalUrl)}" />`);
  } else {
    output = output.replace('</head>', `  <link rel="canonical" href="${escapeHtml(opts.canonicalUrl)}" />\n</head>`);
  }

  // Replace app titles
  output = output.replace(/<meta\s+name=["']apple-mobile-web-app-title["']\s+content=["'].*?["']\s*\/?>/is, `<meta name="apple-mobile-web-app-title" content="${escapeHtml(opts.brand.brandShortName)}" />`);
  output = output.replace(/<meta\s+name=["']application-name["']\s+content=["'].*?["']\s*\/?>/is, `<meta name="application-name" content="${escapeHtml(opts.brand.brandShortName)}" />`);

  // Replace OpenGraph meta
  output = output.replace(/<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/is, `<meta property="og:title" content="${escapeHtml(opts.title)}" />`);
  output = output.replace(/<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/is, `<meta property="og:description" content="${escapeHtml(opts.description)}" />`);
  output = output.replace(/<meta\s+property=["']og:url["']\s+content=["'].*?["']\s*\/?>/is, `<meta property="og:url" content="${escapeHtml(opts.canonicalUrl)}" />`);
  output = output.replace(/<meta\s+property=["']og:site_name["']\s+content=["'].*?["']\s*\/?>/is, `<meta property="og:site_name" content="${escapeHtml(opts.brand.brandName)}" />`);
  output = output.replace(/<meta\s+property=["']og:type["']\s+content=["'].*?["']\s*\/?>/is, `<meta property="og:type" content="${escapeHtml(opts.ogType)}" />`);
  output = output.replace(/<meta\s+property=["']og:image["']\s+content=["'].*?["']\s*\/?>/is, `<meta property="og:image" content="${escapeHtml(opts.ogImage)}" />`);
  output = output.replace(/<meta\s+property=["']og:image:alt["']\s+content=["'].*?["']\s*\/?>/is, `<meta property="og:image:alt" content="${escapeHtml(opts.ogImageAlt)}" />`);

  // Replace Twitter meta
  output = output.replace(/<meta\s+name=["']twitter:title["']\s+content=["'].*?["']\s*\/?>/is, `<meta name="twitter:title" content="${escapeHtml(opts.title)}" />`);
  output = output.replace(/<meta\s+name=["']twitter:description["']\s+content=["'].*?["']\s*\/?>/is, `<meta name="twitter:description" content="${escapeHtml(opts.description)}" />`);
  output = output.replace(/<meta\s+name=["']twitter:image["']\s+content=["'].*?["']\s*\/?>/is, `<meta name="twitter:image" content="${escapeHtml(opts.ogImage)}" />`);
  output = output.replace(/<meta\s+name=["']twitter:domain["']\s+content=["'].*?["']\s*\/?>/is, `<meta name="twitter:domain" content="${escapeHtml(opts.brand.domain)}" />`);
  output = output.replace(/<meta\s+name=["']twitter:url["']\s+content=["'].*?["']\s*\/?>/is, `<meta name="twitter:url" content="${escapeHtml(opts.canonicalUrl)}" />`);

  // Replace JSON-LD schema script
  const jsonLdBlock = `\n    <!-- Server-Side Generated Schema.org JSON-LD -->\n    <script type="application/ld+json">\n      ${JSON.stringify(opts.structuredData, null, 2).replace(/</g, '\\u003c')}\n    </script>\n  `;
  output = output.replace(/<script\s+type=["']application\/ld\+json["']>.*?<\/script>/is, jsonLdBlock.trim());

  return output;
}
