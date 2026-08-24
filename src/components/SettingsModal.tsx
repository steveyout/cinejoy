import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Key, 
  Sparkles, 
  SlidersHorizontal, 
  RefreshCw, 
  ShieldCheck, 
  ExternalLink, 
  Check, 
  Play, 
  Clock, 
  Globe, 
  FastForward,
  Tv,
  Film,
  Subtitles,
  EyeOff,
  Sun,
  Layers,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { triggerHaptic } from '../utils/haptics';
import { GLASS_TINTS, getGlassTintConfig } from '../utils/themeStyles';
import { GlassmorphismTint } from '../types';
import { getDomainBranding } from '../utils/domainBranding';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen, settings, updateSettings, showToast } = useApp();
  const [apiKeyInput, setApiKeyInput] = useState(settings.tmdbApiKey || '');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const branding = useMemo(() => getDomainBranding(), []);

  // Keep local input in sync with settings
  useEffect(() => {
    if (isSettingsOpen) {
      setApiKeyInput(settings.tmdbApiKey || '');
    }
  }, [isSettingsOpen, settings.tmdbApiKey]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isSettingsOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsOpen, setIsSettingsOpen]);

  const handleSaveApiKey = () => {
    updateSettings({ tmdbApiKey: apiKeyInput.trim() });
    showToast('TMDB API Key updated successfully');
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    try {
      const testKey = apiKeyInput.trim() || 'addfba41d0cb5aba2ebaae12ac92b671';
      const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${testKey}&page=1`);
      if (res.ok) {
        setTestStatus('success');
        showToast('TMDB API Connection verified & active!');
      } else {
        setTestStatus('error');
        showToast('Invalid TMDB API key. Please check credentials.', 'info');
      }
    } catch {
      setTestStatus('error');
      showToast('Network error while testing connection.', 'info');
    }
  };

  const accentColors = [
    { id: 'cyan', name: 'Electric Cyan', class: 'bg-cyan-500 text-black' },
    { id: 'amber', name: 'Popcorn Amber', class: 'bg-amber-500 text-black' },
    { id: 'rose', name: 'Crimson Rose', class: 'bg-rose-500 text-white' },
    { id: 'emerald', name: 'Emerald Glow', class: 'bg-emerald-500 text-black' },
    { id: 'purple', name: 'Royal Violet', class: 'bg-purple-500 text-white' },
  ];

  const audioLanguages = [
    { code: 'en', label: 'English (EN)' },
    { code: 'es', label: 'Spanish (ES)' },
    { code: 'fr', label: 'French (FR)' },
    { code: 'de', label: 'German (DE)' },
    { code: 'it', label: 'Italian (IT)' },
    { code: 'pt', label: 'Portuguese (PT)' },
    { code: 'ja', label: 'Japanese (JA)' },
    { code: 'ko', label: 'Korean (KO)' },
  ];

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <motion.div
          id="settings-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-4"
          onClick={() => setIsSettingsOpen(false)}
        >
          <motion.div
            id="settings-modal-card"
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto scrollbar-none rounded-3xl bg-[#06060c]/95 border border-white/15 shadow-[0_25px_80px_rgba(0,0,0,0.95)] p-5 sm:p-7 text-white space-y-6 backdrop-blur-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 text-cyan-400 flex items-center justify-center shadow-md">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">VidCore & Stream Settings</h2>
                  <p className="text-xs text-white/50">Next-gen parameters, episodes & player configurations</p>
                </div>
              </div>

              {/* Close Button */}
              <button
                id="close-settings-modal-btn"
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title="Close settings (Esc)"
                aria-label="Close settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. VidCore Episode & Next Episode Parameters */}
            <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
                  <Tv className="w-4 h-4 text-cyan-400" />
                  <span>TV Episode Automation & Events</span>
                </label>
                <span className="text-[10px] text-cyan-300 font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/30">
                  VidCore Active
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {/* Autoplay Next Episode Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                  <div className="pr-3">
                    <span className="text-xs font-bold text-white block">
                      Auto-Advance Next Episode (10s Countdown)
                    </span>
                    <span className="text-[11px] text-white/50 block mt-0.5 leading-relaxed">
                      Detects when stream ends (<code className="text-cyan-400">vidcore:ended</code>) and starts a 10s countdown to next episode.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      updateSettings({ autoplayNextEpisode: settings.autoplayNextEpisode === false ? true : false });
                    }}
                    className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                      settings.autoplayNextEpisode !== false ? 'bg-cyan-500' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                        settings.autoplayNextEpisode !== false ? 'transform translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Autoplay Trailers on Movie Details Open */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                  <div className="pr-3">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-amber-400" />
                      <span>Autoplay Trailers in Movie Details</span>
                    </span>
                    <span className="text-[11px] text-white/50 block mt-0.5 leading-relaxed">
                      Automatically streams official YouTube trailer previews when opening any movie or TV series modal.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      const nextVal = settings.autoPlayTrailers === false ? true : false;
                      updateSettings({ autoPlayTrailers: nextVal });
                      showToast(nextVal ? 'Trailer Autoplay Enabled' : 'Trailer Autoplay Disabled');
                    }}
                    className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                      settings.autoPlayTrailers !== false ? 'bg-cyan-500' : 'bg-white/20'
                    }`}
                    aria-label="Toggle Autoplay Trailers"
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                        settings.autoPlayTrailers !== false ? 'transform translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Autoplay Stream On Load */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                  <div className="pr-3">
                    <span className="text-xs font-bold text-white block">
                      Auto-Play Stream on Launch (<code className="text-cyan-400">autoplay</code>)
                    </span>
                    <span className="text-[11px] text-white/50 block mt-0.5 leading-relaxed">
                      Starts streaming immediately when the video player opens.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      updateSettings({ autoplayStream: settings.autoplayStream === false ? true : false });
                    }}
                    className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                      settings.autoplayStream !== false ? 'bg-cyan-500' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                        settings.autoplayStream !== false ? 'transform translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Audio Language Track (lang parameter) */}
            <div className="space-y-2.5 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <label className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Default Audio Language (<code className="text-cyan-400">lang</code>)</span>
              </label>
              <p className="text-[11px] text-white/50">
                Sets default audio track language automatically in the VidCore video stream.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {audioLanguages.map((lang) => {
                  const isSelected = (settings.playerLanguage || 'en') === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        triggerHaptic('selection');
                        updateSettings({ playerLanguage: lang.code });
                        showToast(`Audio language set to ${lang.label}`);
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                        isSelected
                          ? 'bg-cyan-500 text-black border-cyan-400 font-bold shadow-md scale-105'
                          : 'bg-white/5 text-white/70 border-white/10 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {lang.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. In-Player Display & Controls Parameters (showRelated, disableInfo, disableControls) */}
            <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <label className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Player Overlay Parameters</span>
              </label>

              <div className="space-y-2.5">
                {/* showRelated */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/10">
                  <div>
                    <span className="text-xs font-bold text-white block">In-Player Recommendations (<code className="text-cyan-400">showRelated</code>)</span>
                    <span className="text-[11px] text-white/50">Appends relevant media recommendations inside player</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      updateSettings({ playerShowRelated: settings.playerShowRelated === false ? true : false });
                    }}
                    className={`relative w-11 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                      settings.playerShowRelated !== false ? 'bg-cyan-500' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        settings.playerShowRelated !== false ? 'transform translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* disableInfo */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/10">
                  <div>
                    <span className="text-xs font-bold text-white block">Hide Subtitle Info Pill (<code className="text-cyan-400">disableInfo</code>)</span>
                    <span className="text-[11px] text-white/50">Controls whether the inline subtitle button is shown or hidden</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      updateSettings({ playerDisableInfo: !settings.playerDisableInfo });
                    }}
                    className={`relative w-11 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                      settings.playerDisableInfo ? 'bg-cyan-500' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        settings.playerDisableInfo ? 'transform translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Ambient Light (Ambilight) Glow Settings */}
            <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-cyan-400" />
                  <span>Ambient Light (Ambilight Effect)</span>
                </label>
                <span className="text-[10px] text-cyan-300 font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/30">
                  Dominant Color Glow
                </span>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed">
                Dynamically extracts dominant frame and backdrop colors from the current media to cast an immersive, cinema-grade backlight around the player.
              </p>

              <div className="space-y-2.5 pt-1">
                {/* Enable Ambient Glow */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/10">
                  <div>
                    <span className="text-xs font-bold text-white block">Enable Ambient Light Glow</span>
                    <span className="text-[11px] text-white/50">Soft peripheral halo synced to movie artwork</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      updateSettings({ ambientLightEnabled: settings.ambientLightEnabled === false ? true : false });
                    }}
                    className={`relative w-11 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                      settings.ambientLightEnabled !== false ? 'bg-cyan-500' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        settings.ambientLightEnabled !== false ? 'transform translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Ambient Glow Intensity */}
                {settings.ambientLightEnabled !== false && (
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
                    <span className="text-xs font-bold text-white block">Ambient Glow Intensity</span>
                    <div className="grid grid-cols-3 gap-2">
                      {(['subtle', 'normal', 'vivid'] as const).map((lvl) => {
                        const isSel = (settings.ambientIntensity || 'normal') === lvl;
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => {
                              triggerHaptic('selection');
                              updateSettings({ ambientIntensity: lvl });
                              showToast(`Ambient Intensity: ${lvl.toUpperCase()}`);
                            }}
                            className={`py-1.5 px-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer text-center ${
                              isSel
                                ? 'bg-cyan-500 text-black shadow-md scale-105'
                                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                            }`}
                          >
                            {lvl}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Glassmorphism Tint Atmosphere (Violet, Emerald, Rose, Cyan, Amber, Midnight) */}
            <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-purple-400" />
                  <span>Glassmorphism Tint & Atmosphere</span>
                </label>
                <span className="text-[10px] text-white/50 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                  Global Background & Accents
                </span>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed">
                Choose a glassmorphism ambient tone. This dynamically updates the entire application's radial lighting, glass gradients, and highlight hues.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {(Object.keys(GLASS_TINTS) as GlassmorphismTint[]).map((tintKey) => {
                  const t = GLASS_TINTS[tintKey];
                  const isSelected = (settings.glassTint || 'violet') === tintKey;
                  return (
                    <button
                      key={tintKey}
                      type="button"
                      onClick={() => {
                        triggerHaptic('medium');
                        updateSettings({ 
                          glassTint: tintKey, 
                          accentColor: t.accentColor as any 
                        });
                        showToast(`Atmosphere switched to ${t.name}`);
                      }}
                      className={`relative p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between overflow-hidden group ${
                        isSelected
                          ? 'border-white/40 bg-white/10 shadow-lg scale-[1.02]'
                          : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                      }`}
                      style={{
                        boxShadow: isSelected ? t.glowShadow : undefined,
                      }}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-3.5 h-3.5 rounded-full shadow-sm flex-shrink-0"
                            style={{ backgroundColor: t.swatchHex }}
                          />
                          <span className="text-xs font-bold text-white leading-tight">
                            {t.name}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center text-[10px] font-black">
                            ✓
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-white/50 line-clamp-1 leading-snug">
                        {t.subtitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. TMDB API Key Configuration */}
            <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>TMDB API v3 Key (Optional)</span>
                </label>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" /> Live Proxy Active
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="e.g. 8a3f9104..."
                  className="flex-1 px-3 py-2 text-xs bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:border-cyan-400/50 outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold active:scale-95 transition-all shadow-md cursor-pointer"
                >
                  Save
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testStatus === 'testing'}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
                  <span>Test TMDB Connection</span>
                </button>
                <a
                  href="https://www.themoviedb.org/settings/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white/50 hover:text-white flex items-center gap-1"
                >
                  Get Free Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Done / Close Bottom Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
              <div className="text-[11px] text-white/40">
                <span>VidCore Engine • {branding.brandShortName} Cinema</span>
              </div>
              <button
                type="button"
                id="done-settings-btn"
                onClick={() => setIsSettingsOpen(false)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save & Done</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
