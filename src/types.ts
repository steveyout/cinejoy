export interface MediaItem {
  id: number;
  title?: string;
  name?: string; // For TV shows
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date?: string;
  first_air_date?: string;
  media_type: 'movie' | 'tv';
  genre_ids: number[];
  genres?: Genre[];
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  tagline?: string;
  status?: string;
  trailer_key?: string;
  popularity?: number;
  cast?: CastMember[];
  similar?: MediaItem[];
  reviews?: Review[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface VideoTrailer {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface Review {
  id: string;
  author: string;
  content: string;
  rating: number | null;
  created_at: string;
}

export interface WatchlistItem {
  id: number;
  item: MediaItem;
  addedAt: number;
  watched: boolean;
  isFavorite: boolean;
  progress?: number; // 0 to 100%
  downloaded?: boolean;
}

export type NavTab = 'home' | 'browse' | 'search' | 'library' | 'menu';

export interface FilterState {
  mediaType: 'movie' | 'tv' | 'all';
  genreId: number | null;
  sortBy: 'popularity.desc' | 'vote_average.desc' | 'primary_release_date.desc' | 'revenue.desc';
  year: string;
  minRating: number;
}

export type FilterOptions = FilterState;

export type GlassmorphismTint = 'violet' | 'emerald' | 'rose' | 'cyan' | 'amber' | 'midnight';

export interface AppSettings {
  tmdbApiKey: string;
  useLiveTmdb: boolean;
  accentColor: 'cyan' | 'amber' | 'rose' | 'emerald' | 'purple';
  glassTint?: GlassmorphismTint; // Dynamic Glassmorphism tint & background glow (Violet, Emerald, Rose, etc.)
  autoPlayTrailers: boolean;
  streamQuality: '1080p' | '4K' | '720p';
  // VidCore Player Settings & Parameters
  autoplayNextEpisode?: boolean; // Autoplay next TV episode with 10s countdown
  autoplayStream?: boolean; // VidCore autoplay parameter
  playerLanguage?: string; // VidCore lang parameter (en, es, fr, etc.)
  playerShowRelated?: boolean; // VidCore showRelated parameter
  playerDisableInfo?: boolean; // VidCore disableInfo parameter
  playerDisableControls?: boolean; // VidCore disableControls parameter
  // Ambient Light Glow System
  ambientLightEnabled?: boolean; // Dominant color ambient light glow around player
  ambientIntensity?: 'subtle' | 'normal' | 'vivid'; // Ambient light glow intensity
}
