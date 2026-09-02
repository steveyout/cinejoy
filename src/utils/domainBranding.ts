/**
 * Domain-based dynamic branding & SEO configuration.
 * Detects whether the user is accessing via flixhq.ink, cinejoy.online,
 * popcornmovies.online, bingebox.work, or query override ?brand=...,
 * and updates document title, branding text, Open Graph, and meta keywords accordingly.
 */

export type LogoType = 'popcorn' | 'bingebox' | 'cinejoy' | 'flixhq';

export interface DomainBrandConfig {
  brandName: string;
  brandShortName: string;
  brandSub: string;
  documentTitle: string;
  description: string;
  ogDescription?: string;
  ogImageAlt?: string;
  keywords: string;
  domain: string;
  logoType: LogoType;
  accentGradient: string;
  badgeGlowColor: string;
  hqBadge?: boolean;
}

export const getDomainBranding = (): DomainBrandConfig => {
  if (typeof window === 'undefined') {
    return {
      brandName: 'Cinejoy',
      brandShortName: 'Cinejoy',
      brandSub: 'CINEMA JOY',
      documentTitle: 'Cinejoy',
      description: 'Stream Thousands of Movies & TV Shows Free on Cinejoy.',
      ogDescription: 'Watch Free Movies & TV Shows Online, for free.',
      ogImageAlt: 'Cinejoy - Watch Free Movies & TV Shows Online',
      keywords: 'cinejoy, cinejoy.to, watch free movies, free movies to watch online, watch movies online free, free movies streaming, free movies full, free movies download, watch movies hd, movies to watch, plus, ver, assistir, filmes, series, seriados, online, gratis, torrent, legendado, dublados, Series, HD, 720p, 1080p, 4k, cinema',
      domain: 'cinejoy.to',
      logoType: 'cinejoy',
      accentGradient: 'from-amber-400 via-rose-500 to-purple-600',
      badgeGlowColor: 'rgba(245, 158, 11, 0.45)',
    };
  }

  const hostname = window.location.hostname.toLowerCase();
  
  // Allow URL query override for previewing across environments (e.g. ?brand=flixhq or ?brand=cinejoy)
  const urlParams = new URLSearchParams(window.location.search);
  const brandParam = urlParams.get('brand')?.toLowerCase();

  // 1. FlixHQ Branding (flixhq.to, flixhq.ink, flixhq)
  // When accessing via flixhq.ink, maps to flixhq.to
  if (
    brandParam === 'flixhq' ||
    hostname.includes('flixhq') ||
    hostname.includes('flixhq.ink') ||
    hostname.includes('flihq.to') ||
    hostname.includes('flixhq.to')
  ) {
    return {
      brandName: 'FlixHQ',
      brandShortName: 'FlixHQ',
      brandSub: 'STREAM FREE HD',
      documentTitle: 'FlixHQ - Watch TV Shows Online Free, Watch Movies Online Free',
      description: 'FlixHQ is a free movies streaming site with zero ads. We let you watch movies online without having to register or paying, with over 10000 movies and TV-Series.',
      ogDescription: 'FlixHQ is a free movies streaming site with zero ads. We let you watch movies online without having to register or paying, with over 10000 movies and TV-Series.',
      ogImageAlt: 'FlixHQ Cinema Discovery App',
      keywords: 'watch movies online free, watch movies online, free movies online, watch full movies online, free movie streaming, watch tv shows online, watch tv shows online free, flixhq, flixhq.to, flixhq movies, watch series online free, stream hd movies, free movies streaming site',
      domain: 'flixhq.to',
      logoType: 'flixhq',
      accentGradient: 'from-emerald-400 via-teal-500 to-cyan-600',
      badgeGlowColor: 'rgba(16, 185, 129, 0.45)',
      hqBadge: true,
    };
  }

  // 2. Cinejoy Branding (cinejoy.to, cinejoy.online, cunejo.online, or default)
  // When accessing via cinejoy.online, maps to cinejoy.to
  if (
    brandParam === 'cinejoy' ||
    hostname.includes('cinejoy') ||
    hostname.includes('cunejo') ||
    hostname.includes('cinejoy.online') ||
    hostname.includes('cinejoy.to')
  ) {
    return {
      brandName: 'Cinejoy',
      brandShortName: 'Cinejoy',
      brandSub: 'CINEMA JOY',
      documentTitle: 'Cinejoy',
      description: 'Stream Thousands of Movies & TV Shows Free on Cinejoy.',
      ogDescription: 'Watch Free Movies & TV Shows Online, for free.',
      ogImageAlt: 'Cinejoy - Watch Free Movies & TV Shows Online',
      keywords: 'cinejoy, cinejoy.to, watch free movies, free movies to watch online, watch movies online free, free movies streaming, free movies full, free movies download, watch movies hd, movies to watch, plus, ver, assistir, filmes, series, seriados, online, gratis, torrent, legendado, dublados, Series, HD, 720p, 1080p, 4k, cinema',
      domain: 'cinejoy.to',
      logoType: 'cinejoy',
      accentGradient: 'from-amber-400 via-rose-500 to-purple-600',
      badgeGlowColor: 'rgba(245, 158, 11, 0.45)',
    };
  }

  // 3. BingeBox Branding (bingebox.work)
  if (brandParam === 'bingebox' || hostname.includes('bingebox') || hostname.includes('bingebox.work')) {
    return {
      brandName: 'BingeBox',
      brandShortName: 'BingeBox',
      brandSub: 'BINGE WATCH',
      documentTitle: 'BingeBox — Binge Watch Movies, TV Shows & Trailers',
      description: 'Binge watch top trending movies, binge-worthy TV series, 4K official trailers, and TMDB user ratings with BingeBox — the ultimate streaming and cinema discovery experience.',
      ogDescription: 'Binge watch top trending movies, binge-worthy TV series, 4K official trailers, and TMDB user ratings with BingeBox — the ultimate streaming and cinema discovery experience.',
      ogImageAlt: 'BingeBox Streaming & Discovery',
      keywords: 'BingeBox, bingebox.work, binge watch, movies, cinema, TV shows, watch trailers, stream movies, top 10 movies, film discovery, TV series, PWA streaming, TMDB ratings',
      domain: 'bingebox.work',
      logoType: 'bingebox',
      accentGradient: 'from-indigo-500 via-purple-600 to-pink-600',
      badgeGlowColor: 'rgba(147, 51, 234, 0.45)',
    };
  }

  // 4. Cinejoy Movies Alternative domain / alias
  if (brandParam === 'popcorn' || hostname.includes('popcorn') || hostname.includes('popcornmovies.online')) {
    return {
      brandName: 'Cinejoy',
      brandShortName: 'Cinejoy',
      brandSub: 'CINEMA JOY',
      documentTitle: 'Cinejoy',
      description: 'Stream Thousands of Movies & TV Shows Free on Cinejoy.',
      ogDescription: 'Watch Free Movies & TV Shows Online, for free.',
      ogImageAlt: 'Cinejoy - Watch Free Movies & TV Shows Online',
      keywords: 'cinejoy, cinejoy.to, watch free movies, free movies to watch online, watch movies online free, free movies streaming, free movies full, free movies download, watch movies hd, movies to watch, plus, ver, assistir, filmes, series, seriados, online, gratis, torrent, legendado, dublados, Series, HD, 720p, 1080p, 4k, cinema',
      domain: 'cinejoy.to',
      logoType: 'cinejoy',
      accentGradient: 'from-amber-400 via-rose-500 to-purple-600',
      badgeGlowColor: 'rgba(245, 158, 11, 0.45)',
    };
  }

  // Default fallback (Cinejoy - cinejoy.to)
  return {
    brandName: 'Cinejoy',
    brandShortName: 'Cinejoy',
    brandSub: 'CINEMA JOY',
    documentTitle: 'Cinejoy',
    description: 'Stream Thousands of Movies & TV Shows Free on Cinejoy.',
    ogDescription: 'Watch Free Movies & TV Shows Online, for free.',
    ogImageAlt: 'Cinejoy - Watch Free Movies & TV Shows Online',
    keywords: 'cinejoy, cinejoy.to, watch free movies, free movies to watch online, watch movies online free, free movies streaming, free movies full, free movies download, watch movies hd, movies to watch, plus, ver, assistir, filmes, series, seriados, online, gratis, torrent, legendado, dublados, Series, HD, 720p, 1080p, 4k, cinema',
    domain: 'cinejoy.to',
    logoType: 'cinejoy',
    accentGradient: 'from-amber-400 via-rose-500 to-purple-600',
    badgeGlowColor: 'rgba(245, 158, 11, 0.45)',
  };
};

