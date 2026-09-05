/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/**',
      },
      {
        protocol: 'https',
        hostname: 'cinejoy.to',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'flixhq.to',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cinejoy.online',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'flixhq.ink',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Middleware is still supported, this acknowledges the current setup
  experimental: {
    // Enable middleware support explicitly
    middleware: true,
  },
};

export default nextConfig;
