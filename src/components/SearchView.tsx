import React, { useState, useEffect, useRef } from 'react';
import { Search, X, History, TrendingUp, Sparkles, Film, Tv } from 'lucide-react';
import { MediaItem } from '../types';
import { tmdbService } from '../services/tmdb';
import { GENRES } from '../services/curatedData';
import { MovieCard } from './MovieCard';
import { DiscoverGridSkeleton } from './Skeletons';
import { useApp } from '../context/AppContext';

export const SearchView: React.FC = () => {
  const { searchQuery, setSearchQuery, recentSearches, addRecentSearch, clearRecentSearches } = useApp();
  const [searchType, setSearchType] = useState<'all' | 'movie' | 'tv'>('all');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const popularSuggestions = ['Dune', 'Lioness', 'Stranger Things', 'Minions', 'Oppenheimer', 'Arcane', 'Deadpool'];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await tmdbService.search(searchQuery, searchType);
        setResults(res);
        if (searchQuery.trim().length > 2) {
          addRecentSearch(searchQuery.trim());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery, searchType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery.trim());
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 pb-24 lg:pb-12 space-y-6">
      {/* Search Bar Input Container */}
      <form onSubmit={handleSearchSubmit} className="relative w-full max-w-3xl mx-auto pt-2">
        <div className="relative flex items-center rounded-2xl bg-white/5 border border-white/10 backdrop-blur-2xl focus-within:border-white/30 focus-within:bg-white/10 transition-all overflow-hidden shadow-lg">
          <div className="pl-4 text-white/50">
            <Search className="w-5 h-5" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies, TV shows, directors, actors..."
            className="w-full px-3 py-3.5 sm:py-4 bg-transparent text-white placeholder-white/40 text-sm sm:text-base outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="pr-4 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Media Type Switcher */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <button
            type="button"
            onClick={() => setSearchType('all')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all border backdrop-blur-md ${
              searchType === 'all'
                ? 'bg-white text-black border-white shadow-md font-bold'
                : 'bg-white/5 text-white/60 hover:text-white border-white/10'
            }`}
          >
            All Media
          </button>
          <button
            type="button"
            onClick={() => setSearchType('movie')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all border backdrop-blur-md ${
              searchType === 'movie'
                ? 'bg-white text-black border-white shadow-md font-bold'
                : 'bg-white/5 text-white/60 hover:text-white border-white/10'
            }`}
          >
            <Film className="w-3.5 h-3.5" /> Movies
          </button>
          <button
            type="button"
            onClick={() => setSearchType('tv')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all border backdrop-blur-md ${
              searchType === 'tv'
                ? 'bg-white text-black border-white shadow-md font-bold'
                : 'bg-white/5 text-white/60 hover:text-white border-white/10'
            }`}
          >
            <Tv className="w-3.5 h-3.5" /> TV Series
          </button>
        </div>
      </form>

      {/* When No Query: Show Trending & Recent Searches */}
      {!searchQuery && (
        <div className="max-w-3xl mx-auto space-y-6 pt-4">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-indigo-400" /> Recent Searches
                </h3>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-white/40 hover:text-white/80 font-medium"
                >
                  Clear History
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-medium border border-white/10 transition-all flex items-center gap-1.5 backdrop-blur-md"
                  >
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Trending Suggestions */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2.5 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Trending Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularSuggestions.map((item) => (
                <button
                  key={item}
                  onClick={() => setSearchQuery(item)}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/90 hover:text-white border border-white/10 text-xs font-semibold transition-all hover:scale-105 backdrop-blur-md"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search Results Grid */}
      {searchQuery && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm sm:text-base font-bold text-white">
              {loading ? (
                'Searching TMDB database...'
              ) : (
                `Found ${results.length} result${results.length === 1 ? '' : 's'} for "${searchQuery}"`
              )}
            </h2>
          </div>

          {loading ? (
            <DiscoverGridSkeleton />
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
              {results.map((item) => (
                <MovieCard key={item.id} item={item} size="md" className="w-full" />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white/5 border border-white/10 space-y-3 backdrop-blur-xl">
              <Search className="w-10 h-10 text-white/30 mx-auto" />
              <h3 className="text-lg font-bold text-white">No results matched your query</h3>
              <p className="text-xs text-white/50 max-w-sm mx-auto">
                Check your spelling or try searching for another blockbuster title, actor, or genre.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
