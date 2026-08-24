import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Check, Play, Info } from 'lucide-react';
import { MediaItem } from '../types';
import { getImageUrl, formatYear } from '../services/tmdb';
import { useApp } from '../context/AppContext';
import { RatingRing } from './RatingRing';

interface MovieCardProps {
  item: MediaItem;
  rank?: number;
  featured?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MovieCard: React.FC<MovieCardProps> = ({
  item,
  rank,
  featured = false,
  className = '',
  size = 'md',
}) => {
  const { setSelectedMedia, setActivePlayerMedia, toggleWatchlist, isInWatchlist } = useApp();
  const inWatchlist = isInWatchlist(item.id);

  const title = item.title || item.name || 'Untitled';
  const year = formatYear(item.release_date || item.first_air_date);
  const typeLabel = item.media_type === 'tv' ? 'TV' : 'MOVIE';
  const rating = item.vote_average ? item.vote_average.toFixed(1) : '7.0';

  const cardWidthClass = {
    sm: 'w-[140px] sm:w-[155px]',
    md: 'w-[155px] sm:w-[175px] md:w-[190px]',
    lg: 'w-[180px] sm:w-[210px] md:w-[230px]',
  }[size];

  return (
    <motion.div
      id={`movie-card-${item.id}`}
      whileHover={{ y: -7, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
      className={`group relative flex-shrink-0 flex flex-col cursor-pointer select-none ${cardWidthClass} ${className}`}
      onClick={() => setSelectedMedia(item)}
    >
      {/* Poster Image Container with Glassmorphic Glow & Scale */}
      <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-lg shadow-black/60 transition-all duration-300 ease-out group-hover:border-amber-400/40 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.25),0_14px_32px_rgba(0,0,0,0.85)]">
        {/* Soft Ambient Radial Backlight on Hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/0 via-amber-400/0 to-amber-300/0 group-hover:from-amber-500/10 group-hover:via-transparent group-hover:to-rose-500/10 transition-all duration-500 pointer-events-none z-10" />

        {/* Diagonal Light Sheen Glaze on Hover */}
        <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -rotate-45 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out pointer-events-none z-10" />

        <img
          src={getImageUrl(item.poster_path, 'w500')}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Subtle Vignette & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508]/95 via-transparent to-[#050508]/30 pointer-events-none z-10" />

        {/* Top-Right Glassmorphic Circular Progress Ring */}
        <div className="absolute top-2.5 right-2.5 z-20 transform transition-transform duration-300 group-hover:scale-105">
          <RatingRing
            rating={item.vote_average || 7.0}
            size={size === 'sm' ? 'sm' : 'md'}
          />
        </div>

        {/* Ranking Number (Top 10 Chart Overlay) */}
        {rank !== undefined && (
          <div className="absolute bottom-1 left-2 z-10 pointer-events-none font-black tracking-tighter">
            <span
              className="text-5xl sm:text-6xl md:text-7xl leading-none font-extrabold text-transparent bg-clip-text bg-gradient-to-t from-white via-indigo-200 to-indigo-400 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.4)',
                filter: 'drop-shadow(0 2px 8px rgba(79, 70, 229, 0.4))'
              }}
            >
              {rank}
            </span>
          </div>
        )}

        {/* Hover Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
          <button
            id={`play-btn-${item.id}`}
            title="Watch Trailer / Stream"
            onClick={(e) => {
              e.stopPropagation();
              setActivePlayerMedia(item);
            }}
            className="w-11 h-11 rounded-full bg-white hover:bg-white/90 text-black flex items-center justify-center shadow-lg shadow-black/60 transform hover:scale-110 transition-all active:scale-95"
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </button>
          
          <button
            id={`info-btn-${item.id}`}
            title="Details"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedMedia(item);
            }}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transform hover:scale-110 transition-all active:scale-95"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom-Right Floating Watchlist Plus Button */}
        <button
          id={`watchlist-btn-${item.id}`}
          title={inWatchlist ? "Remove from Library" : "Add to Library"}
          onClick={(e) => {
            e.stopPropagation();
            toggleWatchlist(item);
          }}
          className={`absolute bottom-2.5 right-2.5 z-20 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 shadow-md ${
            inWatchlist
              ? 'bg-indigo-600 text-white border border-indigo-400 scale-105 shadow-[0_0_10px_rgba(79,70,229,0.5)]'
              : 'bg-black/60 hover:bg-black/80 text-white/90 hover:text-white border border-white/20 hover:scale-110'
          }`}
        >
          {inWatchlist ? (
            <Check className="w-4 h-4 stroke-[2.5]" />
          ) : (
            <Plus className="w-4 h-4 stroke-[2.5]" />
          )}
        </button>
      </div>

      {/* Metadata / Titles Underneath */}
      <div className="mt-2.5 px-0.5">
        <h4 className="font-semibold text-sm sm:text-base text-white line-clamp-1 group-hover:text-indigo-300 transition-colors">
          {title}
        </h4>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-white/50 font-medium">
          <span className="tracking-wider uppercase text-[11px] text-white/40">{typeLabel}</span>
          <span className="inline-block w-1 h-1 rounded-full bg-white/20" />
          <span>{year}</span>
        </div>
      </div>
    </motion.div>
  );
};
