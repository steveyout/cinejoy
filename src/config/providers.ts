export interface Provider {
  id: string;
  name: string;
  baseUrl: string;
  enabled: boolean;
  tag?: string;
  speed?: 'Ultra Fast' | 'Fast' | 'HD' | '4K Ready';
  isDefault?: boolean;
}

export const providers: Provider[] = [
  {
    id: 'cinemaos',
    name: 'CinemaOS',
    baseUrl: 'https://vidcore.org',
    enabled: true,
    tag: 'Default Player',
    speed: 'Ultra Fast',
    isDefault: true,
  },
  {
    id: 'novacore',
    name: 'NovaCore Stream',
    baseUrl: 'https://vidsrc.to',
    enabled: true,
    tag: 'High Bitrate',
    speed: '4K Ready',
  },
  {
    id: 'orion',
    name: 'Orion CDN',
    baseUrl: 'https://embed.su',
    enabled: true,
    tag: 'Multi-Region',
    speed: 'Ultra Fast',
  },
  {
    id: 'apexstream',
    name: 'ApexStream Ultra',
    baseUrl: 'https://vidlink.pro',
    enabled: true,
    tag: 'Zero Buffer',
    speed: 'HD',
  },
  {
    id: 'nebulaplayer',
    name: 'Nebula Player',
    baseUrl: 'https://player.autoembed.cc',
    enabled: true,
    tag: 'Global Edge',
    speed: 'Fast',
  },
  {
    id: 'quantumvid',
    name: 'QuantumVid Cloud',
    baseUrl: 'https://player.smashy.stream',
    enabled: true,
    tag: 'Direct Server',
    speed: 'HD',
  },
  {
    id: 'chronocast',
    name: 'ChronoCast HD',
    baseUrl: 'https://www.2embed.cc',
    enabled: true,
    tag: 'Backup Server',
    speed: 'Fast',
  },
  {
    id: 'starlight',
    name: 'Starlight CDN',
    baseUrl: 'https://multiembed.mov',
    enabled: true,
    tag: 'Adaptive Mesh',
    speed: '4K Ready',
  },
  {
    id: 'helios',
    name: 'Helios Stream',
    baseUrl: 'https://player.vidsrc.nl',
    enabled: true,
    tag: 'VIP Server',
    speed: 'Ultra Fast',
  },
  {
    id: 'vidcore',
    name: 'VidCore Engine',
    baseUrl: 'https://vidcore.org',
    enabled: true,
    tag: 'Legacy Core',
    speed: 'Ultra Fast',
  },
];

export const DEFAULT_PROVIDER_ID = 'cinemaos';

export const THEME_COLOR_MAP: Record<string, string> = {
  amber: 'F59E0B',
  cyan: '06B6D4',
  rose: 'F43F5E',
  emerald: '10B981',
  purple: '8B5CF6',
  default: 'F59E0B'
};

export interface EmbedOptions {
  autoplay?: boolean;
  startAt?: number;
  themeColor?: string;
  lang?: string;
  showRelated?: boolean;
  disableInfo?: boolean;
  disableControls?: boolean;
}

/**
 * Builds the embed stream URL for the selected provider.
 * CinemaOS (default) supports full custom styling, parameters, language tracks, and postMessages.
 */
