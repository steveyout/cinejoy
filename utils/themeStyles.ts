import { GlassmorphismTint } from '../types';

export interface GlassTintConfig {
  id: GlassmorphismTint;
  name: string;
  subtitle: string;
  radialBackground: string;
  ambientGlow: string;
  accentColor: 'purple' | 'emerald' | 'rose' | 'cyan' | 'amber';
  badgeClass: string;
  activePillClass: string;
  glowShadow: string;
  borderClass: string;
  swatchHex: string;
  gradientText: string;
}

export const GLASS_TINTS: Record<GlassmorphismTint, GlassTintConfig> = {
  violet: {
    id: 'violet',
    name: 'Royal Violet',
    subtitle: 'Deep amethyst & neon indigo ambient glass',
    radialBackground: 'radial-gradient(circle at 10% 0%, #20103a 0%, #050508 50%), radial-gradient(circle at 90% 100%, #38155c 0%, #050508 55%)',
    ambientGlow: '#8b5cf6',
    accentColor: 'purple',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    activePillClass: 'bg-purple-600 text-white shadow-purple-600/30',
    glowShadow: '0 0 40px -10px rgba(139, 92, 246, 0.35)',
    borderClass: 'border-purple-500/20',
    swatchHex: '#8B5CF6',
    gradientText: 'from-purple-400 via-indigo-300 to-pink-400',
  },
  emerald: {
    id: 'emerald',
    name: 'Cyber Emerald',
    subtitle: 'Lush jade & matrix aurora ambient glass',
    radialBackground: 'radial-gradient(circle at 10% 0%, #062618 0%, #030805 50%), radial-gradient(circle at 90% 100%, #0d3d25 0%, #030805 55%)',
    ambientGlow: '#10b981',
    accentColor: 'emerald',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    activePillClass: 'bg-emerald-500 text-black shadow-emerald-500/30 font-bold',
    glowShadow: '0 0 40px -10px rgba(16, 185, 129, 0.35)',
    borderClass: 'border-emerald-500/20',
    swatchHex: '#10B981',
    gradientText: 'from-emerald-400 via-teal-300 to-cyan-400',
  },
  rose: {
    id: 'rose',
    name: 'Crimson Rose',
    subtitle: 'Ruby neon & velvet dusk ambient glass',
    radialBackground: 'radial-gradient(circle at 10% 0%, #340c17 0%, #080305 50%), radial-gradient(circle at 90% 100%, #4e1123 0%, #080305 55%)',
    ambientGlow: '#f43f5e',
    accentColor: 'rose',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    activePillClass: 'bg-rose-600 text-white shadow-rose-600/30',
    glowShadow: '0 0 40px -10px rgba(244, 63, 94, 0.35)',
    borderClass: 'border-rose-500/20',
    swatchHex: '#F43F5E',
    gradientText: 'from-rose-400 via-pink-300 to-amber-300',
  },
  cyan: {
    id: 'cyan',
    name: 'Electric Cyan',
    subtitle: 'Deep oceanic & cyan neon ambient glass',
    radialBackground: 'radial-gradient(circle at 10% 0%, #072535 0%, #03060a 50%), radial-gradient(circle at 90% 100%, #0c3a50 0%, #03060a 55%)',
    ambientGlow: '#06b6d4',
    accentColor: 'cyan',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    activePillClass: 'bg-cyan-500 text-black shadow-cyan-500/30 font-bold',
    glowShadow: '0 0 40px -10px rgba(6, 182, 212, 0.35)',
    borderClass: 'border-cyan-500/20',
    swatchHex: '#06B6D4',
    gradientText: 'from-cyan-400 via-blue-300 to-indigo-400',
  },
  amber: {
    id: 'amber',
    name: 'Popcorn Amber',
    subtitle: 'Golden honey & warm dusk ambient glass',
    radialBackground: 'radial-gradient(circle at 10% 0%, #301d07 0%, #080603 50%), radial-gradient(circle at 90% 100%, #4d2f09 0%, #080603 55%)',
    ambientGlow: '#f59e0b',
    accentColor: 'amber',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    activePillClass: 'bg-amber-500 text-black shadow-amber-500/30 font-bold',
    glowShadow: '0 0 40px -10px rgba(245, 158, 11, 0.35)',
    borderClass: 'border-amber-500/20',
    swatchHex: '#F59E0B',
    gradientText: 'from-amber-400 via-yellow-300 to-orange-400',
  },
  midnight: {
    id: 'midnight',
    name: 'Obsidian Midnight',
    subtitle: 'Pure monochromatic slate & graphite studio glass',
    radialBackground: 'radial-gradient(circle at 10% 0%, #121929 0%, #030712 50%), radial-gradient(circle at 90% 100%, #1e293b 0%, #030712 55%)',
    ambientGlow: '#64748b',
    accentColor: 'cyan',
    badgeClass: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    activePillClass: 'bg-slate-700 text-white shadow-slate-700/30',
    glowShadow: '0 0 40px -10px rgba(100, 116, 139, 0.25)',
    borderClass: 'border-slate-500/20',
    swatchHex: '#64748B',
    gradientText: 'from-slate-300 via-gray-200 to-zinc-400',
  },
};

export function getGlassTintConfig(tint?: GlassmorphismTint): GlassTintConfig {
  if (tint && GLASS_TINTS[tint]) {
    return GLASS_TINTS[tint];
  }
  return GLASS_TINTS.violet;
}
