import React from 'react';

interface MovieCardSkeletonProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  hasRank?: boolean;
  rankNumber?: number;
}

export const MovieCardSkeleton: React.FC<MovieCardSkeletonProps> = ({
  size = 'md',
  className = '',
  hasRank = false,
  rankNumber,
}) => {
  const cardWidthClass = {
    sm: 'w-[140px] sm:w-[155px]',
    md: 'w-[155px] sm:w-[175px] md:w-[190px]',
    lg: 'w-[180px] sm:w-[210px] md:w-[230px]',
  }[size];

  return (
    <div className={`relative flex-shrink-0 flex flex-col ${cardWidthClass} ${className}`}>
      {/* Optional Top-Rank Huge Number Background Simulation */}
      {hasRank && (
        <div className="absolute -left-3 bottom-8 sm:bottom-10 z-0 pointer-events-none select-none opacity-20">
          <span className="text-[72px] sm:text-[92px] font-black italic tracking-tighter text-white font-mono leading-none">
            {rankNumber || 1}
          </span>
        </div>
      )}

      {/* Poster Image Shimmer */}
      <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-lg shimmer-effect">
        {/* Circular Rating Ring Placeholder in top-right */}
        <div className="absolute top-2.5 right-2.5 z-10 w-9 h-9 rounded-full bg-white/10 border border-white/15" />
      </div>

      {/* Meta info placeholders */}
      <div className="mt-2.5 space-y-1.5 px-0.5">
        {/* Title Bar */}
        <div className="h-4 w-4/5 rounded-md bg-white/10 shimmer-effect" />
        {/* Subtitle / Year and Badge */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-10 rounded bg-white/10 shimmer-effect" />
          <div className="h-3 w-12 rounded-full bg-white/10 shimmer-effect" />
        </div>
      </div>
    </div>
  );
};

export const TopRankedRowSkeleton: React.FC = () => {
  return (
    <section className="relative w-full mb-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between px-4 sm:px-6 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 shimmer-effect" />
          <div className="space-y-1">
            <div className="h-5 w-32 rounded-md bg-white/10 shimmer-effect" />
            <div className="h-3 w-48 rounded bg-white/5 shimmer-effect hidden sm:block" />
          </div>
        </div>

        {/* Scroll Buttons Placeholder */}
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 shimmer-effect" />
          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 shimmer-effect" />
        </div>
      </div>

      {/* Horizontal Cards Track Skeleton */}
      <div className="flex items-center gap-3.5 sm:gap-4 overflow-x-hidden px-4 sm:px-6 py-2">
        {[1, 2, 3, 4, 5, 6].map((rank) => (
          <MovieCardSkeleton
            key={rank}
            size="md"
            hasRank={true}
            rankNumber={rank}
          />
        ))}
      </div>
    </section>
  );
};

export const MediaSectionSkeleton: React.FC<{ titleWidth?: string }> = ({
  titleWidth = 'w-36',
}) => {
  return (
    <section className="relative w-full mb-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between px-4 sm:px-6 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-5 w-16 rounded-full bg-white/10 border border-white/10 shimmer-effect" />
          <div className={`h-5 ${titleWidth} rounded-md bg-white/10 shimmer-effect`} />
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 shimmer-effect" />
          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 shimmer-effect" />
        </div>
      </div>

      {/* Horizontal Cards Track Skeleton */}
      <div className="flex items-center gap-3.5 sm:gap-4 overflow-x-hidden px-4 sm:px-6 py-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <MovieCardSkeleton key={i} size="md" />
        ))}
      </div>
    </section>
  );
};

export const GenreChipsSkeleton: React.FC = () => {
  return (
    <div className="px-4 sm:px-6 mb-6">
      <div className="flex items-center gap-2 overflow-x-hidden pb-1">
        {[80, 96, 72, 110, 88, 100, 76, 92].map((width, i) => (
          <div
            key={i}
            style={{ width: `${width}px` }}
            className="h-8 rounded-xl bg-white/5 border border-white/10 flex-shrink-0 shimmer-effect"
          />
        ))}
      </div>
    </div>
  );
};

export const HomeViewSkeleton: React.FC = () => {
  return (
    <div className="w-full pb-24 lg:pb-12 space-y-6 animate-in fade-in duration-300">
      {/* 1. Hero Featured Carousel Skeleton */}
      <TopRankedRowSkeleton />

      {/* 2. Genre Chips Carousel Skeleton */}
      <GenreChipsSkeleton />

      {/* 3. Popular Movies Skeleton */}
      <MediaSectionSkeleton titleWidth="w-40" />

      {/* 4. Install Banner Placeholder Skeleton */}
      <div className="px-4 sm:px-6">
        <div className="w-full h-28 rounded-3xl bg-white/5 border border-white/10 shimmer-effect" />
      </div>

      {/* 5. Trending TV Skeleton */}
      <MediaSectionSkeleton titleWidth="w-32" />

      {/* 6. Upcoming In Theatres Skeleton */}
      <MediaSectionSkeleton titleWidth="w-44" />
    </div>
  );
};

export const DiscoverGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 animate-in fade-in duration-200">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="flex flex-col w-full">
          {/* Card Poster Shimmer */}
          <div className="aspect-[2/3] w-full rounded-2xl bg-white/5 border border-white/10 shadow-lg shimmer-effect relative overflow-hidden">
            <div className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-white/10 border border-white/15" />
          </div>
          {/* Card Info Shimmer */}
          <div className="mt-2.5 space-y-1.5 px-0.5">
            <div className="h-4 w-3/4 rounded-md bg-white/10 shimmer-effect" />
            <div className="flex items-center gap-2">
              <div className="h-3 w-10 rounded bg-white/10 shimmer-effect" />
              <div className="h-3 w-12 rounded-full bg-white/10 shimmer-effect" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
