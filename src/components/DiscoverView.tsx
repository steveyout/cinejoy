import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, Variants, AnimatePresence } from 'motion/react';
import { Filter, SlidersHorizontal, Film, Tv, Sparkles, RefreshCw, Star, Loader2, ArrowUp } from 'lucide-react';
import { MediaItem, FilterState } from '../types';
import { GENRES } from '../services/curatedData';
import { tmdbService } from '../services/tmdb';
import { MovieCard } from './MovieCard';
import { DiscoverGridSkeleton } from './Skeletons';
import { triggerHaptic } from '../utils/haptics';

// Staggered Entrance Animation Variants
const gridContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.06,
    },
  },
};

const gridItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.38,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

interface DiscoverViewProps {
  initialGenreId?: number | null;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({ initialGenreId }) => {
  const [filters, setFilters] = useState<FilterState>({
    mediaType: 'all',
    genreId: initialGenreId || null,
    sortBy: 'popularity.desc',
    year: '',
    minRating: 0,
  });

  const [results, setResults] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Sentinel ref for Intersection Observer
  const observerTargetRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  // Sync initial genre if supplied
  useEffect(() => {
    if (initialGenreId) {
      setFilters((prev) => ({ ...prev, genreId: initialGenreId }));
    }
  }, [initialGenreId]);

  // Initial Load & Filter change handler (Reset to Page 1)
  useEffect(() => {
    let isMounted = true;
    isFetchingRef.current = true;
    setLoading(true);
    setPage(1);

    const fetchInitialPage = async () => {
      try {
        const data = await tmdbService.discover(filters, 1);
        if (isMounted) {
          setResults(data.results);
          setTotalPages(data.totalPages);
          setTotalResults(data.totalResults);
          setHasMore(1 < data.totalPages);
        }
      } catch (err) {
        console.error('Discover initial load error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
          isFetchingRef.current = false;
        }
      }
    };

    fetchInitialPage();

    return () => {
      isMounted = false;
      isFetchingRef.current = false;
    };
  }, [filters]);

  // Function to load the next page via Infinite Scroll
  const loadNextPage = useCallback(async () => {
    if (isFetchingRef.current || loading || loadingMore || !hasMore) return;

    const nextPage = page + 1;
    if (nextPage > totalPages) {
      setHasMore(false);
      return;
    }

    isFetchingRef.current = true;
    setLoadingMore(true);

    try {
      const data = await tmdbService.discover(filters, nextPage);
      if (data.results.length > 0) {
        setResults((prev) => {
          const seen = new Set(prev.map((m) => m.id));
          const fresh = data.results.filter((m) => !seen.has(m.id));
          return [...prev, ...fresh];
        });
        setPage(nextPage);
        setTotalPages(data.totalPages);
        setHasMore(nextPage < data.totalPages);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading next page in Discover:', err);
    } finally {
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [page, totalPages, filters, loading, loadingMore, hasMore]);

  // Intersection Observer for Infinite Scrolling
  useEffect(() => {
    const target = observerTargetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isFetchingRef.current && hasMore && !loading && !loadingMore) {
          loadNextPage();
        }
      },
      {
        root: null,
        rootMargin: '400px', // Pre-fetch before user hits the exact bottom
        threshold: 0.1,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [loadNextPage, hasMore, loading, loadingMore]);

  const resetFilters = () => {
    triggerHaptic('light');
    setFilters({
      mediaType: 'all',
      genreId: null,
      sortBy: 'popularity.desc',
      year: '',
      minRating: 0,
    });
  };

  const scrollToTop = () => {
    triggerHaptic('selection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters =
    filters.mediaType !== 'all' ||
    filters.genreId !== null ||
    filters.year !== '' ||
    filters.minRating > 0 ||
    filters.sortBy !== 'popularity.desc';

  return (
    <div className="w-full px-4 sm:px-6 pb-24 lg:pb-12 space-y-6">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>Discover & Filter</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            Showing {results.length}{totalResults > results.length ? ` of ${totalResults}+` : ''} curated movies, series, and blockbusters
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/70 transition-colors border border-white/10 backdrop-blur-md cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}

          <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setFilters((f) => ({ ...f, mediaType: 'all' }))}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filters.mediaType === 'all'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilters((f) => ({ ...f, mediaType: 'movie' }))}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filters.mediaType === 'movie'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Film className="w-3 h-3" /> Movies
            </button>
            <button
              onClick={() => setFilters((f) => ({ ...f, mediaType: 'tv' }))}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filters.mediaType === 'tv'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Tv className="w-3 h-3" /> Series
            </button>
          </div>
        </div>
      </div>

      {/* Filter Row: Sort, Min Rating, Year */}
      <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-2xl">
        {/* Sort By Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">
            Sort:
          </span>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value as any }))}
            className="bg-white/10 border border-white/10 text-white text-xs rounded-xl px-2.5 py-1.5 focus:border-white/30 outline-none backdrop-blur-md cursor-pointer"
          >
            <option value="popularity.desc" className="bg-slate-900">Most Popular</option>
            <option value="vote_average.desc" className="bg-slate-900">Highest Rated</option>
            <option value="primary_release_date.desc" className="bg-slate-900">Release Date</option>
          </select>
        </div>

        {/* Rating Filter Buttons */}
        <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">
            Rating:
          </span>
          {[0, 7.0, 8.0].map((rate) => (
            <button
              key={rate}
              onClick={() => setFilters((f) => ({ ...f, minRating: rate }))}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                filters.minRating === rate
                  ? 'bg-amber-400 text-black font-bold shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-white/70'
              }`}
            >
              {rate > 0 ? (
                <>
                  <Star className="w-3 h-3 fill-current" /> {rate}+
                </>
              ) : (
                'Any'
              )}
            </button>
          ))}
        </div>

        {/* Year Filter */}
        <div className="flex items-center gap-2 ml-0 sm:ml-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">
            Year:
          </span>
          <select
            value={filters.year}
            onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value }))}
            className="bg-white/10 border border-white/10 text-white text-xs rounded-xl px-2.5 py-1.5 focus:border-white/30 outline-none backdrop-blur-md cursor-pointer"
          >
            <option value="" className="bg-slate-900">All Years</option>
            <option value="2026" className="bg-slate-900">2026</option>
            <option value="2025" className="bg-slate-900">2025</option>
            <option value="2024" className="bg-slate-900">2024</option>
            <option value="2023" className="bg-slate-900">2023</option>
            <option value="2022" className="bg-slate-900">2022</option>
            <option value="2020" className="bg-slate-900">2020s</option>
          </select>
        </div>
      </div>

      {/* Genre Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <button
          onClick={() => setFilters((f) => ({ ...f, genreId: null }))}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border backdrop-blur-md cursor-pointer ${
            filters.genreId === null
              ? 'bg-white text-black border-white shadow-md font-bold'
              : 'bg-white/5 text-white/60 hover:text-white border-white/10'
          }`}
        >
          All Genres
        </button>
        {GENRES.map((g) => {
          const isSelected = filters.genreId === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setFilters((f) => ({ ...f, genreId: isSelected ? null : g.id }))}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border backdrop-blur-md cursor-pointer ${
                isSelected
                  ? 'bg-white text-black border-white shadow-md font-bold'
                  : 'bg-white/5 text-white/60 hover:text-white border-white/10'
              }`}
            >
              {g.name}
            </button>
          );
        })}
      </div>

      {/* Media Results Grid */}
      {loading ? (
        <DiscoverGridSkeleton />
      ) : results.length > 0 ? (
        <>
          <motion.div
            key={`discover-grid-${filters.mediaType}-${filters.genreId}-${filters.sortBy}-${filters.year}-${filters.minRating}`}
            variants={gridContainerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5"
          >
            {results.map((item, index) => (
              <motion.div
                key={`${item.id}-${index}`}
                variants={gridItemVariants}
                className="w-full flex justify-center"
              >
                <MovieCard item={item} size="md" className="w-full" />
              </motion.div>
            ))}
          </motion.div>

          {/* Infinite Scroll Observer Target Sentinel */}
          <div ref={observerTargetRef} className="h-12 w-full flex items-center justify-center pt-4">
            {loadingMore && (
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl text-white text-xs font-semibold shadow-lg animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Loading more titles...</span>
              </div>
            )}
          </div>

          {/* End of Collection or Back to Top Footer */}
          {!hasMore && results.length > 0 && (
            <div className="pt-6 pb-2 text-center flex flex-col items-center justify-center gap-3">
              <div className="flex items-center gap-2 text-xs text-white/40 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>You've explored all {results.length} titles in this collection</span>
              </div>
              <button
                onClick={scrollToTop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/60 hover:text-white transition-colors border border-white/10 cursor-pointer"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                Back to top
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white/5 border border-white/10 space-y-3 backdrop-blur-xl">
          <Sparkles className="w-10 h-10 text-indigo-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">No titles found for this filter</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto">
            Try adjusting your genre, release year, or rating filters to explore more movies.
          </p>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs shadow-md cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