export const getEmbedUrl = (
  providerId: string = DEFAULT_PROVIDER_ID,
  type: 'movie' | 'tv',
  tmdbId: string | number,
  season: number = 1,
  episode: number = 1,
  progressSeconds: number = 0,
  themeColor: string = 'F59E0B',
  options: EmbedOptions = {}
): string => {
  const cleanTheme = (themeColor.startsWith('#') ? themeColor.slice(1) : themeColor) || 'F59E0B';
  const cleanId = String(tmdbId);
  const targetProvider = providerId || DEFAULT_PROVIDER_ID;

  // 1. CinemaOS & VidCore (Full parameter support)
  if (targetProvider === 'cinemaos' || targetProvider === 'vidcore') {
    const baseUrl = 'https://vidcore.org';
    const path = type === 'movie'
      ? `${baseUrl}/embed/movie/${cleanId}`
      : `${baseUrl}/embed/tv/${cleanId}/${season}/${episode}`;

    const queryParams = new URLSearchParams();
    queryParams.set('theme', cleanTheme);
    queryParams.set('color', cleanTheme);

    if (options.autoplay !== false) {
      queryParams.set('autoplay', '1');
    }

    if (progressSeconds > 0 || (options.startAt && options.startAt > 0)) {
      queryParams.set('startAt', String(progressSeconds || options.startAt || 0));
    }

    if (options.lang) {
      queryParams.set('lang', options.lang);
    }

    if (options.showRelated !== undefined) {
      queryParams.set('showRelated', options.showRelated ? 'true' : 'false');
    }

    if (options.disableInfo) {
      queryParams.set('disableInfo', 'true');
    }

    if (options.disableControls) {
      queryParams.set('disableControls', 'true');
    }

    return `${path}?${queryParams.toString()}`;
  }

  // 2. NovaCore Stream (vidsrc.to)
  if (targetProvider === 'novacore') {
    return type === 'movie'
      ? `https://vidsrc.to/embed/movie/${cleanId}`
      : `https://vidsrc.to/embed/tv/${cleanId}/${season}/${episode}`;
  }

  // 3. Orion CDN (embed.su)
  if (targetProvider === 'orion') {
    return type === 'movie'
      ? `https://embed.su/embed/movie/${cleanId}`
      : `https://embed.su/embed/tv/${cleanId}/${season}/${episode}`;
  }

  // 4. ApexStream Ultra (vidlink.pro)
  if (targetProvider === 'apexstream') {
    const autoParam = options.autoplay !== false ? '?autoplay=true' : '';
    return type === 'movie'
      ? `https://vidlink.pro/movie/${cleanId}${autoParam}`
      : `https://vidlink.pro/tv/${cleanId}/${season}/${episode}${autoParam}`;
  }

  // 5. Nebula Player (player.autoembed.cc)
  if (targetProvider === 'nebulaplayer') {
    return type === 'movie'
      ? `https://player.autoembed.cc/embed/movie/${cleanId}`
      : `https://player.autoembed.cc/embed/tv/${cleanId}/${season}/${episode}`;
  }

  // 6. QuantumVid Cloud (player.smashy.stream)
  if (targetProvider === 'quantumvid') {
    return type === 'movie'
      ? `https://player.smashy.stream/movie/${cleanId}`
      : `https://player.smashy.stream/tv/${cleanId}?s=${season}&e=${episode}`;
  }

  // 7. ChronoCast HD (2embed.cc)
  if (targetProvider === 'chronocast') {
    return type === 'movie'
      ? `https://www.2embed.cc/embed/${cleanId}`
      : `https://www.2embed.cc/embedtv/${cleanId}&s=${season}&e=${episode}`;
  }

  // 8. Starlight CDN (multiembed.mov)
  if (targetProvider === 'starlight') {
    return type === 'movie'
      ? `https://multiembed.mov/?video_id=${cleanId}&tmdb=1`
      : `https://multiembed.mov/?video_id=${cleanId}&tmdb=1&s=${season}&e=${episode}`;
  }

  // 9. Helios Stream (player.vidsrc.nl)
  if (targetProvider === 'helios') {
    return type === 'movie'
      ? `https://player.vidsrc.nl/embed/movie/${cleanId}`
      : `https://player.vidsrc.nl/embed/tv/${cleanId}/${season}/${episode}`;
  }

  // Default Fallback to CinemaOS
  return type === 'movie'
    ? `https://vidcore.org/embed/movie/${cleanId}?theme=${cleanTheme}&color=${cleanTheme}&autoplay=1`
    : `https://vidcore.org/embed/tv/${cleanId}/${season}/${episode}?theme=${cleanTheme}&color=${cleanTheme}&autoplay=1`;
};

export const getNextEnabledProviderId = (currentId: string, failedIds: string[] = []): string | null => {
  const enabledProviders = providers.filter((p) => p.enabled && !failedIds.includes(p.id));
  if (enabledProviders.length === 0) return null;

  const currentIndex = enabledProviders.findIndex((p) => p.id === currentId);
  if (currentIndex === -1 || currentIndex === enabledProviders.length - 1) {
    return enabledProviders[0].id;
  }
  return enabledProviders[currentIndex + 1].id;
};
