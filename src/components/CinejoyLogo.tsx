import React, { useMemo } from 'react';
import { getDomainBranding } from '../utils/domainBranding';
import { Tv, Film, Play, Sparkles, Clapperboard } from 'lucide-react';

interface CinejoyLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  subtitleText?: string;
  onClick?: () => void;
  className?: string;
}

export const CinejoyLogo: React.FC<CinejoyLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  subtitleText,
  onClick,
  className = '',
}) => {
  const branding = useMemo(() => getDomainBranding(), []);

  const sizeMap = {
    sm: {
      box: 'w-8 h-8 rounded-xl',
      svg: 'w-4.5 h-4.5',
      title: 'text-base font-black',
      sub: 'text-[8px]',
      dot: 'w-1.5 h-1.5',
      hqPill: 'px-1 py-0.2 text-[9px]',
    },
    md: {
      box: 'w-10 h-10 rounded-2xl',
      svg: 'w-5.5 h-5.5',
      title: 'text-xl sm:text-2xl font-black',
      sub: 'text-[9px] sm:text-[10px]',
      dot: 'w-2 h-2',
      hqPill: 'px-1.5 py-0.5 text-[10px]',
    },
    lg: {
      box: 'w-12 h-12 rounded-2xl',
      svg: 'w-7 h-7',
      title: 'text-2xl sm:text-3xl font-black',
      sub: 'text-xs',
      dot: 'w-2.5 h-2.5',
      hqPill: 'px-2 py-0.5 text-xs',
    },
  }[size];

  const { logoType } = branding;

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 select-none group cursor-pointer ${className}`}
    >
      {/* Brand Badge Icon */}
      {logoType === 'flixhq' && (
        <div
          className={`${sizeMap.box} relative flex items-center justify-center bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 shadow-[0_0_20px_rgba(16,185,129,0.45)] group-hover:shadow-[0_0_28px_rgba(20,184,166,0.7)] border border-emerald-300/40 group-hover:scale-105 transition-all duration-300 overflow-hidden flex-shrink-0`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/30 pointer-events-none" />
          <Play className={`${sizeMap.svg} text-white fill-white drop-shadow-md transform ml-0.5 group-hover:scale-110 transition-transform duration-300`} />
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-cyan-300 rounded-full blur-[1.5px] opacity-80 group-hover:opacity-100 transition-opacity" />
        </div>
      )}

      {logoType === 'bingebox' && (
        <div
          className={`${sizeMap.box} relative flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 shadow-[0_0_20px_rgba(147,51,234,0.4)] group-hover:shadow-[0_0_28px_rgba(168,85,247,0.65)] border border-purple-300/30 group-hover:scale-105 transition-all duration-300 overflow-hidden flex-shrink-0`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/25 pointer-events-none" />
          <Tv className={`${sizeMap.svg} text-white drop-shadow-md transform group-hover:scale-110 transition-transform duration-300`} />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400 rounded-full blur-[1px] opacity-70 group-hover:opacity-100 transition-opacity" />
        </div>
      )}

      {/* Cinejoy Default Branding Badge */}
      {(logoType === 'cinejoy' || logoType === 'popcorn') && (
        <div
          className={`${sizeMap.box} relative flex items-center justify-center bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 shadow-[0_0_22px_rgba(245,158,11,0.45)] group-hover:shadow-[0_0_30px_rgba(244,63,94,0.7)] border border-amber-300/40 group-hover:scale-105 transition-all duration-300 overflow-hidden flex-shrink-0`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/30 pointer-events-none" />
          <Film className={`${sizeMap.svg} text-white drop-shadow-md transform group-hover:scale-110 transition-transform duration-300`} />
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-300 rounded-full blur-[1px] opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-purple-400 rounded-full blur-[1px] opacity-60" />
        </div>
      )}

      {/* Brand Text Rendering */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          {logoType === 'flixhq' ? (
            <div className="flex items-center gap-1">
              <span className={`${sizeMap.title} tracking-tight text-white font-sans uppercase group-hover:text-emerald-300 transition-colors`}>
                FLIX
              </span>
              <span className={`${sizeMap.hqPill} rounded-md bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-black uppercase tracking-wider shadow-[0_0_12px_rgba(16,185,129,0.7)] ml-0.5`}>
                HQ
              </span>
              <span className={`${sizeMap.dot} rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)] animate-pulse ml-0.5`} />
            </div>
          ) : logoType === 'bingebox' ? (
            <div className="flex items-center gap-1">
              <span className={`${sizeMap.title} tracking-tight text-white font-sans uppercase group-hover:text-purple-300 transition-colors`}>
                {branding.brandShortName}
              </span>
              <span className={`${sizeMap.dot} rounded-full bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.9)] animate-pulse ml-0.5`} />
            </div>
          ) : (
            <div className="flex items-center gap-0.5">
              <span className={`${sizeMap.title} tracking-tight text-white font-sans uppercase`}>
                CINE
              </span>
              <span className={`${sizeMap.title} tracking-tight bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500 bg-clip-text text-transparent font-sans uppercase drop-shadow-sm`}>
                JOY
              </span>
              <span className={`${sizeMap.dot} rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse ml-1`} />
            </div>
          )}
        </div>

        {showSubtitle && (
          <span
            className={`${sizeMap.sub} font-bold tracking-[0.22em] ${
              logoType === 'flixhq'
                ? 'text-emerald-400/80 group-hover:text-emerald-300'
                : logoType === 'bingebox'
                ? 'text-purple-400/80 group-hover:text-purple-300'
                : 'text-amber-400/80 group-hover:text-amber-300'
            } uppercase -mt-0.5 transition-colors`}
          >
            {subtitleText || branding.brandSub}
          </span>
        )}
      </div>
    </div>
  );
};

export const PopcornLogo = CinejoyLogo;
