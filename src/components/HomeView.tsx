import React, { useState, useEffect } from 'react';
import { Sparkles, Film, Tv, Flame, TrendingUp, Award, Clock } from 'lucide-react';
import { MediaItem } from '../types';
import { tmdbService } from '../services/tmdb';
import { GENRES } from '../services/curatedData';
import { TrendingHeroCarousel } from './TrendingHeroCarousel';
import { TopRankedRow } from './TopRankedRow';
import { MediaSection } from './MediaSection';
import { InstallBanner } from './InstallBanner';
import { HomeViewSkeleton } from './Skeletons';
import { useApp } from '../context/AppContext';
import { triggerHaptic } from '../utils/haptics';

interface HomeViewProps {
  mediaFilter: 'all' | 'movie' | 'tv';
  onSelectGenre: (genreId: number) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ mediaFilter, onSelectGenre }) => {
  const { setActiveTab } = useApp();
  const [trendingNow, setTrendingNow] = useState<MediaItem[]>([]);
  const [topRanked, setTopRanked] = useState<MediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([]);
  const [trendingTV, setTrendingTV] = useState<MediaItem[]>([]);
  const [upcoming, setUpcoming] = useState<MediaItem[]>([]);
  const [topRated, setTopRated] = useState<MediaItem[]>([]);
  const [sciFiMovies, setSciFiMovies] = useState<MediaItem[]>([]);
  const [actionMovies, setActionMovies] = useState<MediaItem[]>([]);
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [genreResults, setGenreResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadAllContent = async () => {
      setLoading(true);
      try {
        const [trending, ranked, pop, tv, up, topR, scifi, action] = await Promise.all([
          tmdbService.getTrending(mediaFilter === 'tv' ? 'tv' : mediaFilter === 'movie' ? 'movie' : 'all', 'day'),
          tmdbService.getTopRanked(),
          tmdbService.getPopularMovies(),
          tmdbService.getTrendingTV(),
          tmdbService.getUpcoming(),
          tmdbService.getTopRated('movie'),
          tmdbService.getByGenre(878, 'movie'), // Sci-Fi
          tmdbService.getByGenre(28, 'movie'),  // Action
        ]);

        if (isMounted) {
          setTrendingNow(trending);
          setTopRanked(ranked);
          setPopularMovies(pop);
          setTrendingTV(tv);
          setUpcoming(up);
          setTopRated(topR);
          setSciFiMovies(scifi);
          setActionMovies(action);
        }
      } catch (err) {
        console.error('Failed to load TMDB sections', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAllContent();
    return () => {
      isMounted = false;
    };
  }, [mediaFilter]);

  const handleGenreClick = async (genreId: number) => {
    triggerHaptic('selection');
    if (selectedGenreId === genreId) {
      setSelectedGenreId(null);
      setGenreResults([]);
    } else {
      setSelectedGenreId(genreId);
      const res = await tmdbService.getByGenre(genreId, mediaFilter === 'tv' ? 'tv' : 'movie');
      setGenreResults(res);
    }
  };

  if (loading) {
    return <HomeViewSkeleton />;
  }

  return (
    <div className="w-full pb-24 lg:pb-12 space-y-6">
      {/* 0. Top Trending Now Glassmorphic Hero Carousel (Powered by TMDB trending API) */}
      {trendingNow.length > 0 && (
        <TrendingHeroCarousel items={trendingNow} />
      )}

      {/* 1. Hero Featured Carousel with Big Ranking Numbers (Matching screenshot top row) */}
      {(mediaFilter === 'all' || mediaFilter === 'movie') && (
        <TopRankedRow
          title="Top 10 Today"
          subtitle="Trending across cinema and television"
          items={topRanked}
        />
      )}

      {/* 2. Interactive Genre Chips Carousel */}
      <div className="px-4 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {GENRES.map((g) => {
            const isSelected = selectedGenreId === g.id;
            return (
              <button
                key={g.id}
                onClick={() => handleGenreClick(g.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border backdrop-blur-md ${
                  isSelected
                    ? 'bg-white text-black border-white shadow-lg shadow-white/10 scale-105 font-bold'
                    : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border-white/10'
                }`}
              >
                {g.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* If a genre chip is clicked, show its live results row */}
      {selectedGenreId && genreResults.length > 0 && (
        <MediaSection
          title={`${GENRES.find((g) => g.id === selectedGenreId)?.name} Spotlight`}
          items={genreResults}
          badge="Selected Genre"
        />
      )}

      {/* 3. Popular Movies (Exact section from screenshot) */}
      {(mediaFilter === 'all' || mediaFilter === 'movie') && (
        <MediaSection
          title="Popular Movies"
          items={popularMovies}
          badge="Trending Now"
        />
      )}

      {/* 4. Install the App Banner (Exact banner from bottom of screenshot) */}
      <InstallBanner />

      {/* 5. Trending TV Series */}
      {(mediaFilter === 'all' || mediaFilter === 'tv') && (
        <MediaSection
          title="Top TV Series"
          items={trendingTV}
          badge="Binge Worthy"
        />
      )}

      {/* 6. Upcoming In Theatres */}
      {mediaFilter !== 'tv' && (
        <MediaSection
          title="Upcoming & In Theatres"
          items={upcoming}
          badge="Coming Soon"
        />
      )}

      {/* 7. Sci-Fi Blockbusters */}
      {(mediaFilter === 'all' || mediaFilter === 'movie') && (
        <MediaSection
          title="Sci-Fi & Cyberpunk"
          items={sciFiMovies}
          badge="High Concept"
        />
      )}

      {/* 8. Top Rated Masterpieces */}
      <MediaSection
        title="Critically Acclaimed"
        items={topRated}
        badge="IMDb 8.0+"
      />

      {/* 9. High-Octane Action */}
      {(mediaFilter === 'all' || mediaFilter === 'movie') && (
        <MediaSection
          title="Action & Adrenaline"
          items={actionMovies}
          badge="Explosive"
        />
      )}
    </div>
  );
};
