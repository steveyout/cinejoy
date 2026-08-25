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
      brandName: 'CineJoy',
      brandShortName: 'CineJoy',
      brandSub: 'CINEMA JOY',
      documentTitle: 'CineJoy — Watch Movies & TV Series Online Free HD',
      description: 'Watch movies and TV series online in HD for free on CineJoy (cinejoy.to). Discover top trending movies, binge-worthy TV series, 4K official trailers, and TMDB user ratings in frosted glass elegance.',
      keywords: 'CineJoy, cinejoy.to, Cine Joy, cinema joy, watch movies online, stream free movies, HD tv shows, movies, cinema, TV shows, watch trailers, stream movies, top 10 movies, film discovery, cinema app, PWA movies',
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

  // 1. FlixHQ Branding (flixhq.ink, flixhq.to, flixhq)
  if (brandParam === 'flixhq' || hostname.includes('flixhq') || hostname.includes('flixhq.ink') || hostname.includes('flixhq.to')) {
    return {
      brandName: 'FlixHQ',
      brandShortName: 'FlixHQ',
      brandSub: 'STREAM FREE HD',
      documentTitle: 'FlixHQ — Watch Movies & TV Series Online Free HD',
      description: 'Watch movies and TV series online in HD for free on FlixHQ (flixhq.to). Discover top trending movies, binge-worthy TV series, 4K official trailers, and TMDB user ratings.',
      keywords: 'FlixHQ, flixhq.to, flixhq.ink, watch movies online, stream free movies, HD tv shows, FlixHQ streaming, trailers, TMDB ratings, movies and series, cinema app, PWA movies',
      domain: 'flixhq.to',
      logoType: 'flixhq',
      accentGradient: 'from-emerald-400 via-teal-500 to-cyan-600',
      badgeGlowColor: 'rgba(16, 185, 129, 0.45)',
      hqBadge: true,
    };
  }

  // 2. CineJoy Branding (cinejoy.online, cinejoy.to, cunejo.online, or default)
  if (
    brandParam === 'cinejoy' ||
    hostname.includes('cinejoy') ||
    hostname.includes('cunejo') ||
    hostname.includes('cinejoy.online') ||
    hostname.includes('cinejoy.to')
  ) {
    const isOnlineDomain = hostname.includes('cinejoy.online') || hostname.includes('cunejo.online');
    const targetDomain = isOnlineDomain ? 'cinejoy.online' : 'cinejoy.to';
    return {
      brandName: 'CineJoy',
      brandShortName: 'CineJoy',
      brandSub: 'CINEMA JOY',
      documentTitle: `CineJoy — Watch Movies & TV Series Online Free HD`,
      description: `Watch movies and TV series online in HD for free on CineJoy (${targetDomain}). Discover top trending movies, binge-worthy TV series, 4K official trailers, and TMDB user ratings in frosted glass elegance.`,
      keywords: `CineJoy, ${targetDomain}, Cine Joy, cinema joy, watch movies online, stream free movies, HD tv shows, movies, cinema, TV shows, watch trailers, stream movies, top 10 movies, film discovery, cinema app, PWA movies`,
      domain: targetDomain,
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
      keywords: 'BingeBox, bingebox.work, binge watch, movies, cinema, TV shows, watch trailers, stream movies, top 10 movies, film discovery, TV series, PWA streaming, TMDB ratings',
      domain: 'bingebox.work',
      logoType: 'bingebox',
      accentGradient: 'from-indigo-500 via-purple-600 to-pink-600',
      badgeGlowColor: 'rgba(147, 51, 234, 0.45)',
    };
  }

  // 4. Popcorn Movies (popcornmovies.online)
  if (brandParam === 'popcorn' || hostname.includes('popcorn') || hostname.includes('popcornmovies.online')) {
    return {
      brandName: 'Popcorn Movies',
      brandShortName: 'Popcorn',
      brandSub: 'MOVIES & TV',
      documentTitle: 'Popcorn — Watch Trailers, Discover Movies & TV Shows',
      description: 'Discover top trending movies, binge-worthy TV series, 4K official trailers, and TMDB user ratings with Popcorn — the ultimate frosted glass cinema streaming experience.',
      keywords: 'Popcorn Movies, popcornmovies.online, Popcorn, movies, cinema, TV shows, watch trailers, TMDB ratings, stream movies, top 10 movies, film discovery, cinema app, PWA movies',
      domain: 'popcornmovies.online',
      logoType: 'popcorn',
      accentGradient: 'from-amber-500 via-rose-600 to-red-700',
      badgeGlowColor: 'rgba(245, 158, 11, 0.35)',
    };
  }

  // Default fallback (CineJoy - cinejoy.to)
  return {
    brandName: 'CineJoy',
    brandShortName: 'CineJoy',
    brandSub: 'CINEMA JOY',
    documentTitle: 'CineJoy — Watch Movies & TV Series Online Free HD',
    description: 'Watch movies and TV series online in HD for free on CineJoy (cinejoy.to). Discover top trending movies, binge-worthy TV series, 4K official trailers, and TMDB user ratings in frosted glass elegance.',
    keywords: 'CineJoy, cinejoy.to, Cine Joy, cinema joy, watch movies online, stream free movies, HD tv shows, movies, cinema, TV shows, watch trailers, stream movies, top 10 movies, film discovery, cinema app, PWA movies',
    domain: 'cinejoy.to',
    logoType: 'cinejoy',
    accentGradient: 'from-amber-400 via-rose-500 to-purple-600',
    badgeGlowColor: 'rgba(245, 158, 11, 0.45)',
  };
};

/**
 * Dynamically updates DOM meta tags, canonical link, and title based on the active domain
 */
export const applyDomainSEO = (): void => {
  if (typeof document === 'undefined') return;

  const branding = getDomainBranding();

  // Document Title
  document.title = branding.documentTitle;

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

  const domainUrl = `https://${branding.domain}`;

  // Standard Meta Tags
  setMeta('title', branding.documentTitle);
  setMeta('description', branding.description);
  setMeta('keywords', branding.keywords);
  setMeta('application-name', branding.brandShortName);
  setMeta('apple-mobile-web-app-title', branding.brandShortName);

  // Open Graph Tags
  setMeta('og:url', domainUrl, true);
  setMeta('og:title', branding.documentTitle, true);
  setMeta('og:site_name', branding.brandShortName, true);
  setMeta('og:description', branding.description, true);

  // Twitter Tags
  setMeta('twitter:domain', branding.domain);
  setMeta('twitter:url', domainUrl);
  setMeta('twitter:title', branding.documentTitle);
  setMeta('twitter:description', branding.description);

  // Canonical Link
  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', domainUrl);
};

