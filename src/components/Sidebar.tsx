import React, { useState, useMemo } from 'react';
import { 
  Home, 
  Compass, 
  Search, 
  Bookmark, 
  Settings, 
  Film, 
  Tv, 
  Play,
  Sparkles, 
  Download, 
  CheckCircle2, 
  ChevronRight,
  Flame,
  Radio,
  SlidersHorizontal,
  ChevronLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NavTab } from '../types';
import { GENRES } from '../services/curatedData';
import { PopcornLogo } from './PopcornLogo';
import { getGlassTintConfig } from '../utils/themeStyles';
import { getDomainBranding } from '../utils/domainBranding';

interface SidebarProps {
  onSelectGenre?: (genreId: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onSelectGenre }) => {
  const { activeTab, setActiveTab, watchlist, setIsSettingsOpen, settings } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const currentTint = getGlassTintConfig(settings.glassTint);
  const branding = useMemo(() => getDomainBranding(), []);

  const navItems = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'browse' as NavTab, label: 'Movies & Discover', icon: Compass },
    { id: 'search' as NavTab, label: 'Search', icon: Search },
    { id: 'library' as NavTab, label: 'Library & History', icon: Bookmark, badge: watchlist.length > 0 ? watchlist.length : undefined },
  ];

  const popularGenres = GENRES.slice(0, 7);
  const downloadedCount = watchlist.filter(w => w.downloaded).length;

  return (
    <aside
      className={`hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0 z-40 transition-all duration-300 border-r border-white/15 backdrop-blur-3xl bg-[#080816]/60 supports-[backdrop-filter]:bg-[#080816]/45 shadow-[inset_-1px_0_1px_rgba(255,255,255,0.15)] select-none ${
        collapsed ? 'w-20 p-3' : 'w-64 p-5'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between mb-8 px-1">
        {!collapsed ? (
          <PopcornLogo
            size="md"
            subtitleText="FROSTED CINEMA"
            onClick={() => setActiveTab('home')}
          />
        ) : (
          <div 
            onClick={() => setActiveTab('home')}
            className={`w-10 h-10 mx-auto rounded-2xl bg-gradient-to-br ${branding.accentGradient} flex items-center justify-center text-white cursor-pointer shadow-lg hover:scale-105 transition-transform overflow-hidden`}
            title={`${branding.brandName} Cinema`}
          >
            {branding.logoType === 'flixhq' ? (
              <Play className="w-5 h-5 text-white fill-white ml-0.5 drop-shadow" />
            ) : branding.logoType === 'cinejoy' ? (
              <Film className="w-5 h-5 text-white drop-shadow" />
            ) : branding.logoType === 'bingebox' ? (
              <Tv className="w-5 h-5 text-white drop-shadow" />
            ) : (
              /* Popcorn SVG */
              <svg className="w-6 h-6 text-white" viewBox="0 0 32 32" fill="none">
                <circle cx="11" cy="9" r="3" fill="#FEF08A" />
                <circle cx="16" cy="7" r="3.5" fill="#FFFBEB" />
                <circle cx="21" cy="9" r="3" fill="#FEF08A" />
                <circle cx="13.5" cy="11.5" r="2.8" fill="#F59E0B" />
                <circle cx="18.5" cy="11.5" r="2.8" fill="#F59E0B" />
                <path d="M8 14.5L10 27C10.2 28.2 11.2 29 12.5 29H19.5C20.8 29 21.8 28.2 22 27L24 14.5H8Z" fill="#DC2626" />
                <path d="M14.5 14.5L14.7 29H17.3L17.5 14.5H14.5Z" fill="#FFFFFF" />
                <rect x="7" y="13.5" width="18" height="2" rx="1" fill="#F8FAFC" />
              </svg>
            )}
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors ${
            collapsed ? 'hidden' : 'block'
          }`}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto space-y-6 scrollbar-none">
        {/* Main Menu */}
        <div>
          {!collapsed && (
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-3 px-2">
              Menu
            </div>
          )}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 p-3 rounded-xl font-medium text-sm transition-all relative group cursor-pointer ${
                    isActive
                      ? 'bg-white/10 rounded-xl border border-white/15 shadow-sm text-white font-semibold'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  } ${collapsed ? 'justify-center p-2.5' : ''}`}
                  title={item.label}
                >
                  <Icon 
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      isActive ? 'scale-110' : 'text-white/60 group-hover:text-white'
                    }`}
                    style={{ color: isActive ? currentTint.ambientGlow : undefined }}
                  />
                  
                  {!collapsed && (
                    <span className="flex-1 text-left">{item.label}</span>
                  )}

                  {!collapsed && item.badge !== undefined && (
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${currentTint.badgeClass}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Genres Section */}
        {!collapsed && (
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">
                Categories
              </div>
              <button
                onClick={() => setActiveTab('browse')}
                className="text-[11px] text-indigo-400 hover:underline font-semibold"
              >
                All
              </button>
            </div>
            <div className="space-y-0.5">
              {popularGenres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => {
                    if (onSelectGenre) onSelectGenre(genre.id);
                    setActiveTab('browse');
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 group-hover:bg-indigo-400 transition-colors" />
                    {genre.name}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Upgrade Pro Frosted Card matching Design HTML */}
        {!collapsed && (
          <div className="p-4 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-2xl border border-white/10 backdrop-blur-md">
            <p className="text-xs font-semibold mb-1 text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Upgrade to Premium
            </p>
            <p className="text-[10px] text-white/60 mb-3 leading-relaxed">
              Enjoy 4K HDR streaming & offline trailer downloads.
            </p>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="w-full py-2 bg-white hover:bg-white/90 active:scale-95 text-black text-xs font-bold rounded-lg shadow-lg transition-all"
            >
              Go Pro
            </button>
          </div>
        )}
      </div>

      {/* Footer Settings & Status */}
      <div className="pt-3 border-t border-white/10">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors ${
            collapsed ? 'justify-center p-2' : ''
          }`}
          title="App Settings & TMDB API"
        >
          <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
          {!collapsed && (
            <div className="flex-1 text-left">
              <span className="text-xs font-medium block text-white/90">Settings & API</span>
              <span className="text-[10px] text-white/40 block">TMDB Live Sync</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
