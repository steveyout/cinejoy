import React from 'react';
import { 
  X, 
  Home, 
  Compass, 
  Search, 
  Bookmark, 
  SlidersHorizontal, 
  Sparkles, 
  Film, 
  Tv, 
  ChevronRight, 
  Download, 
  ShieldCheck,
  User as UserIcon,
  Cloud
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { NavTab } from '../types';
import { GENRES } from '../services/curatedData';
import { PopcornLogo } from './PopcornLogo';

interface MobileDrawerProps {
  onSelectGenre: (genreId: number) => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ onSelectGenre }) => {
  const { isDrawerOpen, setIsDrawerOpen, activeTab, setActiveTab, setIsSettingsOpen, watchlist } = useApp();
  const { user, setIsAuthModalOpen, setIsProfileModalOpen } = useAuth();

  if (!isDrawerOpen) return null;

  const navItems = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'browse' as NavTab, label: 'Discover & Genres', icon: Compass },
    { id: 'search' as NavTab, label: 'Search Media', icon: Search },
    { id: 'library' as NavTab, label: 'My Library', icon: Bookmark, badge: watchlist.length > 0 ? watchlist.length : undefined },
  ];

  const handleNavClick = (tab: NavTab) => {
    setActiveTab(tab);
    setIsDrawerOpen(false);
  };

  const handleGenreClick = (genreId: number) => {
    onSelectGenre(genreId);
    setActiveTab('browse');
    setIsDrawerOpen(false);
  };

  return (
    <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Drawer Body with Frosted Glassmorphism */}
      <div className="absolute inset-y-0 left-0 w-4/5 max-w-xs backdrop-blur-3xl bg-[#080816]/85 supports-[backdrop-filter]:bg-[#080816]/75 border-r border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_20px_60px_rgba(0,0,0,0.95)] flex flex-col p-5 text-slate-100 z-10 animate-in slide-in-from-left duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <PopcornLogo
            size="sm"
            subtitleText="MOVIES & TV"
            onClick={() => handleNavClick('home')}
          />

          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 scrollbar-none">
          <div className="space-y-1">
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Navigation
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-cyan-500/20 text-cyan-400">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Genres */}
          <div className="space-y-1">
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Popular Genres
            </p>
            {GENRES.slice(0, 8).map((genre) => (
              <button
                key={genre.id}
                onClick={() => handleGenreClick(genre.id)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5"
              >
                <span>{genre.name}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              </button>
            ))}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="pt-3 border-t border-white/10 space-y-2">
          {user ? (
            <button
              onClick={() => {
                setIsProfileModalOpen(true);
                setIsDrawerOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white"
            >
              <div className="flex items-center gap-2.5">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} referrerPolicy="no-referrer" className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-indigo-500 text-[10px] font-bold flex items-center justify-center text-white">
                    {user.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <span className="line-clamp-1">{user.displayName || user.email}</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400" title="Cloud Synced" />
            </button>
          ) : (
            <button
              onClick={() => {
                setIsAuthModalOpen(true);
                setIsDrawerOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In with Google</span>
            </button>
          )}

          <button
            onClick={() => {
              setIsSettingsOpen(true);
              setIsDrawerOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5"
          >
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <span>Settings & TMDB Keys</span>
          </button>
        </div>
      </div>
    </div>
  );
};
