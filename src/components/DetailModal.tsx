import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Plus, 
  Check, 
  Heart, 
  Download, 
  Star, 
  Clock, 
  Calendar, 
  Film, 
  Tv, 
  Share2, 
  Sparkles,
  Users,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Palette
} from 'lucide-react';
import { MediaItem, CastMember } from '../types';
import { getImageUrl, getBackdropUrl, formatYear, formatDuration, tmdbService } from '../services/tmdb';
import { useApp } from '../context/AppContext';
import { MovieCard } from './MovieCard';
import { RatingRing } from './RatingRing';
import { triggerHaptic } from '../utils/haptics';
import { trackMediaView, trackTrailerPlay } from '../services/analytics';
import { extractPosterPalette, DEFAULT_POSTER_PALETTE, PosterPalette } from '../utils/posterPalette';

interface DetailModalProps {
  media: MediaItem;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ media, onClose }) => {
  const { 
    setActivePlayerMedia, 
    toggleWatchlist, 
    isInWatchlist, 
    watchlist,
    toggleFavorite, 
    toggleDownload,
    settings,
    showToast 
  } = useApp();

  const [details, setDetails] = useState<MediaItem>(media);
  const [cast, setCast] = useState<CastMember[]>(media.cast || []);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'cast' | 'reviews'>('overview');
  const [isPlayingTrailer, setIsPlayingTrailer] = useState<boolean>(false);
  const [isTrailerMuted, setIsTrailerMuted] = useState<boolean>(true);
  const [posterPalette, setPosterPalette] = useState<PosterPalette>(DEFAULT_POSTER_PALETTE);
  const [isPaletteLoaded, setIsPaletteLoaded] = useState<boolean>(false);
  const castScrollRef = useRef<HTMLDivElement>(null);
  const similarScrollRef = useRef<HTMLDivElement>(null);

  const inWatchlist = isInWatchlist(media.id);
  const watchlistItem = watchlist.find(w => w.id === media.id);
  const isFavorite = watchlistItem?.isFavorite || false;
  const isDownloaded = watchlistItem?.downloaded || false;

  // Lock background body scroll to eliminate duplicate desktop scrollbars
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Dynamically extract color palette from the selected movie poster
  useEffect(() => {
    let isCurrent = true;
    const posterUrl = getImageUrl(details.poster_path || media.poster_path, 'w500');
    
    if (posterUrl) {
      extractPosterPalette(posterUrl).then((palette) => {
        if (isCurrent) {
          setPosterPalette(palette);
          setIsPaletteLoaded(true);
        }
      }).catch((err) => {
        console.warn('[Poster Tint] Color extraction error:', err);
      });
    }

    return () => {
      isCurrent = false;
    };
  }, [details.poster_path, media.poster_path]);

  useEffect(() => {
    trackMediaView(media);
    let isMounted = true;
    const fetchFullDetailsAndCredits = async () => {
      setLoading(true);
      try {
        const full = await tmdbService.getDetails(media.id, media.media_type);
        if (isMounted) {
          setDetails(full);
          if (full.trailer_key && settings.autoPlayTrailers !== false) {
            setIsPlayingTrailer(true);
            trackTrailerPlay(full);
          }
          if (full.cast && full.cast.length > 0) {
            setCast(full.cast);
          } else {
            // Fetch directly from TMDB credits endpoint as fallback
            const fetchedCredits = await tmdbService.getCredits(media.id, media.media_type);
            if (isMounted && fetchedCredits.length > 0) {
              setCast(fetchedCredits);
              setDetails(prev => ({ ...prev, cast: fetchedCredits }));
            }
          }
        }
      } catch (e) {
        console.error('Error fetching details/credits:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFullDetailsAndCredits();
    return () => {
      isMounted = false;
    };
  }, [media.id, media.media_type]);

  const scrollCast = (direction: 'left' | 'right') => {
    triggerHaptic('light');
    if (castScrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      castScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollSimilar = (direction: 'left' | 'right') => {
    triggerHaptic('light');
    if (similarScrollRef.current) {
      const scrollAmount = direction === 'left' ? -360 : 360;
      similarScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const title = details.title || details.name || 'Untitled';
  const year = formatYear(details.release_date || details.first_air_date);
  const rating = details.vote_average ? details.vote_average.toFixed(1) : '7.5';

  const handleShare = () => {
    triggerHaptic('light');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-black/85 backdrop-blur-2xl flex items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-300"
      style={{
        background: isPaletteLoaded ? posterPalette.ambientRadial : undefined,
        transition: 'background 0.8s ease-in-out'
      }}
      onClick={onClose}
    >
      {/* Viewport Pinned Floating Close Button */}
      <button
        onClick={onClose}
        type="button"
        className="fixed top-3 right-3 sm:top-5 sm:right-6 z-[60] p-2.5 sm:p-3 rounded-full bg-black/80 hover:bg-rose-600/80 text-white/80 hover:text-white border border-white/20 shadow-2xl backdrop-blur-xl transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer group flex items-center gap-1.5"
        title="Close modal (Esc)"
        aria-label="Close modal"
      >
        <X className="w-5 h-5 transition-transform group-hover:rotate-90" />
        <span className="hidden sm:inline text-xs font-semibold pr-1">Close</span>
      </button>

      {/* Main Modal Card Container with Dynamic Poster Palette Tint */}
      <div 
        className="relative w-full max-w-4xl max-h-screen sm:max-h-[90vh] sm:rounded-3xl border shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-y-auto overflow-x-hidden text-white flex flex-col backdrop-blur-2xl scrollbar-none sm:overscroll-contain transition-all duration-700 ease-out"
        style={{
          backgroundColor: isPaletteLoaded ? posterPalette.glassBackground : 'rgba(5, 5, 8, 0.95)',
          borderColor: isPaletteLoaded ? posterPalette.glassBorder : 'rgba(255, 255, 255, 0.15)',
          boxShadow: isPaletteLoaded ? posterPalette.glowShadow : '0 25px 70px rgba(0, 0, 0, 0.9)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow Diffuser */}
        <div 
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-3/4 h-64 rounded-full pointer-events-none opacity-40 blur-3xl transition-colors duration-1000"
          style={{
            backgroundColor: posterPalette.primaryHex
          }}
        />

        {/* Sticky Corner Close Button on Modal Card */}
        <div className="sticky top-3 right-3 z-40 self-end h-0 w-0 overflow-visible flex justify-end pr-4 pt-1 pointer-events-none">
          <button
            onClick={onClose}
            type="button"
            className="pointer-events-auto p-2.5 rounded-full bg-black/80 hover:bg-white/25 backdrop-blur-xl text-white border border-white/20 transition-all hover:scale-105 active:scale-95 shadow-2xl cursor-pointer"
            title="Close modal (Esc)"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Backdrop Banner & Trailer Embed */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full max-h-[340px] flex-shrink-0 overflow-hidden bg-black select-none">
          {isPlayingTrailer && details.trailer_key ? (
            <div className="relative w-full h-full">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${details.trailer_key}?autoplay=1&mute=${isTrailerMuted ? 1 : 0}&controls=1&rel=0&modestbranding=1&enablejsapi=1&playsinline=1`}
                title={`${title} Official Trailer`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />

              {/* Floating Trailer Pill & Controls */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>Trailer Playing</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    setIsTrailerMuted(!isTrailerMuted);
                  }}
                  className="p-1.5 rounded-full bg-black/80 hover:bg-black/95 text-white border border-white/20 backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-lg"
                  title={isTrailerMuted ? "Unmute audio" : "Mute audio"}
                  aria-label={isTrailerMuted ? "Unmute audio" : "Mute audio"}
                >
                  {isTrailerMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              </div>

              {/* Backdrop Toggle on upper right */}
              <div className="absolute top-3 right-16 z-20">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setIsPlayingTrailer(false);
                  }}
                  className="px-2.5 py-1 rounded-full bg-black/80 hover:bg-white/20 text-white/90 hover:text-white border border-white/20 backdrop-blur-md text-[11px] font-medium transition-all active:scale-95 cursor-pointer shadow-lg"
                >
                  Show Backdrop
                </button>
              </div>
            </div>
          ) : (
            <>
              <img
                src={getBackdropUrl(details.backdrop_path, 'original')}
                alt={title}
                className="w-full h-full object-cover filter brightness-90"
              />
              <div 
                className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/60 to-transparent" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050508]/80 via-transparent to-[#050508]/40" />

              {/* Quick Play Trailer / Stream Floating Button on Hero */}
              <div className="absolute inset-0 flex items-center justify-center gap-3">
                <button
                  onClick={() => setActivePlayerMedia(details)}
                  type="button"
                  style={{
                    boxShadow: `0 10px 30px -5px ${posterPalette.primaryHex}60`
                  }}
                  className="group flex items-center gap-2.5 px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-white hover:bg-white/90 text-black font-bold text-xs sm:text-sm tracking-wide shadow-2xl transform hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/10 flex items-center justify-center">
                    <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5" />
                  </div>
                  <span>WATCH NOW</span>
                </button>

                {details.trailer_key && (
                  <button
                    onClick={() => {
                      triggerHaptic('medium');
                      trackTrailerPlay(details);
                      setIsPlayingTrailer(true);
                    }}
                    type="button"
                    className="group flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-black/70 hover:bg-black/90 text-white border border-white/20 font-bold text-xs sm:text-sm tracking-wide shadow-2xl backdrop-blur-md transform hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <Film className="w-4 h-4" style={{ color: posterPalette.primaryHex }} />
                    <span>TRAILER</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Body Content */}
        <div className="relative px-5 sm:px-8 pb-8 -mt-16 sm:-mt-20 z-10 flex-1">
          {/* Main Info Row */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Poster Card with Adaptive Border & Glow */}
            <div 
              className="relative w-32 sm:w-44 flex-shrink-0 aspect-[2/3] rounded-2xl overflow-hidden bg-white/5 border-2 shadow-2xl mx-auto sm:mx-0 select-none transition-all duration-700"
              style={{
                borderColor: isPaletteLoaded ? posterPalette.glassBorder : 'rgba(255, 255, 255, 0.2)',
                boxShadow: isPaletteLoaded ? `0 15px 40px -10px ${posterPalette.primaryHex}70` : undefined,
              }}
            >
              <img
                src={getImageUrl(details.poster_path, 'w500')}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 right-2.5">
                <RatingRing rating={details.vote_average || 7.0} size="md" />
              </div>
            </div>

            {/* Metadata & Actions */}
            <div className="flex-1 space-y-4 pt-2 text-center sm:text-left w-full">
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2 text-xs text-slate-400">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white font-medium border border-white/10">
                    {details.media_type === 'tv' ? 'TV Series' : 'Movie'}
                  </span>

                  {/* Adaptive Poster Palette Swatch Indicator */}
                  {isPaletteLoaded && (
                    <div 
                      className="px-2.5 py-0.5 rounded-full text-white/90 text-[11px] font-medium border flex items-center gap-1.5 backdrop-blur-md shadow-sm transition-all animate-in fade-in"
                      style={{
                        backgroundColor: posterPalette.pillBackground,
                        borderColor: posterPalette.glassBorder,
                      }}
                      title="Glassmorphic tint automatically synchronized to poster palette"
                    >
                      <Palette className="w-3 h-3" style={{ color: posterPalette.primaryHex }} />
                      <span className="hidden xs:inline text-[10px] tracking-wider uppercase opacity-75">Palette:</span>
                      <div className="flex items-center -space-x-1">
                        {posterPalette.swatches.slice(0, 3).map((hex, idx) => (
                          <span
                            key={idx}
                            className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-xs inline-block"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {year && <span>{year}</span>}
                  {details.runtime ? (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" style={{ color: posterPalette.primaryHex }} />
                        {formatDuration(details.runtime)}
                      </span>
                    </>
                  ) : null}
                  {details.number_of_seasons ? (
                    <>
                      <span>•</span>
                      <span>{details.number_of_seasons} Season{details.number_of_seasons > 1 ? 's' : ''}</span>
                    </>
                  ) : null}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                  {title}
                </h1>

                {details.tagline && (
                  <p 
                    className="text-xs sm:text-sm italic font-serif"
                    style={{ color: isPaletteLoaded ? posterPalette.accentHex : '#FBBF24' }}
                  >
                    "{details.tagline}"
                  </p>
                )}
              </div>

              {/* Genres */}
              {details.genres && details.genres.length > 0 && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                  {details.genres.map((g) => (
                    <span
                      key={g.id}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-white/70"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-2">
                <button
                  onClick={() => setActivePlayerMedia(details)}
                  type="button"
                  style={{
                    background: posterPalette.buttonGradient,
                    boxShadow: `0 8px 25px -4px ${posterPalette.primaryHex}60`,
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold shadow-lg active:scale-95 transition-all cursor-pointer hover:brightness-110"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Stream Full Title</span>
                </button>

                <button
                  onClick={() => toggleWatchlist(details)}
                  type="button"
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all active:scale-95 cursor-pointer ${
                    inWatchlist
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                  }`}
                >
                  {inWatchlist ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
                  <span>{inWatchlist ? 'In Library' : 'Add to Watchlist'}</span>
                </button>

                {details.trailer_key && (
                  <button
                    onClick={() => {
                      triggerHaptic('selection');
                      if (!isPlayingTrailer) {
                        trackTrailerPlay(details);
                      }
                      setIsPlayingTrailer(!isPlayingTrailer);
                    }}
                    type="button"
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all active:scale-95 cursor-pointer ${
                      isPlayingTrailer
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                    }`}
                  >
                    <Film className="w-4 h-4" style={{ color: posterPalette.primaryHex }} />
                    <span>{isPlayingTrailer ? 'Hide Trailer' : 'Watch Trailer'}</span>
                  </button>
                )}

                <button
                  onClick={() => toggleFavorite(details.id)}
                  type="button"
                  className={`p-2.5 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                    isFavorite
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-md shadow-rose-500/20'
                      : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border-white/10'
                  }`}
                  title={isFavorite ? 'Remove Favorite' : 'Add Favorite'}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={() => toggleDownload(details.id)}
                  type="button"
                  className={`p-2.5 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                    isDownloaded
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border-white/10'
                  }`}
                  title={isDownloaded ? 'Downloaded Offline' : 'Download for Offline Mode'}
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  onClick={handleShare}
                  type="button"
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all active:scale-95 cursor-pointer"
                  title="Share Title"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs (Overview, Cast, Reviews) with Dynamic Active Indicator */}
          <div className="mt-8 border-b border-white/10 flex items-center gap-6 text-sm font-semibold">
            <button
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('overview');
              }}
              type="button"
              className={`pb-2.5 relative transition-colors cursor-pointer ${
                activeTab === 'overview' ? 'text-white font-bold' : 'text-white/40 hover:text-white'
              }`}
            >
              Overview
              {activeTab === 'overview' && (
                <span 
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: posterPalette.primaryHex,
                    boxShadow: `0 0 10px ${posterPalette.primaryHex}`,
                  }}
                />
              )}
            </button>
            <button
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('cast');
              }}
              type="button"
              className={`pb-2.5 relative transition-colors cursor-pointer ${
                activeTab === 'cast' ? 'text-white font-bold' : 'text-white/40 hover:text-white'
              }`}
            >
              Cast & Characters {cast.length > 0 && `(${cast.length})`}
              {activeTab === 'cast' && (
                <span 
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: posterPalette.primaryHex,
                    boxShadow: `0 0 10px ${posterPalette.primaryHex}`,
                  }}
                />
              )}
            </button>
            <button
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('reviews');
              }}
              type="button"
              className={`pb-2.5 relative transition-colors cursor-pointer ${
                activeTab === 'reviews' ? 'text-white font-bold' : 'text-white/40 hover:text-white'
              }`}
            >
              Reviews
              {activeTab === 'reviews' && (
                <span 
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: posterPalette.primaryHex,
                    boxShadow: `0 0 10px ${posterPalette.primaryHex}`,
                  }}
                />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-5">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Storyline
                  </h3>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
                    {details.overview || 'No detailed plot summary is currently available for this title.'}
                  </p>
                </div>

                {/* Horizontal Scrolling Cast Members with Character Names */}
                {cast.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                        <Users className="w-4 h-4" style={{ color: posterPalette.primaryHex }} />
                        <span>Starring Cast & Characters</span>
                        <span className="text-xs font-normal text-white/40">({cast.length})</span>
                      </h3>

                      {/* Scroll Navigation Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => scrollCast('left')}
                          type="button"
                          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all active:scale-95 cursor-pointer"
                          title="Scroll Left"
                          aria-label="Scroll Cast Left"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => scrollCast('right')}
                          type="button"
                          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all active:scale-95 cursor-pointer"
                          title="Scroll Right"
                          aria-label="Scroll Cast Right"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Horizontal Scroll Track - No Desktop Scrollbars */}
                    <div
                      ref={castScrollRef}
                      className="flex gap-3.5 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-2 pt-1 scroll-smooth snap-x"
                    >
                      {cast.map((actor) => (
                        <div
                          key={actor.id}
                          className="flex-shrink-0 w-[130px] sm:w-[145px] p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 group flex flex-col items-center text-center backdrop-blur-xl snap-start cursor-default select-none"
                          style={{
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          {/* Cast Profile Photo */}
                          <div 
                            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-white/10 border-2 border-white/15 shadow-md transition-all duration-300 group-hover:scale-105 mb-2.5"
                            style={{
                              borderColor: isPaletteLoaded ? `${posterPalette.primaryHex}40` : undefined,
                            }}
                          >
                            {actor.profile_path ? (
                              <img
                                src={getImageUrl(actor.profile_path, 'w200')}
                                alt={actor.name}
                                loading="lazy"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div 
                                className="w-full h-full flex flex-col items-center justify-center text-white/60"
                                style={{
                                  background: `linear-gradient(135deg, ${posterPalette.primaryHex}30 0%, ${posterPalette.secondaryHex}20 100%)`
                                }}
                              >
                                <Users className="w-6 h-6 text-white/40" />
                              </div>
                            )}
                          </div>

                          {/* Actor Real Name */}
                          <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight line-clamp-1 group-hover:text-white transition-colors w-full">
                            {actor.name}
                          </h4>

                          {/* Character Name */}
                          <p 
                            className="text-[11px] line-clamp-2 mt-1 w-full leading-tight font-medium"
                            style={{ color: isPaletteLoaded ? `${posterPalette.primaryHex}` : '#FBBF24' }}
                          >
                            {actor.character ? actor.character : 'Cast Member'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stream Specs */}
                <div 
                  className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md transition-colors"
                  style={{
                    borderColor: isPaletteLoaded ? `${posterPalette.primaryHex}25` : undefined,
                  }}
                >
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-white/40 font-semibold block">
                      Audio Track
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white">
                      Dolby Atmos 5.1
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-white/40 font-semibold block">
                      Video Resolution
                    </span>
                    <span 
                      className="text-xs sm:text-sm font-bold"
                      style={{ color: posterPalette.primaryHex }}
                    >
                      4K HDR 60fps
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-white/40 font-semibold block">
                      Subtitles
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white">
                      English, Spanish, FR
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-white/40 font-semibold block">
                      Rating Community
                    </span>
                    <span 
                      className="text-xs sm:text-sm font-bold"
                      style={{ color: posterPalette.primaryHex }}
                    >
                      {details.vote_count.toLocaleString()} Votes
                    </span>
                  </div>
                </div>

                {/* Similar / Recommended Movies */}
                {details.similar && details.similar.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4" style={{ color: posterPalette.primaryHex }} />
                        <span>More Like This</span>
                      </h3>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => scrollSimilar('left')}
                          type="button"
                          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all active:scale-95 cursor-pointer"
                          title="Scroll Left"
                          aria-label="Scroll Similar Left"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => scrollSimilar('right')}
                          type="button"
                          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all active:scale-95 cursor-pointer"
                          title="Scroll Right"
                          aria-label="Scroll Similar Right"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Horizontal Scroll Track - No Desktop Scrollbars */}
                    <div
                      ref={similarScrollRef}
                      className="flex gap-3.5 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-2 pt-1 scroll-smooth snap-x"
                    >
                      {details.similar.map((sim) => (
                        <div key={sim.id} className="flex-shrink-0 snap-start">
                          <MovieCard item={sim} size="sm" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'cast' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <p className="text-xs text-white/60">
                    Showing top billing credits and starring cast members
                  </p>
                  <span 
                    className="text-xs font-bold px-2.5 py-1 rounded-lg border"
                    style={{
                      color: posterPalette.primaryHex,
                      backgroundColor: `${posterPalette.primaryHex}15`,
                      borderColor: `${posterPalette.primaryHex}30`,
                    }}
                  >
                    {cast.length} Cast Members
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {cast.length > 0 ? (
                    cast.map((actor) => (
                      <div
                        key={actor.id}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all backdrop-blur-md"
                        style={{
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <div 
                          className="w-12 h-12 rounded-full bg-white/10 flex-shrink-0 overflow-hidden border border-white/15 flex items-center justify-center text-white/60 shadow-sm"
                          style={{
                            borderColor: `${posterPalette.primaryHex}40`
                          }}
                        >
                          {actor.profile_path ? (
                            <img
                              src={getImageUrl(actor.profile_path, 'w200')}
                              alt={actor.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="w-5 h-5 text-white/40" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate">{actor.name}</h4>
                          <p 
                            className="text-[11px] truncate font-medium"
                            style={{ color: posterPalette.primaryHex }}
                          >
                            {actor.character || 'Cast Member'}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-white/50 col-span-full">Loading credits from TMDB...</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-3">
                {details.reviews && details.reviews.length > 0 ? (
                  details.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5 backdrop-blur-md"
                      style={{
                        borderColor: `${posterPalette.primaryHex}20`
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span 
                          className="text-xs font-bold"
                          style={{ color: posterPalette.secondaryHex }}
                        >
                          {rev.author}
                        </span>
                        {rev.rating && (
                          <span 
                            className="text-xs font-semibold flex items-center gap-1"
                            style={{ color: posterPalette.primaryHex }}
                          >
                            <Star className="w-3 h-3 fill-current" /> {rev.rating}/10
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed line-clamp-3">
                        {rev.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center text-white/50 text-xs">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-white/30" />
                    No user reviews yet. Be the first to review after watching!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Dismiss / Close Button */}
          <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-white/40">
              Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Esc</kbd> or click outside to dismiss
            </span>
            <button
              onClick={onClose}
              type="button"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 hover:border-white/30 transition-all active:scale-95 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Close Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
