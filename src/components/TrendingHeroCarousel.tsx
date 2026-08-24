import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Info, 
  Plus, 
  Check, 
  Heart, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Star, 
  Clock, 
  Calendar, 
  Film, 
  Tv, 
  Sparkles 
} from 'lucide-react';
import { MediaItem } from '../types';
import { getBackdropUrl, getImageUrl, formatYear, formatDuration, getGenreNames } from '../services/tmdb';
import { useApp } from '../context/AppContext';
import { RatingRing } from './RatingRing';
import { triggerHaptic } from '../utils/haptics';

interface TrendingHeroCarouselProps {
  items: MediaItem[];
}

export const TrendingHeroCarousel: React.FC<TrendingHeroCarouselProps> = ({ items }) => {
  const { 
    setActivePlayerMedia, 
    setSelectedMedia, 
    toggleWatchlist, 
    isInWatchlist, 
    watchlist,
    toggleFavorite 
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  // Take top 8 trending items for the carousel
  const carouselItems = items.slice(0, 8);
  const activeItem = carouselItems[currentIndex] || carouselItems[0];

  // Auto-advance slides every 7 seconds when not paused by user
  useEffect(() => {
    if (carouselItems.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [carouselItems.length, isPaused]);

  if (!activeItem) return null;

  const inWatchlist = isInWatchlist(activeItem.id);
  const watchlistItem = watchlist.find(w => w.id === activeItem.id);
  const isFavorite = watchlistItem?.isFavorite || false;

  const handlePrev = () => {
    triggerHaptic('light');
    setCurrentIndex((prev) => (prev === 0 ? carouselItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    triggerHaptic('light');
    setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
  };

  const handleSlideSelect = (idx: number) => {
    triggerHaptic('selection');
    setCurrentIndex(idx);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
  };

  const title = activeItem.title || activeItem.name || 'Featured Title';
  const year = formatYear(activeItem.release_date || activeItem.first_air_date);
  const genres = getGenreNames(activeItem.genre_ids).slice(0, 3);
  const rating = activeItem.vote_average ? activeItem.vote_average.toFixed(1) : '7.8';

  return (
    <div 
      className="relative w-full px-4 sm:px-6 pt-2 pb-4 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main Glassmorphic Hero Stage */}
      <div className="relative w-full min-h-[440px] sm:min-h-[500px] lg:min-h-[540px] rounded-3xl sm:rounded-[32px] overflow-hidden border border-white/15 shadow-[0_30px_90px_rgba(0,0,0,0.85)] bg-[#07070b] flex flex-col justify-end">
        
        {/* Dynamic High-Res Backdrop Image with Smooth Fade */}
        <div className="absolute inset-0 z-0">
          <img
            key={activeItem.id}
            src={getBackdropUrl(activeItem.backdrop_path, 'original')}
            alt={title}
            className="w-full h-full object-cover filter brightness-[0.8] contrast-[1.08] transition-all duration-700 ease-out transform scale-105"
          />
          {/* Layered Cinematic Vignettes & Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#07070b] via-[#07070b]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07070b]/90 via-[#07070b]/40 to-transparent" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/30 to-black/80" />
        </div>

        {/* Top Header Badge & Navigation Controls Row */}
        <div className="absolute top-4 sm:top-6 left-4 sm:left-8 right-4 sm:right-8 z-20 flex items-center justify-between pointer-events-none">
          {/* Glowing Trending Badge */}
          <div className="pointer-events-auto flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-xl border border-amber-500/30 text-amber-400 text-xs font-extrabold tracking-wide shadow-lg shadow-amber-500/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <Flame className="w-3.5 h-3.5 fill-current text-amber-400" />
            <span className="uppercase tracking-wider">Trending Now</span>
            <span className="text-white/40">•</span>
            <span className="text-white/90">#{currentIndex + 1} Today</span>
          </div>

          {/* Carousel Arrow Controls */}
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={handlePrev}
              type="button"
              className="p-2.5 sm:p-3 rounded-full bg-black/50 hover:bg-white/20 text-white/80 hover:text-white border border-white/15 backdrop-blur-xl transition-all active:scale-90 cursor-pointer shadow-xl"
              title="Previous Slide"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleNext}
              type="button"
              className="p-2.5 sm:p-3 rounded-full bg-black/50 hover:bg-white/20 text-white/80 hover:text-white border border-white/15 backdrop-blur-xl transition-all active:scale-90 cursor-pointer shadow-xl"
              title="Next Slide"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Hero Content Area with Glassmorphism */}
        <div className="relative z-10 p-5 sm:p-8 lg:p-10 max-w-4xl space-y-4">
          
          {/* Glassmorphic Metadata Pill Group */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-white/80">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 font-bold text-amber-400 shadow-sm">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{rating}</span>
            </div>

            <span className="px-2.5 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 font-medium text-white/90">
              {activeItem.media_type === 'tv' ? 'TV Series' : 'Movie'}
            </span>

            {year && (
              <span className="px-2.5 py-1 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-white/70">
                {year}
              </span>
            )}

            {activeItem.runtime && activeItem.runtime > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-white/70">
                <Clock className="w-3 h-3 text-amber-400" />
                {formatDuration(activeItem.runtime)}
              </span>
            )}

            {genres.map((g) => (
              <span
                key={g}
                className="hidden md:inline-block px-2.5 py-1 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-white/60"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Hero Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] line-clamp-2">
            {title}
          </h1>

          {/* Overview Plot Excerpt */}
          <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-2xl drop-shadow-md">
            {activeItem.overview}
          </p>

          {/* Glass Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Primary Watch / Stream Button */}
            <button
              onClick={() => {
                triggerHaptic('medium');
                setActivePlayerMedia(activeItem);
              }}
              type="button"
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white text-xs sm:text-sm font-extrabold shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transform hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>WATCH NOW</span>
            </button>

            {/* Details & Info Button */}
            <button
              onClick={() => {
                triggerHaptic('light');
                setSelectedMedia(activeItem);
              }}
              type="button"
              className="flex items-center gap-2 px-4 sm:px-5 py-3 rounded-2xl bg-black/50 hover:bg-white/20 text-white text-xs sm:text-sm font-bold border border-white/20 backdrop-blur-xl shadow-lg hover:border-white/40 active:scale-95 transition-all cursor-pointer"
            >
              <Info className="w-4 h-4 text-amber-400" />
              <span>Details</span>
            </button>

            {/* Watchlist Quick Toggle Button */}
            <button
              onClick={() => {
                triggerHaptic('success');
                toggleWatchlist(activeItem);
              }}
              type="button"
              className={`p-3 rounded-2xl border backdrop-blur-xl transition-all active:scale-95 cursor-pointer shadow-lg ${
                inWatchlist
                  ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40'
                  : 'bg-black/50 hover:bg-white/20 text-white/80 hover:text-white border-white/20'
              }`}
              title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              aria-label="Toggle Watchlist"
            >
              {inWatchlist ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
            </button>

            {/* Favorite Button */}
            <button
              onClick={() => {
                triggerHaptic('medium');
                toggleFavorite(activeItem.id);
              }}
              type="button"
              className={`p-3 rounded-2xl border backdrop-blur-xl transition-all active:scale-95 cursor-pointer shadow-lg ${
                isFavorite
                  ? 'bg-rose-500/25 text-rose-400 border-rose-500/40 shadow-rose-500/20'
                  : 'bg-black/50 hover:bg-white/20 text-white/80 hover:text-white border-white/20'
              }`}
              title={isFavorite ? 'Favorited' : 'Favorite'}
              aria-label="Toggle Favorite"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Bottom Slide Indicators / Mini Thumbnail Strip */}
        <div className="relative z-10 px-5 sm:px-8 pb-4 pt-2 flex items-center justify-between border-t border-white/10 bg-black/40 backdrop-blur-md">
          {/* Progress Indicators */}
          <div className="flex items-center gap-1.5">
            {carouselItems.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSlideSelect(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === idx
                    ? 'w-7 sm:w-10 bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]'
                    : 'w-2 sm:w-3 bg-white/20 hover:bg-white/40'
                }`}
                title={`Slide ${idx + 1}: ${item.title || item.name}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Mini Thumbnail Strip (Desktop) */}
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {carouselItems.map((item, idx) => {
              const isSelected = currentIndex === idx;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSlideSelect(idx)}
                  className={`relative w-12 h-7 rounded-lg overflow-hidden border transition-all cursor-pointer flex-shrink-0 ${
                    isSelected
                      ? 'border-amber-400 scale-110 shadow-[0_0_12px_rgba(245,158,11,0.6)] ring-1 ring-amber-400'
                      : 'border-white/10 opacity-50 hover:opacity-100 hover:border-white/30'
                  }`}
                  title={item.title || item.name}
                >
                  <img
                    src={getImageUrl(item.poster_path, 'w200')}
                    alt={item.title || item.name}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-amber-500/20" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
