// config/providers.ts

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
    name: 'Aether 1 (Primary)',
    baseUrl: 'https://cinemaos.tech',
    enabled: true,
    tag: 'Default Engine',
    speed: 'Ultra Fast',
    isDefault: true,
  },
  {
    id: 'vidking',
    name: 'Nebula Stream X',
    baseUrl: 'https://www.vidking.net',
    enabled: true,
    tag: 'Next Episode',
    speed: '4K Ready',
  },
  {
    id: 'vidlink',
    name: 'Hyperion Link',
    baseUrl: 'https://vidlink.pro',
    enabled: true,
    tag: 'Zero Buffer',
    speed: 'HD',
  },
  {
    id: 'vidsrc_to',
    name: 'Solaris Cloud',
    baseUrl: 'https://vidsrc.to/embed',
    enabled: true,
    tag: 'VIP Server',
    speed: 'Ultra Fast',
  },
  {
    id: 'vidnest',
    name: 'Chronos Node',
    baseUrl: 'https://vidnest.fun',
    enabled: true,
    tag: 'Direct Node',
    speed: 'HD',
  },
  {
    id: 'vidfast',
    name: 'Vortex Quantum',
    baseUrl: 'https://vidfast.net',
    enabled: true,
    tag: 'Fast Buffer',
    speed: 'Fast',
  },
  {
    id: 'videasy',
    name: 'Elysium Edge',
    baseUrl: 'https://player.videasy.net',
    enabled: true,
    tag: 'Global Edge',
    speed: 'Fast',
  },
  {
    id: 'vidsrc_me',
    name: 'Pulsar Relay',
    baseUrl: 'https://vsembed.ru/embed',
    enabled: true,
    tag: 'Backup Server',
    speed: 'HD',
  },
  {
    id: 'vidup',
    name: 'Titan Mesh',
    baseUrl: 'https://vidup.to',
    enabled: true,
    tag: 'Adaptive Mesh',
    speed: 'Fast',
  },
  {
    id: 'rivestream',
    name: 'Zenith Direct',
    baseUrl: 'https://rivestream.org/embed',
    enabled: true,
    tag: 'High Bitrate',
    speed: '4K Ready',
  },
  {
    id: 'vidcore',
    name: 'Astral Core 9',
    baseUrl: 'https://vidcore.org',
    enabled: true,
    tag: 'VidCore Core',
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
 * Helper to build the URL based on media type
 * Supports both Movies and TV Shows
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
  const selected = providers.find((p) => p.id === providerId) || providers[0];
  const cleanId = String(tmdbId);
  const cleanTheme = (themeColor.startsWith('#') ? themeColor.slice(1) : themeColor) || 'F59E0B';

  // Server 1 (CinemaOS)
  if (selected.id === 'cinemaos') {
    return type === 'movie'
      ? `${selected.baseUrl}/player/${cleanId}`
      : `${selected.baseUrl}/player/${cleanId}/${season}/${episode}`;
  }

  // Server 2 (VidKing Premium)
  if (selected.id === 'vidking') {
    let url = "";
    if (type === 'movie') {
      url = `${selected.baseUrl}/embed/movie/${cleanId}?color=e50914`;
    } else {
      url = `${selected.baseUrl}/embed/tv/${cleanId}/${season}/${episode}?color=e50914&nextEpisode=true&episodeSelector=true`;
    }
    if (progressSeconds > 0 || (options.startAt && options.startAt > 0)) {
      url += `&progress=${progressSeconds || options.startAt}`;
    }
    return url;
  }

  // Server 11 (VidCore)
  if (selected.id === 'vidcore') {
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

  // Server 3 (VidLink Pro)
  if (selected.id === 'vidlink') {
    return type === 'movie'
      ? `${selected.baseUrl}/movie/${cleanId}`
      : `${selected.baseUrl}/tv/${cleanId}/${season}/${episode}`;
  }

  // Server 4 (VIP / vidsrc.to)
  if (selected.id === 'vidsrc_to') {
    return type === 'movie'
      ? `${selected.baseUrl}/movie/${cleanId}`
      : `${selected.baseUrl}/tv/${cleanId}/${season}/${episode}`;
  }

  // Server 5 (VidNest)
  if (selected.id === 'vidnest') {
    return type === 'movie'
      ? `${selected.baseUrl}/movie/${cleanId}`
      : `${selected.baseUrl}/tv/${cleanId}/${season}/${episode}`;
  }

  // Server 6 (VidFast)
  if (selected.id === 'vidfast') {
    return type === 'movie'
      ? `${selected.baseUrl}/movie/${cleanId}`
      : `${selected.baseUrl}/tv/${cleanId}/${season}/${episode}`;
  }

  // Server 7 (VidEasy)
  if (selected.id === 'videasy') {
    return type === 'movie'
      ? `${selected.baseUrl}/movie/${cleanId}`
      : `${selected.baseUrl}/tv/${cleanId}/${season}/${episode}`;
  }

  // Server 8 (Vidsrc Me)
  if (selected.id === 'vidsrc_me') {
    return type === 'movie'
      ? `${selected.baseUrl}/movie/${cleanId}`
      : `${selected.baseUrl}/tv/${cleanId}/${season}/${episode}`;
  }

  // Server 9 (Vidup)
  if (selected.id === 'vidup') {
    return type === 'movie'
      ? `${selected.baseUrl}/movie/${cleanId}`
      : `${selected.baseUrl}/tv/${cleanId}/${season}/${episode}`;
  }

  // Server 10 (Rive)
  if (selected.id === 'rivestream') {
    return type === 'movie'
      ? `${selected.baseUrl}/movie/${cleanId}`
      : `${selected.baseUrl}/tv/${cleanId}/${season}/${episode}`;
  }

  // Fallbacks for other servers
  if (type === 'movie') {
    return `${selected.baseUrl}/movie/${cleanId}`;
  }
  return `${selected.baseUrl}/tv/${cleanId}/${season}/${episode}`;
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
