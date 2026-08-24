export interface Provider {
  id: string;
  name: string;
  baseUrl: string;
  enabled: boolean;
}

export const providers: Provider[] = [
  {
    id: 'vidcore',
    name: 'VidCore Next-Gen Engine',
    baseUrl: 'https://vidcore.org',
    enabled: true,
  },
];

export const DEFAULT_PROVIDER_ID = 'vidcore';

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
 * Builds the official VidCore URL based on media type and parameters:
 * autoplay, startAt, theme, color, disableInfo, disableControls, showRelated, lang
 */
export const getEmbedUrl = (
  providerId: string = 'vidcore',
  type: 'movie' | 'tv',
  tmdbId: string | number,
  season: number = 1,
  episode: number = 1,
  progressSeconds: number = 0,
  themeColor: string = 'F59E0B',
  options: EmbedOptions = {}
): string => {
  const cleanTheme = (themeColor.startsWith('#') ? themeColor.slice(1) : themeColor) || 'F59E0B';
  const baseUrl = 'https://vidcore.org';

  const path = type === 'movie'
    ? `${baseUrl}/embed/movie/${tmdbId}`
    : `${baseUrl}/embed/tv/${tmdbId}/${season}/${episode}`;

  const queryParams = new URLSearchParams();

  // VidCore Parameters
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
};

export const getNextEnabledProviderId = (currentId: string, failedIds: string[] = []): string | null => {
  return null;
};
