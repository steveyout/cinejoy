'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/src/context/AppContext';
import { tmdbService } from '@/src/services/tmdb';
import { MediaItem } from '@/src/types';
import { DetailModal } from '@/src/components/DetailModal';
import { Header } from '@/src/components/Header';
import { BottomNav } from '@/src/components/BottomNav';
import { Sidebar } from '@/src/components/Sidebar';
import { ToastContainer } from '@/src/components/ToastContainer';
import { SettingsModal } from '@/src/components/SettingsModal';
import { AuthModal } from '@/src/components/AuthModal';
import { UserProfileModal } from '@/src/components/UserProfileModal';
import { VideoPlayer } from '@/src/components/VideoPlayer';
import { getGlassTintConfig } from '@/src/utils/themeStyles';
import { extractIdFromSlug } from '@/src/utils/slug';
import { AnimatePresence, motion } from 'motion/react';

export default function MovieDetailClient({ initialMedia }: { initialMedia: MediaItem }) {
  const router = useRouter();
  const { settings, setSelectedMedia, activePlayerMedia, setActivePlayerMedia } = useApp();
  const [media, setMedia] = useState<MediaItem | null>(initialMedia);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaFilter, setMediaFilter] = useState<'all' | 'movie' | 'tv'>('all');

  // Extract ID from slug (handles both "title-12345" and "12345" formats)
  const mediaId = initialMedia.id;

  const currentTint = getGlassTintConfig(settings.glassTint);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        if (initialMedia) {
          return;
        }
        setLoading(true);
        setError(null);
        if (isNaN(mediaId) || mediaId === 0) {
          setError('Invalid movie ID');
          return;
        }
        
        const details = await tmdbService.getDetails(mediaId, 'movie');
        if (details) {
          setMedia(details);
        } else {
          setError('Movie not found');
        }
      } catch (err) {
        console.error('Error fetching movie details:', err);
        setError('Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [initialMedia, mediaId]);

  const handleClose = () => {
    setSelectedMedia(null);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex flex-row" style={{ background: currentTint.radialBackground }}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          <Header mediaFilter={mediaFilter} setMediaFilter={setMediaFilter} />
          <main className="flex-1 max-w-7xl w-full mx-auto pt-4 sm:pt-6 pb-28 sm:pb-32 lg:pb-12 px-2 sm:px-4">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
                <p className="mt-4 text-white/60">Loading movie details...</p>
              </div>
            </div>
          </main>
          <BottomNav />
        </div>
        <ToastContainer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex flex-row" style={{ background: currentTint.radialBackground }}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          <Header mediaFilter={mediaFilter} setMediaFilter={setMediaFilter} />
          <main className="flex-1 max-w-7xl w-full mx-auto pt-4 sm:pt-6 pb-28 sm:pb-32 lg:pb-12 px-2 sm:px-4">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-red-500">Error</h2>
                <p className="mt-4 text-white/60">{error}</p>
                <button 
                  onClick={() => router.push('/')}
                  className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </main>
          <BottomNav />
        </div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-row" style={{ background: currentTint.radialBackground }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header mediaFilter={mediaFilter} setMediaFilter={setMediaFilter} />
        <main className="flex-1 max-w-7xl w-full mx-auto pt-4 sm:pt-6 pb-28 sm:pb-32 lg:pb-12 px-2 sm:px-4">
          {media && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <DetailModal
                media={media}
                onClose={handleClose}
              />
            </motion.div>
          )}
        </main>
        <BottomNav />
      </div>
      
      <AnimatePresence>
        {activePlayerMedia && (
          <VideoPlayer
            media={activePlayerMedia}
            onClose={() => setActivePlayerMedia(null)}
          />
        )}
      </AnimatePresence>

      <SettingsModal />
      <AuthModal />
      <UserProfileModal />
      <ToastContainer />
    </div>
  );
}