import { 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  Unsubscribe 
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from './firebase';
import { MediaItem, WatchlistItem, AppSettings } from '../types';

export interface UserProfileData {
  userId: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CloudHistoryItem {
  id?: string;
  userId: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  season: number;
  episode: number;
  lastWatchedAt: string;
}

export interface CloudAnalyticsEvent {
  id: string;
  eventName: string;
  mediaId?: number;
  mediaTitle?: string;
  timestamp: string;
  params?: Record<string, any>;
}

/**
 * Upserts User Profile to Cloud Firestore on Login
 */
export async function syncUserProfile(user: User): Promise<void> {
  const path = `users/${user.uid}`;
  try {
    const userRef = doc(db, 'users', user.uid);
    const existingSnap = await getDoc(userRef);

    const profileData: UserProfileData = {
      userId: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'Popcorn Moviegoer',
      photoURL: user.photoURL || '',
      createdAt: existingSnap.exists() ? existingSnap.data()?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(userRef, profileData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Subscribes to real-time Cloud Watchlist for a user
 */
export function subscribeCloudWatchlist(
  userId: string, 
  onUpdate: (items: WatchlistItem[]) => void
): Unsubscribe {
  const path = `users/${userId}/watchlist`;
  const q = query(collection(db, 'users', userId, 'watchlist'), orderBy('addedAt', 'desc'));
  
  return onSnapshot(
    q,
    (snapshot) => {
      const items: WatchlistItem[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        const media: MediaItem = {
          id: d.mediaId,
          title: d.title,
          name: d.title,
          overview: d.overview || '',
          poster_path: d.posterPath,
          backdrop_path: d.backdropPath,
          vote_average: d.voteAverage || 0,
          vote_count: d.voteCount || 0,
          release_date: d.releaseDate,
          first_air_date: d.releaseDate,
          media_type: d.mediaType || 'movie',
          genre_ids: d.genreIds || [],
        };

        return {
          id: d.mediaId,
          item: media,
          addedAt: typeof d.addedAt === 'number' ? d.addedAt : Date.now(),
          watched: Boolean(d.watched || d.isWatched),
          isFavorite: Boolean(d.isFavorite),
          progress: d.progress || 0,
          downloaded: Boolean(d.downloaded),
        };
      });
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Saves a WatchlistItem to Cloud Firestore
 */
export async function saveCloudWatchlistItem(userId: string, item: WatchlistItem): Promise<void> {
  const docId = String(item.id);
  const path = `users/${userId}/watchlist/${docId}`;
  const media = item.item;
  try {
    await setDoc(doc(db, 'users', userId, 'watchlist', docId), {
      userId,
      mediaId: item.id,
      mediaType: media?.media_type || (media?.first_air_date ? 'tv' : 'movie'),
      title: media?.title || media?.name || 'Untitled',
      overview: media?.overview || '',
      posterPath: media?.poster_path || null,
      backdropPath: media?.backdrop_path || null,
      voteAverage: media?.vote_average || 0,
      releaseDate: media?.release_date || media?.first_air_date || '',
      isFavorite: Boolean(item.isFavorite),
      watched: Boolean(item.watched),
      progress: item.progress || 0,
      downloaded: Boolean(item.downloaded),
      addedAt: item.addedAt || Date.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes a WatchlistItem from Cloud Firestore
 */
export async function removeCloudWatchlistItem(userId: string, mediaId: number): Promise<void> {
  const docId = String(mediaId);
  const path = `users/${userId}/watchlist/${docId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'watchlist', docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Saves a playback history entry to Cloud Firestore
 */
export async function saveCloudHistoryItem(
  userId: string,
  media: MediaItem,
  season: number = 1,
  episode: number = 1
): Promise<void> {
  const docId = String(media.id);
  const path = `users/${userId}/history/${docId}`;
  try {
    await setDoc(doc(db, 'users', userId, 'history', docId), {
      userId,
      mediaId: media.id,
      mediaType: media.media_type || (media.first_air_date ? 'tv' : 'movie'),
      title: media.title || media.name || 'Untitled',
      posterPath: media.poster_path || null,
      backdropPath: media.backdrop_path || null,
      season,
      episode,
      lastWatchedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Subscribes to recent viewing history
 */
export function subscribeCloudHistory(
  userId: string,
  onUpdate: (items: CloudHistoryItem[]) => void
): Unsubscribe {
  const path = `users/${userId}/history`;
  const q = query(collection(db, 'users', userId, 'history'), orderBy('lastWatchedAt', 'desc'), limit(15));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: CloudHistoryItem[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<CloudHistoryItem, 'id'>),
      }));
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Subscribes to user analytics telemetry event log for personal insights
 */
export function subscribeCloudAnalytics(
  userId: string,
  onUpdate: (events: CloudAnalyticsEvent[]) => void
): Unsubscribe {
  const path = `users/${userId}/events`;
  const q = query(collection(db, 'users', userId, 'events'), orderBy('timestamp', 'desc'), limit(25));

  return onSnapshot(
    q,
    (snapshot) => {
      const events: CloudAnalyticsEvent[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<CloudAnalyticsEvent, 'id'>),
      }));
      onUpdate(events);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Saves User Settings to Cloud Firestore
 */
export async function saveCloudSettings(userId: string, settings: AppSettings): Promise<void> {
  const path = `users/${userId}/settings/prefs`;
  try {
    await setDoc(doc(db, 'users', userId, 'settings', 'prefs'), {
      userId,
      accentColor: settings.accentColor,
      glassTint: settings.glassTint || 'violet',
      autoPlayTrailers: settings.autoPlayTrailers !== false,
      autoplayNextEpisode: settings.autoplayNextEpisode !== false,
      autoplayStream: settings.autoplayStream !== false,
      playerLanguage: settings.playerLanguage || 'en',
      streamQuality: settings.streamQuality || '1080p',
      ambientLightEnabled: settings.ambientLightEnabled !== false,
      ambientIntensity: settings.ambientIntensity || 'normal',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetches user settings from Cloud Firestore
 */
export async function fetchCloudSettings(userId: string): Promise<Partial<AppSettings> | null> {
  const path = `users/${userId}/settings/prefs`;
  try {
    const snap = await getDoc(doc(db, 'users', userId, 'settings', 'prefs'));
    if (snap.exists()) {
      return snap.data() as Partial<AppSettings>;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}
