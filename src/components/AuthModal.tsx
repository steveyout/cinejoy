import React from 'react';
import { X, ShieldCheck, Sparkles, Cloud, Film, Tv, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { triggerHaptic } from '../utils/haptics';
import { PopcornLogo } from './PopcornLogo';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, signInWithGoogle, isLoading } = useAuth();

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    triggerHaptic('medium');
    try {
      await signInWithGoogle();
    } catch (e) {
      // Handled
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-200"
        onClick={() => setIsAuthModalOpen(false)}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md rounded-3xl bg-[#080811]/95 border border-white/15 shadow-[0_25px_80px_rgba(0,0,0,0.95)] p-6 sm:p-8 text-white space-y-6 backdrop-blur-2xl text-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo & Headline */}
          <div className="flex flex-col items-center pt-2">
            <PopcornLogo size="lg" showSubtitle={false} />
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-4">
              Sign In to Your Cloud Cinema
            </h2>
            <p className="text-xs sm:text-sm text-white/60 mt-1.5 max-w-xs">
              Synchronize your watchlist, viewing history, and stream preferences across all your devices in real time.
            </p>
          </div>

          {/* Cloud Benefits Pill List */}
          <div className="space-y-2.5 text-left bg-white/5 p-4 rounded-2xl border border-white/10 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
                <Cloud className="w-4 h-4" />
              </div>
              <span className="text-white/80 font-medium">Real-Time Firebase Cloud Firestore Sync</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                <Film className="w-4 h-4" />
              </div>
              <span className="text-white/80 font-medium">Cross-Device Watchlist & Favorites</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-white/80 font-medium">Personalized Analytics & Viewing Telemetry</span>
            </div>
          </div>

          {/* Google Sign-In Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-slate-100 active:scale-98 text-slate-900 font-bold text-sm transition-all shadow-xl shadow-white/10 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              {/* Google G SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{isLoading ? 'Signing In...' : 'Continue with Google'}</span>
            </button>

            <p className="text-[11px] text-white/40 mt-3">
              Protected by Firebase Authentication & Zero-Trust ABAC Firestore Rules.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
