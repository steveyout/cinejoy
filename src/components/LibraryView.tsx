import React, { useState } from 'react';
import { Bookmark, Heart, CheckCircle2, Download, Film, Sparkles, Play, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MovieCard } from './MovieCard';
import { triggerHaptic } from '../utils/haptics';

export const LibraryView: React.FC = () => {
  const { watchlist, setActiveTab, removeFromWatchlist, setActivePlayerMedia } = useApp();
  const [filterType, setFilterType] = useState<'all' | 'watchlist' | 'favorites' | 'watched' | 'downloaded'>('all');

  const favoritesCount = watchlist.filter((w) => w.isFavorite).length;
  const watchedCount = watchlist.filter((w) => w.watched).length;
  const downloadedCount = watchlist.filter((w) => w.downloaded).length;

  const handleFilterChange = (type: 'all' | 'watchlist' | 'favorites' | 'watched' | 'downloaded') => {
    triggerHaptic('light');
    setFilterType(type);
  };

  const filteredList = watchlist.filter((w) => {
    if (filterType === 'favorites') return w.isFavorite;
    if (filterType === 'watched') return w.watched;
    if (filterType === 'downloaded') return w.downloaded;
    if (filterType === 'watchlist') return !w.watched;
    return true;
  });

  return (
    <div className="w-full px-4 sm:px-6 pb-24 lg:pb-12 space-y-6">
      {/* Header */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Bookmark className="w-6 h-6 text-indigo-400 fill-indigo-400" />
            <span>My Cinema Library</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            {watchlist.length} saved titles across your personal collections
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <button
          onClick={() => handleFilterChange('all')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border backdrop-blur-md cursor-pointer ${
            filterType === 'all'
              ? 'bg-white text-black border-white font-bold shadow-md'
              : 'bg-white/5 text-white/60 hover:text-white border-white/10'
          }`}
        >
          <span>All Saved</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-bold">
            {watchlist.length}
          </span>
        </button>

        <button
          onClick={() => handleFilterChange('watchlist')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border backdrop-blur-md cursor-pointer ${
            filterType === 'watchlist'
              ? 'bg-white text-black border-white font-bold shadow-md'
              : 'bg-white/5 text-white/60 hover:text-white border-white/10'
          }`}
        >
          <span>Watchlist</span>
        </button>

        <button
          onClick={() => handleFilterChange('favorites')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border backdrop-blur-md cursor-pointer ${
            filterType === 'favorites'
              ? 'bg-rose-500/80 text-white border-rose-400 font-bold shadow-md'
              : 'bg-white/5 text-white/60 hover:text-white border-white/10'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Favorites ({favoritesCount})</span>
        </button>

        <button
          onClick={() => handleFilterChange('downloaded')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border backdrop-blur-md cursor-pointer ${
            filterType === 'downloaded'
              ? 'bg-indigo-600 text-white border-indigo-500 font-bold shadow-md'
              : 'bg-white/5 text-white/60 hover:text-white border-white/10'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Offline Ready ({downloadedCount})</span>
        </button>

        <button
          onClick={() => handleFilterChange('watched')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border backdrop-blur-md cursor-pointer ${
            filterType === 'watched'
              ? 'bg-white text-black border-white font-bold shadow-md'
              : 'bg-white/5 text-white/60 hover:text-white border-white/10'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Watched ({watchedCount})</span>
        </button>
      </div>

      {/* Grid or Empty state */}
      {filteredList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
          {filteredList.map((entry) => (
            <div key={entry.id} className="relative group">
              <MovieCard item={entry.item} size="md" className="w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white/5 border border-white/10 space-y-4 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Your library is currently empty</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto">
            Tap the <span className="text-indigo-400 font-bold">+</span> button on any movie or TV series card to save it to your personal watchlist.
          </p>
          <button
            onClick={() => setActiveTab('home')}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-white/90 text-black font-bold text-xs transition-all shadow-lg"
          >
            Explore Trending Movies
          </button>
        </div>
      )}
    </div>
  );
};
