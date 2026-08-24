import React, { useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem } from '../types';
import { MovieCard } from './MovieCard';
import { useApp } from '../context/AppContext';

interface MediaSectionProps {
  title: string;
  items: MediaItem[];
  viewAllFilter?: { mediaType?: 'movie' | 'tv'; genreId?: number };
  badge?: string;
}

export const MediaSection: React.FC<MediaSectionProps> = ({
  title,
  items,
  viewAllFilter,
  badge,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { setActiveTab } = useApp();

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleViewAll = () => {
    setActiveTab('browse');
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="relative w-full mb-8">
      {/* Header with frosted badge & View all */}
      <div className="flex items-center justify-between px-4 sm:px-6 mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <h3 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white truncate">
            {title}
          </h3>
          {badge && (
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
              {badge}
            </span>
          )}
          {/* Subtle horizontal frosted accent divider line */}
          <div className="hidden sm:block flex-1 h-[1px] bg-gradient-to-r from-white/10 via-white/5 to-transparent mx-2" />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleViewAll}
            className="group flex items-center gap-1.5 text-xs sm:text-sm font-medium text-white/60 hover:text-indigo-400 transition-colors whitespace-nowrap"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-indigo-400" />
          </button>

          {/* Desktop Arrow buttons */}
          <div className="hidden md:flex items-center gap-1 ml-2">
            <button
              onClick={() => scroll('left')}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all backdrop-blur-md"
              title="Scroll Left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all backdrop-blur-md"
              title="Scroll Right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-3.5 sm:gap-4.5 overflow-x-auto scrollbar-none px-4 sm:px-6 pb-2 scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item, index) => (
          <div key={`section-${title}-${item.id}-${index}`} className="snap-start">
            <MovieCard item={item} size="md" />
          </div>
        ))}
      </div>
    </section>
  );
};
