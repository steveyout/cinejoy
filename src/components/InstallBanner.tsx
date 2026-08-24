import React, { useState, useMemo } from 'react';
import { Download, X, Smartphone, Share2, PlusSquare, CheckCircle2, Sparkles, Film, Tv, Play } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { getDomainBranding } from '../utils/domainBranding';

export const InstallBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { showToast } = useApp();
  const { isInstalled, isIOS, triggerInstall } = usePWAInstall();
  const branding = useMemo(() => getDomainBranding(), []);

  // If already installed in standalone mode or dismissed by user, do not render banner
  if (isInstalled || dismissed) return null;

  const handleInstallClick = async () => {
    try {
      const result = await triggerInstall();

      if (result === 'accepted') {
        showToast(`${branding.brandShortName} PWA installed successfully! Enjoy standalone cinema playback.`, 'success');
        setDismissed(true);
      } else if (result === 'ios') {
        setShowIOSGuide(true);
      } else if (result === 'unsupported') {
        showToast(`To install ${branding.brandShortName}, open your browser menu (⋮ or ⎋) and select "Install ${branding.brandShortName}" or "Add to Home Screen".`, 'info');
      }
    } catch {
      showToast(`To install ${branding.brandShortName}, click the install icon in your browser URL bar or Share menu.`, 'info');
    }
  };

  return (
    <>
      <div className="relative mx-4 sm:mx-6 my-4 p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300 overflow-hidden">
        {/* Glow ambient highlight */}
        <div 
          className="absolute -top-12 left-1/4 w-40 h-20 blur-3xl pointer-events-none opacity-40" 
          style={{ backgroundColor: branding.badgeGlowColor }}
        />

        <div className="flex items-center gap-3 min-w-0 z-10">
          {/* Brand Badge Icon */}
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${branding.accentGradient} border border-white/25 flex items-center justify-center flex-shrink-0 text-white shadow-lg`}>
            <Download className="w-5 h-5 drop-shadow animate-bounce" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-white tracking-tight truncate">
                Install {branding.brandShortName} PWA App
              </h4>
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-white/10 text-white/90 border border-white/20">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" /> PWA
              </span>
            </div>
            <p className="text-xs text-white/70 truncate">
              Offline watchlist cache, full-screen playback & zero latency
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 z-10">
          <button
            id="install-pwa-btn"
            onClick={handleInstallClick}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r ${branding.accentGradient} active:scale-95 text-white text-xs font-black transition-all shadow-md border border-white/20 cursor-pointer`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            id="dismiss-pwa-banner"
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Installation Instruction Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-sm bg-[#0d0d14] border border-white/15 rounded-3xl p-6 shadow-2xl text-center">
            {/* Close Button */}
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${branding.accentGradient} flex items-center justify-center shadow-lg`}>
              <Download className="w-7 h-7 text-white" />
            </div>

            <h3 className="text-lg font-black text-white mb-1">
              Install {branding.brandShortName} on iOS
            </h3>
            <p className="text-xs text-white/70 mb-5">
              Follow these simple steps in Safari to add {branding.brandShortName} to your iPhone or iPad home screen:
            </p>

            <div className="space-y-3 text-left bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div className="text-xs text-white/90 flex-1">
                  Tap the <span className="font-bold text-cyan-400 inline-flex items-center gap-1"><Share2 className="w-3 h-3 inline" /> Share</span> button in the bottom Safari toolbar.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div className="text-xs text-white/90 flex-1">
                  Scroll down and tap <span className="font-bold text-cyan-400 inline-flex items-center gap-1"><PlusSquare className="w-3 h-3 inline" /> Add to Home Screen</span>.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div className="text-xs text-white/90 flex-1">
                  Tap <span className="font-bold text-cyan-400">Add</span> in the top right corner. {branding.brandShortName} will launch like a native app!
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowIOSGuide(false);
                showToast(`Enjoy ${branding.brandShortName} directly from your home screen!`, 'success');
              }}
              className={`w-full py-3 rounded-xl bg-gradient-to-r ${branding.accentGradient} text-white text-xs font-bold shadow-lg active:scale-95 transition-all cursor-pointer`}
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
