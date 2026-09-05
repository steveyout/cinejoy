import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  LogOut, 
  Cloud, 
  ShieldCheck, 
  Activity, 
  Film, 
  Clock, 
  Flame, 
  BarChart3, 
  Sparkles,
  Search,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { triggerHaptic } from '../utils/haptics';
import { subscribeCloudAnalytics, CloudAnalyticsEvent } from '../services/firestoreSync';
import { getDomainBranding } from '../utils/domainBranding';

export const UserProfileModal: React.FC = () => {
  const { user, userProfile, isProfileModalOpen, setIsProfileModalOpen, signOut } = useAuth();
  const { watchlist, recentSearches } = useApp();
  const [events, setEvents] = useState<CloudAnalyticsEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'stats' | 'events'>('stats');
  const branding = useMemo(() => getDomainBranding(), []);

  useEffect(() => {
    if (!user || !isProfileModalOpen) return;
    const unsub = subscribeCloudAnalytics(user.uid, (data) => {
      setEvents(data);
    });
    return () => unsub();
  }, [user, isProfileModalOpen]);

  if (!isProfileModalOpen || !user) return null;

  const totalFavorites = watchlist.filter(w => w.isFavorite).length;
  const totalWatched = watchlist.filter(w => w.watched).length;

  const handleSignOut = async () => {
    triggerHaptic('medium');
    await signOut();
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
        onClick={() => setIsProfileModalOpen(false)}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg rounded-3xl bg-[#080811]/95 border border-white/15 shadow-[0_25px_80px_rgba(0,0,0,0.95)] p-5 sm:p-7 text-white space-y-5 backdrop-blur-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              {/* User Avatar */}
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'User'} 
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-2xl border-2 border-indigo-500 shadow-md object-cover" 
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 border-2 border-indigo-400/40 flex items-center justify-center text-base font-black text-white shadow-md">
                  {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white tracking-tight line-clamp-1">
                    {user.displayName || `${branding.brandShortName} Moviegoer`}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                    <Cloud className="w-2.5 h-2.5" />
                    <span>Cloud Synced</span>
                  </span>
                </div>
                <p className="text-xs text-white/50">{user.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Tab Switcher */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('stats')}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'stats' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Cinema Analytics</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('events')}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'events' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Live Telemetry Log ({events.length})</span>
            </button>
          </div>

          {/* Tab 1: Cinema Analytics */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              {/* 3 Metric Cards */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <span className="text-xl font-black text-indigo-400 block">{watchlist.length}</span>
                  <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Watchlist</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <span className="text-xl font-black text-rose-400 block">{totalFavorites}</span>
                  <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Favorites</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <span className="text-xl font-black text-emerald-400 block">{totalWatched}</span>
                  <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Watched</span>
                </div>
              </div>

              {/* Recent Cloud Search Queries */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white/80 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Recent Cloud Searches</span>
                  </span>
                  <span className="text-[10px] text-white/40">{recentSearches.length} queries</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {recentSearches.map((term, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[11px] text-white/70">
                      {term}
                    </span>
                  ))}
                </div>
              </div>

              {/* Security & Cloud Firestore Status */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-transparent border border-emerald-500/20 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-emerald-300 block">Encrypted Zero-Trust Cloud Storage</span>
                  <span className="text-[11px] text-white/60">Your private library is protected by Firestore ABAC rules and Google Auth.</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Live Activity Telemetry Log */}
          {activeTab === 'events' && (
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-none">
              {events.length === 0 ? (
                <div className="py-8 text-center text-white/40 text-xs">
                  No telemetry events recorded yet. Start watching or browsing movies!
                </div>
              ) : (
                events.map((evt) => (
                  <div key={evt.id} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <div>
                        <span className="font-semibold text-white capitalize block">
                          {evt.eventName.replace(/_/g, ' ')}
                        </span>
                        {evt.mediaTitle && (
                          <span className="text-[11px] text-indigo-300 block line-clamp-1">
                            {evt.mediaTitle}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-white/40 font-mono">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Footer & Sign Out Action */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-[11px] text-white/40">Firebase Auth & Analytics</span>
            <button
              type="button"
              onClick={handleSignOut}
              className="py-2 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 hover:text-rose-300 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
