import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { MediaItem } from '../types';
import { MovieCard } from './MovieCard';

interface TopRankedRowProps {
  title?: string;
  subtitle?: string;
  items: MediaItem[];
}

export const TopRankedRow: React.FC<TopRankedRowProps> = ({
  title = "Today's Top 10",
  subtitle = "Most watched movies & series right now",
  items,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="relative w-full mb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-white/50 font-normal hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Scroll Controls for Desktop */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            id="top-ranked-scroll-left"
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all backdrop-blur-md"
            title="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            id="top-ranked-scroll-right"
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all backdrop-blur-md"
            title="Scroll Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-none px-4 sm:px-6 pb-3 pt-1 scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.slice(0, 10).map((item, index) => (
          <div key={`top-${item.id}-${index}`} className="snap-start">
            <MovieCard
              item={item}
              rank={index + 1}
              size="lg"
              className="w-[160px] sm:w-[195px] md:w-[220px]"
            />
          </div>
        ))}
      </div>
    </section>
  );
};
