import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Maximize2, 
  RotateCcw, 
  Film, 
  Sparkles,
  Tv,
  ChevronRight,
  ChevronLeft,
  FastForward,
  RotateCw,
  Clock,
  Volume2,
  CheckCircle2,
  Settings,
  Flame,
  SkipForward,
  SlidersHorizontal,
  Info,
  Sun,
  Eye,
  Layers
} from 'lucide-react';
import { MediaItem } from '../types';
import { getBackdropUrl } from '../services/tmdb';
import { useApp } from '../context/AppContext';
import { triggerHaptic } from '../utils/haptics';
import { 
  getEmbedUrl, 
  THEME_COLOR_MAP 
} from '../config/providers';
import { 
  extractAmbientPalette, 
  AmbientPalette, 
  DEFAULT_AMBIENT_PALETTE 
} from '../utils/ambientLight';
import { auth } from '../services/firebase';
import { saveCloudHistoryItem } from '../services/firestoreSync';
import { trackStreamPlay, trackEvent } from '../services/analytics';

interface VideoPlayerProps {
  media: MediaItem;
  onClose: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ media, onClose }) => {
  const { settings, updateSettings, setIsSettingsOpen, showToast } = useApp();
  const [selectedQuality] = useState(settings.streamQuality || '1080p');
  const [showControls, setShowControls] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [activeTab, setActiveTab] = useState<'stream' | 'trailer'>('stream');
  
  // Ambient Light State
  const isAmbientEnabled = settings.ambientLightEnabled !== false;
  const ambientIntensity = settings.ambientIntensity || 'normal';
  const [ambientPalette, setAmbientPalette] = useState<AmbientPalette>(DEFAULT_AMBIENT_PALETTE);
  const [ambientPulse, setAmbientPulse] = useState(1);

  // Playback state tracked via VidCore postMessage events
  const [playerState, setPlayerState] = useState<'loading' | 'playing' | 'paused' | 'ended'>('loading');
  
  // 10-second Next Episode Countdown Overlay State
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownIntervalRef = useRef<any>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<any>(null);

  const title = media.title || media.name || 'Feature Presentation';
  const isTV = media.media_type === 'tv' || Boolean(media.first_air_date) || Boolean(media.number_of_seasons);
  const trailerKey = media.trailer_key || 'Way9Dexny3w';

  // Compute theme hex for VidCore embed URL
  const currentThemeHex = THEME_COLOR_MAP[settings.accentColor] || THEME_COLOR_MAP.cyan || '06B6D4';

  // Backdrop / Poster Image URL for dominant color ambient light extraction
  const backdropUrl = useMemo(() => {
    return getBackdropUrl(media.backdrop_path, 'w1280') || 
           (media.poster_path ? getBackdropUrl(media.poster_path, 'w780') : '');
  }, [media.backdrop_path, media.poster_path]);

  // Extract dominant ambient colors from current media backdrop
  useEffect(() => {
    let isCancelled = false;
    extractAmbientPalette(backdropUrl, currentThemeHex).then((palette) => {
      if (!isCancelled) {
        setAmbientPalette(palette);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [backdropUrl, currentThemeHex]);

  // Living Ambient Pulse Cycle during active playback
  useEffect(() => {
    if (!isAmbientEnabled) return;
    const interval = setInterval(() => {
      setAmbientPulse((prev) => (prev === 1 ? 1.08 : prev === 1.08 ? 0.95 : 1));
    }, 3500);
    return () => clearInterval(interval);
  }, [isAmbientEnabled]);

  // Track stream playback analytics & persist to Cloud Firestore history
  useEffect(() => {
    trackStreamPlay(media, selectedSeason, selectedEpisode);
    const currentUser = auth.currentUser;
    if (currentUser) {
      saveCloudHistoryItem(currentUser.uid, media, selectedSeason, selectedEpisode);
    }
  }, [media, selectedSeason, selectedEpisode]);

  // Generate dynamic VidCore embed URL with full parameter support
  const embedUrl = getEmbedUrl(
    'vidcore',
    isTV ? 'tv' : 'movie',
    media.id,
    selectedSeason,
    selectedEpisode,
    0,
    currentThemeHex,
    {
      autoplay: settings.autoplayStream !== false,
      lang: settings.playerLanguage || 'en',
      showRelated: settings.playerShowRelated !== false,
      disableInfo: settings.playerDisableInfo || false,
      disableControls: settings.playerDisableControls || false,
    }
  );

  // Auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 4500);
  };

  const toggleFullscreen = () => {
    triggerHaptic('light');
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  // Toggle Ambient Light
  const toggleAmbientLight = () => {
    triggerHaptic('selection');
    const newState = !isAmbientEnabled;
    updateSettings({ ambientLightEnabled: newState });
    showToast(newState ? 'Ambient Light (Ambilight) Enabled' : 'Ambient Light Disabled', 'info');
  };

  // Cycle Ambient Intensity
  const cycleAmbientIntensity = () => {
    triggerHaptic('selection');
    const nextIntensity: 'subtle' | 'normal' | 'vivid' = 
      ambientIntensity === 'subtle' ? 'normal' :
      ambientIntensity === 'normal' ? 'vivid' : 'subtle';
    updateSettings({ ambientIntensity: nextIntensity });
    showToast(`Ambient Glow: ${nextIntensity.toUpperCase()}`, 'info');
  };

  // Trigger Next Episode Transition
  const triggerNextEpisode = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
    setPlayerState('loading');
    
    setSelectedEpisode((prev) => {
      const nextEp = prev + 1;
      triggerHaptic('success');
      showToast(`Now Playing S${selectedSeason} • Episode ${nextEp}`, 'info');
      return nextEp;
    });
  }, [selectedSeason, showToast]);

  // Start 10-Second Countdown
  const startNextEpisodeCountdown = useCallback(() => {
    if (!isTV) return;
    if (settings.autoplayNextEpisode === false) {
      setPlayerState('ended');
      return;
    }

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    setCountdown(10);
    triggerHaptic('medium');

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          triggerNextEpisode();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, [isTV, settings.autoplayNextEpisode, triggerNextEpisode]);

  // Cancel Countdown
  const cancelCountdown = () => {
    triggerHaptic('light');
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
    setPlayerState('ended');
    showToast('Auto-play cancelled');
  };

  // Replay Current Episode
  const handleReplay = () => {
    triggerHaptic('light');
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
    setPlayerState('loading');
    // Force re-render iframe
    const currentEp = selectedEpisode;
    setSelectedEpisode(0);
    setTimeout(() => setSelectedEpisode(currentEp), 50);
  };

  // VidCore PostMessage Event Listener: vidcore:play, vidcore:pause, vidcore:ended
  useEffect(() => {
    const handleWindowMessage = (event: MessageEvent) => {
      try {
        let msg = event.data;
        if (typeof msg === 'string') {
          try {
            msg = JSON.parse(msg);
          } catch {
            // Raw string message like "vidcore:ended"
          }
        }

        const eventName = typeof msg === 'string' 
          ? msg 
          : (msg?.event || msg?.type || msg?.data?.event || msg?.data?.type || '');

        if (eventName === 'vidcore:play' || eventName === 'play') {
          setPlayerState('playing');
        } else if (eventName === 'vidcore:pause' || eventName === 'pause') {
          setPlayerState('paused');
        } else if (eventName === 'vidcore:ended' || eventName === 'ended') {
          setPlayerState('ended');
          if (isTV) {
            startNextEpisodeCountdown();
          }
        }
      } catch (err) {
        console.error('Error handling postMessage:', err);
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => {
      window.removeEventListener('message', handleWindowMessage);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [isTV, startNextEpisodeCountdown]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  // Compute ambient glow opacity based on intensity setting
  const ambientOpacity = !isAmbientEnabled 
    ? 0 
    : ambientIntensity === 'subtle' 
      ? 0.35 
      : ambientIntensity === 'vivid' 
        ? 0.95 
        : 0.65;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-0 md:p-6 backdrop-blur-3xl animate-in fade-in duration-200 overflow-hidden">
      
      {/* ========================================================================= */}
      {/* AMBIENT LIGHT (AMBILIGHT) DIFFUSION GLOW LAYERS BEHIND PLAYER CONTAINER   */}
      {/* ========================================================================= */}
      {isAmbientEnabled && (
        <div 
          className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center transition-all duration-1000 ease-out"
          style={{ opacity: ambientOpacity }}
        >
          {/* 1. Ultra-Wide Atmospheric Ambient Glow Field */}
          <div 
            className="absolute w-[125vw] h-[125vh] rounded-full blur-[120px] sm:blur-[160px] transition-all duration-1000"
            style={{
              background: `radial-gradient(ellipse at center, ${ambientPalette.primary} 0%, ${ambientPalette.secondary} 40%, ${ambientPalette.tertiary} 75%, transparent 100%)`,
              transform: `scale(${ambientPulse})`,
            }}
          />

          {/* 2. Top Edge Diffuse Backlight (Crown Projection) */}
          <div 
            className="absolute top-[-5%] left-[10%] right-[10%] h-[40vh] blur-[80px] sm:blur-[100px] transition-all duration-700"
            style={{
              background: `radial-gradient(ellipse at top, ${ambientPalette.topLight} 0%, transparent 70%)`,
            }}
          />

          {/* 3. Bottom Floor Bounce Backlight */}
          <div 
            className="absolute bottom-[-5%] left-[10%] right-[10%] h-[35vh] blur-[75px] sm:blur-[95px] transition-all duration-700"
            style={{
              background: `radial-gradient(ellipse at bottom, ${ambientPalette.bottomLight} 0%, transparent 70%)`,
            }}
          />

          {/* 4. Left Flank Peripheral Ambient Wing */}
          <div 
            className="absolute top-[15%] bottom-[15%] left-[-5%] w-[35vw] blur-[80px] sm:blur-[110px] transition-all duration-700"
            style={{
              background: `radial-gradient(ellipse at left, ${ambientPalette.leftLight} 0%, transparent 75%)`,
            }}
          />

          {/* 5. Right Flank Peripheral Ambient Wing */}
          <div 
            className="absolute top-[15%] bottom-[15%] right-[-5%] w-[35vw] blur-[80px] sm:blur-[110px] transition-all duration-700"
            style={{
              background: `radial-gradient(ellipse at right, ${ambientPalette.rightLight} 0%, transparent 75%)`,
            }}
          />

          {/* 6. Intimate Container Perimeter Rim Halo */}
          <div 
            className="absolute w-[95%] h-[92%] md:max-w-6xl md:max-h-[92vh] rounded-3xl blur-[40px] sm:blur-[60px] opacity-80"
            style={{
              boxShadow: `0 0 100px 30px ${ambientPalette.accentGlow}`,
            }}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN VIDEO PLAYER CONTAINER                                               */}
      {/* ========================================================================= */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative z-10 w-full h-full md:max-w-6xl md:max-h-[92vh] md:rounded-3xl overflow-hidden bg-black border border-white/15 shadow-[0_30px_100px_rgba(0,0,0,0.9)] flex flex-col justify-between transition-shadow duration-700"
      >
        {/* Top Header Bar */}
        <div
          className={`absolute top-0 left-0 right-0 z-30 p-3.5 sm:p-5 bg-gradient-to-b from-black/95 via-black/60 to-transparent flex items-center justify-between transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              {isTV ? <Tv className="w-4 h-4" /> : <Film className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight line-clamp-1">
                {title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-white/70">
                <span className="text-cyan-400 font-semibold">{selectedQuality} HDR</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-medium">VidCore Engine</span>
                </span>
                {isTV && (
                  <>
                    <span>•</span>
                    <span className="text-amber-400 font-medium">Season {selectedSeason} • Episode {selectedEpisode}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mode Switcher, Ambient Light, Settings & Close */}
          <div className="flex items-center gap-2">
            
            {/* Ambient Light Toggle Button */}
            <button
              type="button"
              onClick={toggleAmbientLight}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                isAmbientEnabled
                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                  : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
              }`}
              title={isAmbientEnabled ? `Ambient Light (Ambilight) ON (${ambientIntensity}) - Click to toggle` : 'Ambient Light OFF - Click to enable'}
              aria-label="Toggle Ambient Light"
            >
              <Sun className={`w-4 h-4 ${isAmbientEnabled ? 'text-cyan-300 animate-spin-slow' : ''}`} />
              <span className="hidden sm:inline">
                {isAmbientEnabled ? 'Ambilight' : 'Glow Off'}
              </span>
            </button>

            {/* Ambient Intensity Cycle (If Ambient Enabled) */}
            {isAmbientEnabled && (
              <button
                type="button"
                onClick={cycleAmbientIntensity}
                className="hidden md:flex px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-[11px] font-bold text-white/80 hover:text-white items-center gap-1 transition-all cursor-pointer"
                title="Change Ambient Intensity (Subtle, Normal, Vivid)"
              >
                <Layers className="w-3 h-3 text-cyan-400" />
                <span className="uppercase">{ambientIntensity}</span>
              </button>
            )}

            {/* Stream / Trailer Toggle */}
            <div className="flex bg-white/10 rounded-xl p-0.5 border border-white/10 text-xs backdrop-blur-md">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTab('stream');
                }}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'stream'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Stream
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTab('trailer');
                }}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'trailer'
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Trailer
              </button>
            </div>

            {/* Quick Player Settings Button */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setIsSettingsOpen(true);
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer"
              title="Player & VidCore Settings"
              aria-label="Player Settings"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              title="Close Player"
              aria-label="Close Player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Canvas Body */}
        <div className="relative flex-1 w-full h-full bg-[#050508] flex items-center justify-center overflow-hidden">
          {activeTab === 'stream' ? (
            <div className="w-full h-full relative flex items-center justify-center bg-black">
              {/* Active VidCore Stream Iframe */}
              {selectedEpisode > 0 && (
                <iframe
                  key={`vidcore-${media.id}-${selectedSeason}-${selectedEpisode}-${settings.accentColor}-${settings.playerLanguage}`}
                  src={embedUrl}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  title={`${title} Stream`}
                />
              )}

              {/* 10-Second Next Episode Countdown Glassmorphic Overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="relative max-w-md w-full p-6 sm:p-8 rounded-3xl bg-[#08080f]/95 border border-cyan-500/30 shadow-[0_20px_70px_rgba(0,0,0,0.9)] text-white text-center space-y-6 backdrop-blur-2xl">
                    
                    {/* Glowing Header Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-400 text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-500/10">
                      <FastForward className="w-3.5 h-3.5" />
                      <span>Next Episode Starting</span>
                    </div>

                    {/* Circular Animated Countdown Graphic */}
                    <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Background track */}
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="currentColor"
                          strokeWidth="6"
                          className="text-white/10"
                          fill="transparent"
                        />
                        {/* Animated progress circle */}
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="currentColor"
                          strokeWidth="6"
                          className="text-cyan-400 transition-all duration-1000 ease-linear shadow-lg"
                          fill="transparent"
                          strokeDasharray={264}
                          strokeDashoffset={264 - (264 * (countdown / 10))}
                          strokeLinecap="round"
                        />
                      </svg>
                      
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-white tracking-tight">{countdown}</span>
                        <span className="text-[10px] text-white/50 uppercase font-semibold">Seconds</span>
                      </div>
                    </div>

                    {/* Episode Meta details */}
                    <div>
                      <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                        {title}
                      </h3>
                      <p className="text-xs sm:text-sm text-cyan-300 font-medium mt-1">
                        Season {selectedSeason} • Episode {selectedEpisode + 1}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={triggerNextEpisode}
                        className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white text-xs sm:text-sm font-bold transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                        <span>Play Now</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleReplay}
                        className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-semibold border border-white/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Replay Current Episode"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Replay</span>
                      </button>

                      <button
                        type="button"
                        onClick={cancelCountdown}
                        className="py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 text-white/70 hover:text-white text-xs font-semibold border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Stay</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Trailer Player */
            <iframe
              className="w-full h-full border-0"
              src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
              title={`${title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>

        {/* Bottom Control & TV Navigation Bar */}
        {activeTab === 'stream' && (
          <div className="px-4 py-2.5 bg-black/90 border-t border-white/10 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            
            {/* VidCore Engine Identity (Exclusive Single Provider) */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 font-semibold text-xs">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                <span>VidCore Engine</span>
              </div>
              <span className="hidden sm:inline text-[11px] text-white/40">
                Audio: <span className="text-white/80 font-medium">{settings.playerLanguage?.toUpperCase() || 'EN'}</span>
              </span>
            </div>

            {/* TV Series Episode & Season Navigation (If Watching TV Show) */}
            {isTV && (
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                <span className="text-white/50 text-[10px] font-bold uppercase tracking-wider mr-1">
                  Episodes:
                </span>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((ep) => (
                  <button
                    key={ep}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      if (countdownIntervalRef.current) {
                        clearInterval(countdownIntervalRef.current);
                        countdownIntervalRef.current = null;
                      }
                      setCountdown(null);
                      setSelectedEpisode(ep);
                      showToast(`Switched to Episode ${ep}`);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedEpisode === ep
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-md scale-105'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5'
                    }`}
                  >
                    EP {ep}
                  </button>
                ))}

                {/* Quick Next Episode Button */}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('medium');
                    setSelectedEpisode((prev) => prev + 1);
                    showToast(`Playing Episode ${selectedEpisode + 1}`);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-cyan-300 border border-cyan-400/20 transition-all cursor-pointer flex items-center gap-1 ml-1"
                  title="Skip to Next Episode"
                >
                  <SkipForward className="w-3 h-3" />
                  <span className="hidden sm:inline">Next Ep</span>
                </button>

                {/* Test Countdown Demo Button for quick evaluation */}
                <button
                  type="button"
                  onClick={startNextEpisodeCountdown}
                  className="px-2 py-1 rounded-lg text-[10px] font-medium text-amber-400 hover:bg-amber-400/10 border border-amber-400/30 transition-all cursor-pointer flex items-center gap-1"
                  title="Simulate Episode End (10s Countdown)"
                >
                  <Clock className="w-3 h-3" />
                  <span className="hidden md:inline">Test Countdown</span>
                </button>
              </div>
            )}

            {/* Quick Actions & Fullscreen */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                title="Fullscreen Mode"
                aria-label="Fullscreen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
