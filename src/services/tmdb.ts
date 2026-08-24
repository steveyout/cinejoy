import { MediaItem, Genre, CastMember, VideoTrailer, Review, FilterOptions } from '../types';
import { CURATED_MEDIA, GENRES, FALLBACK_BACKDROP, FALLBACK_POSTER } from './curatedData';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Default TMDB key from environment secret or fallback
const ENV_TMDB_KEY = (import.meta.env?.VITE_TMDB_API_KEY as string | undefined)?.trim() || 'addfba41d0cb5aba2ebaae12ac92b671';
let customApiKey = ENV_TMDB_KEY;

export const setTmdbApiKey = (key: string) => {
  customApiKey = key.trim() || ENV_TMDB_KEY;
};

export const getTmdbApiKey = () => {
  return customApiKey || ENV_TMDB_KEY;
};

export const getImageUrl = (path: string | null | undefined, size: 'w200' | 'w300' | 'w500' | 'w780' | 'original' = 'w500'): string => {
  if (!path) return FALLBACK_POSTER;
  if (path.startsWith('http')) return path;
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const getBackdropUrl = (path: string | null | undefined, size: 'w780' | 'w1280' | 'original' = 'w1280'): string => {
  if (!path) return FALLBACK_BACKDROP;
  if (path.startsWith('http')) return path;
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const formatYear = (dateStr?: string): string => {
  if (!dateStr) return '2026';
  try {
    return new Date(dateStr).getFullYear().toString() || '2026';
  } catch {
    return dateStr.slice(0, 4) || '2026';
  }
};

export const formatDuration = (minutes?: number): string => {
  if (!minutes) return '2h 10m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  return `${hrs}h ${mins > 0 ? `${mins}m` : ''}`;
};

export const getGenreNames = (genreIds: number[] = []): string[] => {
  return genreIds
    .map(id => GENRES.find(g => g.id === id)?.name)
    .filter((name): name is string => Boolean(name));
};

async function fetchFromTMDB<T>(endpoint: string, params: Record<string, string | number | boolean> = {}): Promise<T | null> {
  const apiKey = customApiKey || ENV_TMDB_KEY;
  const query = new URLSearchParams({
    api_key: apiKey,
    language: 'en-US',
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
  });

  try {
    const res = await fetch(`${TMDB_BASE_URL}${endpoint}?${query.toString()}`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    return null;
  }
}

// Map TMDB raw item to our MediaItem interface
function transformTmdbItem(item: any, defaultType: 'movie' | 'tv' = 'movie'): MediaItem {
  const media_type = item.media_type || (item.first_air_date ? 'tv' : defaultType);
  return {
    id: item.id,
    title: item.title || item.name || 'Untitled',
    name: item.name || item.title || 'Untitled',
    original_title: item.original_title,
    original_name: item.original_name,
    overview: item.overview || 'No overview available for this title.',
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    vote_average: Number((item.vote_average || 7.0).toFixed(1)),
    vote_count: item.vote_count || 500,
    release_date: item.release_date || item.first_air_date,
    first_air_date: item.first_air_date,
    media_type,
    genre_ids: item.genre_ids || (item.genres ? item.genres.map((g: any) => g.id) : [28]),
    genres: item.genres,
    runtime: item.runtime || (item.episode_run_time ? item.episode_run_time[0] : 110),
    number_of_seasons: item.number_of_seasons,
    number_of_episodes: item.number_of_episodes,
    tagline: item.tagline,
    popularity: item.popularity || 100
  };
}

export const tmdbService = {
  // 0. Get Live Trending (All, Movies, or TV Shows) for Daily/Weekly trending
  getTrending: async (type: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'day'): Promise<MediaItem[]> => {
    const liveData = await fetchFromTMDB<{ results: any[] }>(`/trending/${type}/${timeWindow}`);
    if (liveData?.results?.length) {
      return liveData.results
        .filter(i => i.poster_path || i.backdrop_path)
        .map(i => transformTmdbItem(i, type === 'tv' ? 'tv' : 'movie'));
    }
    return CURATED_MEDIA;
  },

  // 1. Get Top 10 Ranked for Featured Carousel (matching screenshot with 1, 2, ... 6, 7)
  getTopRanked: async (): Promise<MediaItem[]> => {
    const liveData = await fetchFromTMDB<{ results: any[] }>('/trending/all/day');
    if (liveData?.results?.length) {
      return liveData.results.slice(0, 10).map(i => transformTmdbItem(i));
    }
    return CURATED_MEDIA.slice(0, 10);
  },

  // 2. Get Popular Movies
  getPopularMovies: async (): Promise<MediaItem[]> => {
    const liveData = await fetchFromTMDB<{ results: any[] }>('/movie/popular');
    if (liveData?.results?.length) {
      return liveData.results.map(i => transformTmdbItem(i, 'movie'));
    }
    return CURATED_MEDIA.filter(m => m.media_type === 'movie');
  },

  // 3. Get Trending TV Shows
  getTrendingTV: async (): Promise<MediaItem[]> => {
    const liveData = await fetchFromTMDB<{ results: any[] }>('/tv/popular');
    if (liveData?.results?.length) {
      return liveData.results.map(i => transformTmdbItem(i, 'tv'));
    }
    return CURATED_MEDIA.filter(m => m.media_type === 'tv');
  },

  // 4. Get Top Rated Movies & Shows
  getTopRated: async (type: 'movie' | 'tv' = 'movie'): Promise<MediaItem[]> => {
    const endpoint = type === 'movie' ? '/movie/top_rated' : '/tv/top_rated';
    const liveData = await fetchFromTMDB<{ results: any[] }>(endpoint);
    if (liveData?.results?.length) {
      return liveData.results.map(i => transformTmdbItem(i, type));
    }
    return CURATED_MEDIA.filter(m => m.vote_average >= 8.0);
  },

  // 5. Get Upcoming / In Theatres
  getUpcoming: async (): Promise<MediaItem[]> => {
    const liveData = await fetchFromTMDB<{ results: any[] }>('/movie/upcoming');
    if (liveData?.results?.length) {
      return liveData.results.map(i => transformTmdbItem(i, 'movie'));
    }
    return CURATED_MEDIA.slice(2, 8);
  },

  // 6. Get By Genre
  getByGenre: async (genreId: number, type: 'movie' | 'tv' = 'movie'): Promise<MediaItem[]> => {
    const endpoint = type === 'movie' ? '/discover/movie' : '/discover/tv';
    const liveData = await fetchFromTMDB<{ results: any[] }>(endpoint, { with_genres: genreId });
    if (liveData?.results?.length) {
      return liveData.results.map(i => transformTmdbItem(i, type));
    }
    return CURATED_MEDIA.filter(m => m.genre_ids.includes(genreId));
  },

  // 7. Search Multi (Movie & TV)
  search: async (query: string, type: 'all' | 'movie' | 'tv' = 'all'): Promise<MediaItem[]> => {
    if (!query.trim()) return [];
    
    let endpoint = '/search/multi';
    if (type === 'movie') endpoint = '/search/movie';
    if (type === 'tv') endpoint = '/search/tv';

    const liveData = await fetchFromTMDB<{ results: any[] }>(endpoint, { query });
    if (liveData?.results?.length) {
      return liveData.results
        .filter(i => i.media_type !== 'person' && (i.poster_path || i.backdrop_path || i.title || i.name))
        .map(i => transformTmdbItem(i, type === 'tv' ? 'tv' : 'movie'));
    }

    const qLower = query.toLowerCase();
    return CURATED_MEDIA.filter(m => {
      const titleMatch = (m.title || m.name || '').toLowerCase().includes(qLower);
      const overviewMatch = m.overview.toLowerCase().includes(qLower);
      return titleMatch || overviewMatch;
    });
  },

  // 8. Discover with Advanced Filters & Infinite Scrolling Pagination
  discover: async (
    filters: Partial<FilterOptions>,
    page: number = 1
  ): Promise<{ results: MediaItem[]; page: number; totalPages: number; totalResults: number }> => {
    const mediaType = filters.mediaType === 'tv' ? 'tv' : 'movie';
    const endpoint = mediaType === 'tv' ? '/discover/tv' : '/discover/movie';
    
    const params: Record<string, any> = {
      sort_by: filters.sortBy || 'popularity.desc',
      'vote_average.gte': filters.minRating || 0,
      page,
    };

    if (filters.genreId) {
      params.with_genres = filters.genreId;
    }
    if (filters.year) {
      if (mediaType === 'movie') {
        params.primary_release_year = filters.year;
      } else {
        params.first_air_date_year = filters.year;
      }
    }

    const liveData = await fetchFromTMDB<{ results: any[]; total_pages?: number; total_results?: number }>(endpoint, params);
    if (liveData?.results?.length) {
      const items = liveData.results.map(i => transformTmdbItem(i, mediaType));
      return {
        results: items,
        page,
        totalPages: Math.min(liveData.total_pages || 1, 50),
        totalResults: liveData.total_results || items.length,
      };
    }

    // Curated fallback filtering with pagination
    const filtered = CURATED_MEDIA.filter(m => {
      if (filters.mediaType && filters.mediaType !== 'all' && m.media_type !== filters.mediaType) return false;
      if (filters.genreId && !m.genre_ids.includes(filters.genreId)) return false;
      if (filters.minRating && m.vote_average < filters.minRating) return false;
      if (filters.year && !formatYear(m.release_date || m.first_air_date).includes(filters.year)) return false;
      return true;
    });

    const PAGE_SIZE = 12;
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const startIndex = (page - 1) * PAGE_SIZE;
    const paged = filtered.slice(startIndex, startIndex + PAGE_SIZE);

    return {
      results: paged,
      page,
      totalPages,
      totalResults: filtered.length,
    };
  },

  // 9. Get Details + Cast + Videos + Similar
  getDetails: async (id: number, type: 'movie' | 'tv' = 'movie'): Promise<MediaItem> => {
    const endpoint = `/${type}/${id}`;
    const liveData = await fetchFromTMDB<any>(endpoint, {
      append_to_response: 'videos,credits,similar,recommendations,reviews'
    });

    if (liveData) {
      const item = transformTmdbItem(liveData, type);
      
      // Extract trailer key (YouTube)
      const videos = liveData.videos?.results || [];
      const trailer = videos.find((v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')) || videos[0];
      if (trailer) {
        item.trailer_key = trailer.key;
      }

      // Extract Cast
      const credits = liveData.credits?.cast || [];
      item.cast = credits.slice(0, 20).map((c: any) => ({
        id: c.id,
        name: c.name,
        character: c.character || 'Cast Member',
        profile_path: c.profile_path
      }));

      // Extract Similar
      const similar = liveData.similar?.results || liveData.recommendations?.results || [];
      item.similar = similar.slice(0, 8).map((s: any) => transformTmdbItem(s, type));

      // Extract Reviews
      const reviews = liveData.reviews?.results || [];
      item.reviews = reviews.slice(0, 4).map((r: any) => ({
        id: r.id,
        author: r.author,
        content: r.content,
        rating: r.author_details?.rating || null,
        created_at: r.created_at
      }));

      return item;
    }

    // Fallback from curated list
    const found = CURATED_MEDIA.find(m => m.id === id);
    if (found) {
      return {
        ...found,
        similar: CURATED_MEDIA.filter(m => m.id !== id).slice(0, 6)
      };
    }

    return {
      id,
      title: 'Streaming Feature',
      name: 'Streaming Feature',
      overview: 'Enjoy high-definition cinema with stunning dynamic surround audio and HDR visual fidelity.',
      poster_path: null,
      backdrop_path: null,
      vote_average: 8.0,
      vote_count: 1200,
      media_type: type,
      genre_ids: [28, 878],
      trailer_key: 'Way9Dexny3w',
      runtime: 124,
      cast: [
        { id: 1, name: 'Lead Actor', character: 'Hero', profile_path: null }
      ]
    };
  },

  // 10. Dedicated Credits endpoint (/movie/{id}/credits or /tv/{id}/credits)
  getCredits: async (id: number, type: 'movie' | 'tv' = 'movie'): Promise<CastMember[]> => {
    const endpoint = `/${type}/${id}/credits`;
    const liveData = await fetchFromTMDB<{ cast: any[] }>(endpoint);

    if (liveData?.cast && liveData.cast.length > 0) {
      return liveData.cast.slice(0, 20).map((c: any) => ({
        id: c.id,
        name: c.name,
        character: c.character || 'Cast Member',
        profile_path: c.profile_path,
      }));
    }

    // Fallback to item cast in curated data
    const found = CURATED_MEDIA.find(m => m.id === id);
    if (found?.cast && found.cast.length > 0) {
      return found.cast;
    }

    return [
      { id: 1, name: 'Leading Performer', character: 'Main Protagonist', profile_path: null },
      { id: 2, name: 'Supporting Performer', character: 'Allied Operative', profile_path: null },
      { id: 3, name: 'Guest Star', character: 'Key Figure', profile_path: null }
    ];
  }
};
