import { NextRequest, NextResponse } from 'next/server';

// This middleware handles domain-based branding and request rewriting
// It's used to maintain compatibility with the existing URL structure

// Configure matcher to include favicon and exclude other static files
export const config = {
  matcher: [
    /* Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     */
    '/((?!api|_next/static|_next/image).*)',
  ],
};

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host');
  const path = url.pathname;

  // Domain-based branding detection
  let isFlixHQ = false;
  let isCinejoy = true;
  
  if (hostname) {
    const hostLower = hostname.toLowerCase();
    if (hostLower.includes('flixhq') || hostLower.includes('flihq.to') || hostLower.includes('flixhq.to') || hostLower.includes('flixhq.ink')) {
      isFlixHQ = true;
      isCinejoy = false;
    } else if (hostLower.includes('cinejoy.online') || hostLower.includes('cinejoy.to')) {
      isCinejoy = true;
      isFlixHQ = false;
    }
  }

  let brandDomain = isFlixHQ ? (hostname?.includes('flixhq.ink') ? 'flixhq.ink' : 'flixhq.to') : 
                     isCinejoy ? (hostname?.includes('cinejoy.online') ? 'cinejoy.online' : 'cinejoy.to') : 
                     'cinejoy.to';

  // Handle favicon requests with domain-specific icons
  if (path === '/favicon.ico' || path === '/favicon.png') {
    const faviconFile = isFlixHQ ? '/favicon-flixhq.png' : '/favicon-cinejoy.png';
    return NextResponse.rewrite(new URL(faviconFile, request.url));
  }

  // Handle query parameters for backward compatibility
  const searchParams = url.searchParams;
  
  // If we have movie or tv query parameters, we can optionally redirect to clean URLs
  if (searchParams.has('movie') || searchParams.has('tv')) {
    // Keep the query parameters for now to maintain compatibility
    // In the future, we could redirect to /movie/[id] or /tv/[id]
  }

  // Add branding cookie for client-side detection
  const response = NextResponse.rewrite(url);
  
  // Set domain branding cookie
  response.cookies.set('brand-domain', brandDomain, {
    path: '/',
    maxAge: 86400, // 1 day
    httpOnly: true,
    sameSite: 'lax',
  });

  // Add security headers
  response.headers.set('X-Powered-By', 'Cinejoy Next.js SSR SEO Engine');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Cache control for SEO
  if (path.startsWith('/api/seo')) {
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600');
  } else {
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=300');
  }

  return response;
}

// Re-export types for usage
export type { NextRequest, NextResponse };