import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Providers } from '@/components/Providers';
import { getDomainBranding } from '@/utils/domainBranding';
import { cookies, headers } from 'next/headers';
import { generateSlug } from '@/src/utils/slug';
import { tmdbService } from '@/src/services/tmdb';

const inter = Inter({ subsets: ['latin'] });

// Dynamic metadata function for SEO
export async function generateMetadata({  
  searchParams = {} 
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}): Promise<Metadata> {
  const branding = getDomainBranding();
  
  // Default metadata
  let title = branding.documentTitle;
  let description = branding.description;
  let keywords = branding.keywords;
  let ogTitle = branding.documentTitle;
  let ogDescription = branding.ogDescription || branding.description;
  let ogImage = `https://${branding.domain}/favicon.png`;
  let ogImageAlt = branding.ogImageAlt || `${branding.brandName} Cinema Discovery App`;
  let canonicalUrl = `https://${branding.domain}/`;
  
  // Extract query parameters
  const tab = searchParams?.tab as string | undefined;
  const movieId = searchParams?.movie as string | undefined;
  const tvId = searchParams?.tv as string | undefined;
  const query = searchParams?.q as string | undefined;
  const type = searchParams?.type as string | undefined;
  
  // Handle specific media detail pages
  if (movieId) {
    // Generate SEO-friendly slug
    const mediaId = parseInt(movieId, 10);
    const slug = generateSlug(undefined, mediaId);
    
    title = `Watch Movie on ${branding.brandName}`;
    description = `Stream movies online for free on ${branding.brandName}. Watch the latest blockbusters and classics in HD.`;
    keywords = `watch movies online free, stream movies, ${branding.brandName} movies, free movie streaming`;
    ogTitle = title;
    ogDescription = description;
    canonicalUrl = `https://${branding.domain}/movie/${slug}`;
  } else if (tvId) {
    const mediaId = parseInt(tvId, 10);
    const slug = generateSlug(undefined, mediaId);
    
    title = `Watch TV Series on ${branding.brandName}`;
    description = `Stream TV shows and series online for free on ${branding.brandName}. Binge-watch your favorite series in HD.`;
    keywords = `watch tv shows online free, stream series, ${branding.brandName} tv, free tv streaming`;
    ogTitle = title;
    ogDescription = description;
    canonicalUrl = `https://${branding.domain}/tv/${slug}`;
  } else if (tab === 'search' && query) {
    title = `Watch "${query}" Online Free on ${branding.brandName}`;
    description = `Search results for "${query}" on ${branding.brandName}. Find movies and TV shows matching your query.`;
    keywords = `search ${query}, watch ${query} online, ${branding.brandName} search, free movies, free tv shows`;
    ogTitle = title;
    ogDescription = description;
    canonicalUrl = `https://${branding.domain}/?tab=search&q=${encodeURIComponent(query)}`;
  } else if (tab === 'browse' && type) {
    const mediaType = type === 'tv' ? 'TV Shows' : 'Movies';
    title = `Browse ${mediaType} on ${branding.brandName}`;
    description = `Browse and discover ${type === 'tv' ? 'popular TV shows and series' : 'thousands of movies'} on ${branding.brandName}.`;
    keywords = `browse ${type}, ${branding.brandName} ${type}, free ${type} streaming, discover ${type}`;
    ogTitle = title;
    ogDescription = description;
    canonicalUrl = `https://${branding.domain}/?tab=browse&type=${type}`;
  } else if (tab === 'library') {
    title = `My Library | ${branding.brandName}`;
    description = `Access your personal movie and TV series watchlist, favorites collection, and history on ${branding.brandName}.`;
    keywords = `library, watchlist, favorites, my movies, my tv shows, ${branding.brandName} library`;
    ogTitle = title;
    ogDescription = description;
    canonicalUrl = `https://${branding.domain}/?tab=library`;
  }

  return {
    title: title,
    description: description,
    keywords: keywords,
    authors: [{ name: branding.brandName }],
    publisher: branding.brandName,
    icons: {
      icon: '/favicon.png',
      shortcut: '/favicon.png',
      apple: '/favicon.png',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonicalUrl,
      siteName: branding.brandName,
      type: 'website',
      images: [
        {
          url: ogImage,
          alt: ogImageAlt,
          width: 1200,
          height: 630,
        },
      ],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
      creator: branding.brandName,
      site: branding.domain,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    // Schema.org JSON-LD structured data
    other: {
      'googlebot': 'index, follow',
      'bingbot': 'index, follow',
      'theme-color': '#050508',
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#050508',
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 5.0,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#050508] text-white`}>
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', { send_page_view: true });
              `}
            </Script>
          </>
        )}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}