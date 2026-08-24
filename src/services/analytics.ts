import { logEvent } from 'firebase/analytics';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth, getFirebaseAnalytics } from './firebase';
import { MediaItem } from '../types';

export interface AnalyticsEventPayload {
  eventName: string;
  mediaId?: number;
  mediaTitle?: string;
  mediaType?: 'movie' | 'tv';
  season?: number;
  episode?: number;
  searchQuery?: string;
  category?: string;
  domain?: string;
  timestamp?: string;
  [key: string]: any;
}

/**
 * Universal Analytics Dispatcher via Firebase Analytics & Firestore User Telemetry
 */
export const trackEvent = async (eventName: string, params: Record<string, any> = {}): Promise<void> => {
  const timestamp = new Date().toISOString();
  const enhancedParams = {
    ...params,
    timestamp,
    platform: 'web',
  };

  // 1. Dispatch directly to Firebase Analytics
  const analytics = getFirebaseAnalytics();
  if (analytics) {
    try {
      logEvent(analytics, eventName, enhancedParams);
    } catch (err) {
      console.warn('[Firebase Analytics] logEvent error:', err);
    }
  }

  // 2. If user is authenticated, record personal cloud telemetry in Firestore
  const currentUser = auth.currentUser;
  if (currentUser && !currentUser.isAnonymous) {
    const eventId = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    try {
      await setDoc(doc(db, 'users', currentUser.uid, 'events', eventId), {
        userId: currentUser.uid,
        eventName,
        mediaId: params.mediaId || null,
        mediaTitle: params.mediaTitle || null,
        timestamp,
        params: enhancedParams,
      });
    } catch (error) {
      console.warn('Could not write telemetry event to Firestore:', error);
    }
  }
};

/**
 * Tracks Page / Screen Transitions in Firebase Analytics
 */
export const trackPageView = (pageName: string, title?: string) => {
  trackEvent('page_view', {
    page_title: title || `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} | Popcorn Movies`,
    page_path: `/${pageName}`,
  });
  trackEvent('screen_view', {
    screen_name: pageName,
    screen_title: title || pageName,
  });
};

// Specialized Convenience Event Helpers
export const trackMediaView = (media: MediaItem) => {
  trackEvent('view_item', {
    mediaId: media.id,
    mediaTitle: media.title || media.name,
    mediaType: media.media_type || (media.first_air_date ? 'tv' : 'movie'),
    voteAverage: media.vote_average,
  });
};

export const trackStreamPlay = (media: MediaItem, season?: number, episode?: number) => {
  trackEvent('play_stream', {
    mediaId: media.id,
    mediaTitle: media.title || media.name,
    mediaType: media.media_type || (media.first_air_date ? 'tv' : 'movie'),
    season: season || 1,
    episode: episode || 1,
  });
};

export const trackTrailerPlay = (media: MediaItem) => {
  trackEvent('watch_trailer', {
    mediaId: media.id,
    mediaTitle: media.title || media.name,
    mediaType: media.media_type || (media.first_air_date ? 'tv' : 'movie'),
  });
};

export const trackSearch = (query: string, resultCount: number) => {
  trackEvent('search', {
    search_term: query,
    searchQuery: query,
    resultCount,
  });
};

export const trackWatchlistAction = (action: 'add' | 'remove', media: MediaItem) => {
  trackEvent(action === 'add' ? 'add_to_watchlist' : 'remove_from_watchlist', {
    mediaId: media.id,
    mediaTitle: media.title || media.name,
    mediaType: media.media_type || (media.first_air_date ? 'tv' : 'movie'),
  });
};
