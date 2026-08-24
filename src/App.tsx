/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { DiscoverView } from './components/DiscoverView';
import { SearchView } from './components/SearchView';
import { LibraryView } from './components/LibraryView';
import { DetailModal } from './components/DetailModal';
import { VideoPlayer } from './components/VideoPlayer';
import { SettingsModal } from './components/SettingsModal';
import { MobileDrawer } from './components/MobileDrawer';
import { ToastContainer } from './components/ToastContainer';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { getGlassTintConfig } from './utils/themeStyles';
import { AnimatePresence, motion } from 'motion/react';

const MainLayout: React.FC = () => {
  const { 
    activeTab, 
    selectedMedia, 
    setSelectedMedia, 
    activePlayerMedia, 
    setActivePlayerMedia,
    settings,
  } = useApp();
  
  const [mediaFilter, setMediaFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);

  const currentTint = getGlassTintConfig(settings.glassTint);

  const handleSelectGenreFromSidebar = (genreId: number) => {
    setSelectedGenreId(genreId);
  };

  return (
    <div 
      className="min-h-screen bg-[#050508] text-white flex flex-row transition-all duration-700 ease-in-out selection:bg-indigo-500 selection:text-white" 
      style={{ background: currentTint.radialBackground }}
    >
      {/* Desktop Responsive Glassmorphic Sidebar */}
      <Sidebar onSelectGenre={handleSelectGenreFromSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Sticky Top Header */}
        <Header mediaFilter={mediaFilter} setMediaFilter={setMediaFilter} />

        {/* View Switcher with Smooth Page Transitions */}
        <main className="flex-1 max-w-7xl w-full mx-auto pt-4 sm:pt-6 pb-28 sm:pb-32 lg:pb-12 px-2 sm:px-4">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <HomeView
                  mediaFilter={mediaFilter}
                  onSelectGenre={handleSelectGenreFromSidebar}
                />
              </motion.div>
            )}

            {activeTab === 'browse' && (
              <motion.div
                key="browse"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <DiscoverView initialGenreId={selectedGenreId} />
              </motion.div>
            )}

            {activeTab === 'search' && (
              <motion.div
                key="search"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <SearchView />
              </motion.div>
            )}

            {activeTab === 'library' && (
              <motion.div
                key="library"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <LibraryView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <BottomNav />
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <DetailModal
            media={selectedMedia}
            onClose={() => setSelectedMedia(null)}
          />
        )}
      </AnimatePresence>

      {/* Video & Cinema Stream Player */}
      <AnimatePresence>
        {activePlayerMedia && (
          <VideoPlayer
            media={activePlayerMedia}
            onClose={() => setActivePlayerMedia(null)}
          />
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <SettingsModal />

      {/* Firebase Authentication & Google Sign-In Modal */}
      <AuthModal />

      {/* User Cloud Profile & Analytics Activity Feed Modal */}
      <UserProfileModal />

      {/* Mobile Slide-Out Drawer */}
      <MobileDrawer onSelectGenre={handleSelectGenreFromSidebar} />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AuthProvider>
  );
}
