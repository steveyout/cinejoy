/**
 * Domain-based dynamic branding & SEO configuration.
 * Simplified version for Next.js App Router compatibility
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

// Server-side version that doesn't depend on window
function getBrandingForDomain(domain: string | null = null): DomainBrandConfig {
  const host = domain?.toLowerCase() || 'cinejoy.to';
  
  // 1. FlixHQ Branding (flixhq.to, flixhq.ink, flixhq)
  if (host.includes('flixhq') || host.includes('flihq.to')) {
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

  // 2. Cinejoy Branding (default)
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

// Server-side function for Next.js App Router
// Reads the host header to detect the current domain
export async function getDomainBranding(): Promise<DomainBrandConfig> {
  try {
    const { headers } = await Promise.resolve(require('next/headers'));
    const h = await headers();
    const host = h.get('host') || h.get('x-forwarded-host') || null;
    return getBrandingForDomain(host);
  } catch {
    return getBrandingForDomain(null);
  }
}

// Client-side version that can detect current domain
export function getDomainBrandingClient(): DomainBrandConfig {
  if (typeof window === 'undefined') {
    return getBrandingForDomain(null);
  }
  
  const hostname = window.location.hostname.toLowerCase();
  const urlParams = new URLSearchParams(window.location.search);
  const brandParam = urlParams.get('brand')?.toLowerCase();
  
  // Allow URL query override
  if (brandParam) {
    if (brandParam === 'flixhq') {
      return getBrandingForDomain('flixhq.to');
    } else if (brandParam === 'cinejoy') {
      return getBrandingForDomain('cinejoy.to');
    }
  }
  
  // Check hostname
  if (hostname.includes('flixhq') || hostname.includes('flihq.to')) {
    return getBrandingForDomain('flixhq.to');
  }
  
  // Default to cinejoy
  return getBrandingForDomain(null);
}