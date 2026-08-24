import React from 'react';
import { Menu, Search, SlidersHorizontal, Bell, Film, Tv, Sparkles, User as UserIcon, Cloud } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { PopcornLogo } from './PopcornLogo';
import { triggerHaptic } from '../utils/haptics';

interface HeaderProps {
  mediaFilter: 'all' | 'movie' | 'tv';
  setMediaFilter: (type: 'all' | 'movie' | 'tv') => void;
}

export const Header: React.FC<HeaderProps> = ({ mediaFilter, setMediaFilter }) => {
  const { setActiveTab, setIsDrawerOpen, setIsSettingsOpen, watchlist } = useApp();
  const { user, setIsAuthModalOpen, setIsProfileModalOpen } = useAuth();

  const handleProfileClick = () => {
    triggerHaptic('light');
    if (user) {
      setIsProfileModalOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-2xl bg-[#050508]/60 supports-[backdrop-filter]:bg-[#050508]/45 border-b border-white/12 shadow-[0_4px_30px_rgba(0,0,0,0.4)] transition-all">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4 overflow-hidden sm:overflow-visible">
        {/* Left: Mobile Drawer Trigger & Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-5 min-w-0 flex-shrink-1">
          <button
            id="mobile-menu-trigger"
            onClick={() => setIsDrawerOpen(true)}
            className="lg:hidden p-2 sm:p-2.5 rounded-xl text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 transition-all flex-shrink-0"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Logo with Popcorn Icon & Glowing Accents */}
          <div className="min-w-0 flex-shrink-1">
            <PopcornLogo
              size="md"
              subtitleText={mediaFilter === 'movie' ? 'MOVIES' : mediaFilter === 'tv' ? 'TV SERIES' : 'CINEMA STREAM'}
              onClick={() => setActiveTab('home')}
            />
          </div>

          {/* Desktop Media Type Filter Header Tabs */}
          <div className="hidden md:flex items-center gap-5 ml-2 flex-shrink-0">
            <button
              onClick={() => setMediaFilter('all')}
              className={`text-sm font-semibold transition-colors pb-1 border-b-2 ${
                mediaFilter === 'all'
                  ? 'text-white border-indigo-500'
                  : 'text-white/40 hover:text-white border-transparent'
              }`}
            >
              Featured
            </button>
            <button
              onClick={() => setMediaFilter('movie')}
              className={`text-sm font-semibold transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
                mediaFilter === 'movie'
                  ? 'text-white border-indigo-500'
                  : 'text-white/40 hover:text-white border-transparent'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              Movies
            </button>
            <button
              onClick={() => setMediaFilter('tv')}
              className={`text-sm font-semibold transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
                mediaFilter === 'tv'
                  ? 'text-white border-indigo-500'
                  : 'text-white/40 hover:text-white border-transparent'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              Series
            </button>
          </div>
        </div>

        {/* Right: Frosted Search Pill, Settings & Sign In Profile Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          {/* Search Pill Button - Compact Icon on Mobile, Pill on Tablet/Desktop */}
          <button
            id="header-search-pill"
            onClick={() => setActiveTab('search')}
            className="flex items-center gap-2 p-2 sm:px-3.5 sm:py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/60 hover:text-white transition-all text-xs sm:text-sm backdrop-blur-md shadow-sm group flex-shrink-0"
            aria-label="Search"
            title="Search Movies & Shows"
          >
            <Search className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline font-medium">Search</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white/10 text-white/60 rounded border border-white/10 ml-1">
              ⌘K
            </kbd>
          </button>

          {/* Quick Settings Icon */}
          <button
            id="settings-pill-button"
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 sm:p-2.5 rounded-xl sm:rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all shadow-sm flex-shrink-0"
            title="App Settings & TMDB API"
            aria-label="Settings"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Watchlist Counter Shortcut */}
          <button
            onClick={() => setActiveTab('library')}
            className="relative hidden md:flex p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all shadow-sm flex-shrink-0"
            title="My Library"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            {watchlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shadow-md shadow-indigo-600/40">
                {watchlist.length}
              </span>
            )}
          </button>

          {/* Firebase User Profile Avatar / Sign In button */}
          {user ? (
            <button
              type="button"
              id="header-user-profile-btn"
              onClick={handleProfileClick}
              className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-indigo-500 p-0.5 cursor-pointer hover:scale-105 transition-transform flex-shrink-0"
              title={`${user.displayName || user.email} (Cloud Synced)`}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full rounded-full object-cover shadow-sm"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              {/* Green live cloud sync indicator */}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#050508]" title="Cloud Firestore Synced" />
            </button>
          ) : (
            <button
              type="button"
              id="header-sign-in-btn"
              onClick={handleProfileClick}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer flex-shrink-0 whitespace-nowrap"
            >
              <UserIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
