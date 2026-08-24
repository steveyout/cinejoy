import React from 'react';

interface RatingRingProps {
  rating: number; // 0 to 10 scale from TMDB
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showPercentSymbol?: boolean;
}

export const RatingRing: React.FC<RatingRingProps> = ({
  rating,
  size = 'md',
  className = '',
  showPercentSymbol = true,
}) => {
  // TMDB ratings are 0-10, convert to 0-100%
  const percentage = rating > 0 ? Math.min(100, Math.round(rating * 10)) : 0;
  const isUnrated = !rating || rating <= 0;

  // Sizing configurations
  const config = {
    sm: {
      dimension: 34,
      strokeWidth: 3,
      radius: 13,
      textSize: 'text-[10px]',
      percentSize: 'text-[6px]',
    },
    md: {
      dimension: 40,
      strokeWidth: 3.5,
      radius: 15.5,
      textSize: 'text-[11px]',
      percentSize: 'text-[7px]',
    },
    lg: {
      dimension: 48,
      strokeWidth: 4,
      radius: 19,
      textSize: 'text-[14px]',
      percentSize: 'text-[8px]',
    },
  }[size];

  const circumference = 2 * Math.PI * config.radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine color scheme based on TMDB rating score
  const getColorScheme = () => {
    if (isUnrated) {
      return {
        track: 'rgba(255, 255, 255, 0.1)',
        progress: 'rgba(255, 255, 255, 0.3)',
        text: 'text-white/60',
        glow: 'none',
      };
    }
    if (percentage >= 70) {
      return {
        track: 'rgba(16, 185, 129, 0.2)',
        progress: '#10b981', // Emerald green
        text: 'text-emerald-400',
        glow: '0 0 10px rgba(16, 185, 129, 0.4)',
      };
    }
    if (percentage >= 50) {
      return {
        track: 'rgba(245, 158, 11, 0.2)',
        progress: '#f59e0b', // Amber yellow
        text: 'text-amber-400',
        glow: '0 0 10px rgba(245, 158, 11, 0.4)',
      };
    }
    return {
      track: 'rgba(244, 63, 94, 0.2)',
      progress: '#f43f5e', // Crimson rose
      text: 'text-rose-400',
      glow: '0 0 10px rgba(244, 63, 94, 0.4)',
    };
  };

  const colors = getColorScheme();

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-[#050508]/85 backdrop-blur-xl border border-white/20 shadow-xl shadow-black/80 select-none ${className}`}
      style={{
        width: config.dimension,
        height: config.dimension,
        boxShadow: `0 4px 12px rgba(0, 0, 0, 0.6), ${colors.glow}`,
      }}
      title={`TMDB User Score: ${isUnrated ? 'Not Rated' : `${percentage}%`}`}
    >
      <svg
        width={config.dimension}
        height={config.dimension}
        className="transform -rotate-90"
      >
        {/* Background Track Circle */}
        <circle
          cx={config.dimension / 2}
          cy={config.dimension / 2}
          r={config.radius}
          stroke={colors.track}
          strokeWidth={config.strokeWidth}
          fill="transparent"
        />
        {/* Active Progress Arc */}
        {!isUnrated && (
          <circle
            cx={config.dimension / 2}
            cy={config.dimension / 2}
            r={config.radius}
            stroke={colors.progress}
            strokeWidth={config.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        )}
      </svg>

      {/* Inner Percentage Text */}
      <div className="absolute inset-0 flex items-center justify-center font-bold tracking-tight text-white leading-none">
        {isUnrated ? (
          <span className="text-[9px] font-semibold text-white/50">NR</span>
        ) : (
          <div className="flex items-start">
            <span className={`${config.textSize} font-extrabold`}>{percentage}</span>
            {showPercentSymbol && (
              <span className={`${config.percentSize} font-bold text-white/60 ml-[0.5px] -mt-[1px]`}>
                %
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