/**
 * Dynamically updates DOM meta tags, canonical link, and title based on the active domain and current page state
 */
export const applyDomainSEO = (
  media?: { title?: string; name?: string; release_date?: string; first_air_date?: string; overview?: string; media_type?: string } | null,
  tab?: string,
  query?: string
): void => {
  if (typeof document === 'undefined') return;

  const branding = getDomainBranding();
  const isFlixHQ = branding.brandName === 'FlixHQ' || branding.domain === 'flixhq.to';
  const isCinejoy = branding.brandName === 'Cinejoy' || branding.domain === 'cinejoy.to';

  let pageTitle = branding.documentTitle;
  let pageDescription = branding.description;
  let pageOgDescription = branding.ogDescription || branding.description;
  let pageKeywords = branding.keywords;
  let pageCanonical = `https://${branding.domain}/`;

  if (media) {
    const title = media.title || media.name || 'Untitled';
    const releaseDate = media.release_date || media.first_air_date || '';
    const year = releaseDate ? releaseDate.slice(0, 4) : '';
    const yearSuffix = year ? ` (${year})` : '';
    const isTv = media.media_type === 'tv';

    if (isFlixHQ) {
      pageTitle = `Watch ${title}${yearSuffix} Online Free on FlixHQ`;
      pageDescription = `Watch ${title}${yearSuffix} online free in full HD on FlixHQ. ${media.overview ? media.overview.slice(0, 160) + '...' : `Stream ${title} without registration with zero ads on flixhq.to.`}`;
      pageOgDescription = pageDescription;
      pageKeywords = `watch ${title} online free, ${title} full ${isTv ? 'episodes' : 'movie'}, stream ${title} hd, ${title} free streaming, ${title}${yearSuffix}, flixhq, flixhq.to, watch ${isTv ? 'tv shows' : 'movies'} online free`;
    } else if (isCinejoy) {
      pageTitle = `Watch ${title}${yearSuffix} Online Free on Cinejoy`;
      pageDescription = `Stream ${title}${yearSuffix} free on Cinejoy. Watch Free Movies & TV Shows Online, for free. ${media.overview ? media.overview.slice(0, 150) + '...' : ''}`;
      pageOgDescription = `Stream ${title}${yearSuffix} on Cinejoy for free. Watch Free Movies & TV Shows Online, for free.`;
      pageKeywords = `cinejoy, cinejoy.to, watch ${title} online free, stream ${title}, ${title} free streaming, ${title}${yearSuffix}, watch free movies, free movies to watch online, watch movies online free`;
    } else {
      pageTitle = `Watch ${title}${yearSuffix} Online Free HD | ${branding.brandName} Official`;
      pageDescription = `Watch ${title}${yearSuffix} online in full 1080p HD on ${branding.brandName} (${branding.domain}). ${media.overview ? media.overview.slice(0, 150) + '...' : `Stream ${title} for free with fast servers.`}`;
      pageOgDescription = pageDescription;
      pageKeywords = `${title}, watch ${title} online free, stream ${title} free, ${title} HD 1080p, ${branding.brandName}`;
    }
  } else if (tab === 'browse') {
    if (isFlixHQ) {
      pageTitle = 'Watch Free Movies Online in Full HD on FlixHQ - FlixHQ.to';
      pageDescription = 'Browse and watch movies online for free on FlixHQ. High quality streaming with zero ads and no registration on flixhq.to.';
      pageOgDescription = pageDescription;
      pageKeywords = 'watch free movies online, free hd movies, flixhq movies, browse movies online, watch full movies free, flixhq.to';
    } else if (isCinejoy) {
      pageTitle = 'Cinejoy - Watch Free Movies & TV Shows Online';
      pageDescription = 'Stream Thousands of Movies & TV Shows Free on Cinejoy. Watch Free Movies & TV Shows Online, for free.';
      pageOgDescription = 'Watch Free Movies & TV Shows Online, for free.';
      pageKeywords = 'cinejoy, cinejoy.to, watch free movies, free movies to watch online, watch movies online free, free movies streaming, free movies full, watch movies hd, movies to watch';
    }
    pageCanonical = `https://${branding.domain}/?tab=browse`;
  } else if (tab === 'search' && query) {
    if (isFlixHQ) {
      pageTitle = `Watch "${query}" Online Free on FlixHQ`;
      pageDescription = `Watch "${query}" online for free in HD on FlixHQ with zero ads. Stream full movies and TV shows matching "${query}" on flixhq.to.`;
      pageOgDescription = pageDescription;
    } else if (isCinejoy) {
      pageTitle = `Watch "${query}" Online Free on Cinejoy`;
      pageDescription = `Stream "${query}" and thousands of movies & TV shows free on Cinejoy. Watch Free Movies & TV Shows Online, for free.`;
      pageOgDescription = `Stream "${query}" and thousands of movies & TV shows free on Cinejoy. Watch Free Movies & TV Shows Online, for free.`;
      pageKeywords = `cinejoy, cinejoy.to, watch ${query} online free, stream ${query}, watch free movies, free movies to watch online`;
    }
    pageCanonical = `https://${branding.domain}/?tab=search&q=${encodeURIComponent(query)}`;
  }

  // Document Title
  document.title = pageTitle;

  const setMeta = (nameOrProperty: string, content: string, isProperty = false) => {
    const selector = isProperty 
      ? `meta[property="${nameOrProperty}"]` 
      : `meta[name="${nameOrProperty}"]`;
    let element = document.querySelector(selector) as HTMLMetaElement | null;
    if (!element) {
      element = document.createElement('meta');
      if (isProperty) {
        element.setAttribute('property', nameOrProperty);
      } else {
        element.setAttribute('name', nameOrProperty);
      }
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  const domainUrl = pageCanonical;

  // Standard Meta Tags
  setMeta('title', pageTitle);
  setMeta('description', pageDescription);
  setMeta('keywords', pageKeywords);
  setMeta('application-name', branding.brandShortName);
  setMeta('apple-mobile-web-app-title', branding.brandShortName);
  setMeta('author', branding.brandName);

  // Open Graph Tags
  setMeta('og:url', domainUrl, true);
  setMeta('og:title', pageTitle, true);
  setMeta('og:site_name', branding.brandShortName, true);
  setMeta('og:description', pageOgDescription, true);
  setMeta('og:locale', 'en_US', true);
  if (branding.ogImageAlt) {
    setMeta('og:image:alt', branding.ogImageAlt, true);
  }

  // Twitter Tags
  setMeta('twitter:domain', branding.domain);
  setMeta('twitter:url', domainUrl);
  setMeta('twitter:title', pageTitle);
  setMeta('twitter:description', pageOgDescription);
  if (branding.ogImageAlt) {
    setMeta('twitter:image:alt', branding.ogImageAlt);
  }

  // Canonical Link
  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', pageCanonical);
};

