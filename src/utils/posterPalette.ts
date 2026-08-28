/**
 * Dynamic Poster Color Palette & Glassmorphic Tint Engine
 * Extracts dominant, secondary, and accent colors from movie posters / backdrops
 * to dynamically tint the DetailModal's glassmorphic background, borders, glows, and accents.
 */

export interface PosterPalette {
  primary: string;         // 'rgb(r, g, b)'
  primaryHex: string;      // '#hex'
  secondary: string;       // 'rgb(r, g, b)'
  secondaryHex: string;    // '#hex'
  accent: string;          // 'rgb(r, g, b)'
  accentHex: string;       // '#hex'
  ambientRadial: string;   // Dynamic radial gradient for modal background glow
  glassBackground: string; // Dynamic frosted glass card background
  glassBorder: string;     // Border color with matching tint
  glowShadow: string;      // Soft colored drop shadow
  buttonGradient: string;  // Dynamic gradient for primary actions
  pillBackground: string;  // Translucent pill tint
  swatches: string[];      // Top 4 extracted palette swatches
}

// Fallback palette when image is not available or before extraction completes
export const DEFAULT_POSTER_PALETTE: PosterPalette = {
  primary: 'rgb(245, 158, 11)',
  primaryHex: '#F59E0B',
  secondary: 'rgb(244, 63, 94)',
  secondaryHex: '#F43F5E',
  accent: 'rgb(251, 191, 36)',
  accentHex: '#FBBF24',
  ambientRadial: 'radial-gradient(ellipse at 50% -10%, rgba(245, 158, 11, 0.28) 0%, rgba(244, 63, 94, 0.14) 40%, rgba(5, 5, 8, 0.96) 80%)',
  glassBackground: 'rgba(8, 8, 12, 0.94)',
  glassBorder: 'rgba(245, 158, 11, 0.25)',
  glowShadow: '0 25px 80px -15px rgba(245, 158, 11, 0.35)',
  buttonGradient: 'linear-gradient(135deg, #F59E0B 0%, #F43F5E 100%)',
  pillBackground: 'rgba(245, 158, 11, 0.15)',
  swatches: ['#F59E0B', '#F43F5E', '#8B5CF6', '#06B6D4'],
};

// In-memory cache for extracted palettes by image URL
const posterPaletteCache = new Map<string, PosterPalette>();

interface RgbColor {
  r: number;
  g: number;
  b: number;
  count: number;
  saturation: number;
  luminance: number;
}

/**
 * Calculates relative luminance of an RGB color
 */
function getLuminance(r: number, g: number, b: number): number {
  return 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
}

/**
 * Calculates saturation (0 to 1) of an RGB color
 */
function getSaturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
}

/**
 * Converts RGB numbers to Hex string
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Quantizes and groups pixels into color bins to find the dominant vibrant colors
 */
function extractColorsFromImageData(data: Uint8ClampedArray): PosterPalette {
  const colorBuckets = new Map<string, RgbColor>();
  const step = 4; // Sample every 4th pixel for high performance

  for (let i = 0; i < data.length; i += 4 * step) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Skip transparent or near-black / near-white pixels
    if (a < 128) continue;
    const lum = getLuminance(r, g, b);
    if (lum < 0.08 || lum > 0.92) continue;

    const sat = getSaturation(r, g, b);
    if (sat < 0.12) continue; // Skip washed-out grays

    // Quantize RGB to 24-step bins for smooth clustering
    const qr = Math.round(r / 24) * 24;
    const qg = Math.round(g / 24) * 24;
    const qb = Math.round(b / 24) * 24;
    const key = `${qr}_${qg}_${qb}`;

    const existing = colorBuckets.get(key);
    if (existing) {
      existing.count += 1;
      existing.r = (existing.r * (existing.count - 1) + r) / existing.count;
      existing.g = (existing.g * (existing.count - 1) + g) / existing.count;
      existing.b = (existing.b * (existing.count - 1) + b) / existing.count;
    } else {
      colorBuckets.set(key, {
        r,
        g,
        b,
        count: 1,
        saturation: sat,
        luminance: lum,
      });
    }
  }

  // Score colors based on frequency, saturation, and balanced luminance
  const sortedColors = Array.from(colorBuckets.values()).map((c) => {
    // Boost score for rich, vibrant mid-tones
    const lumScore = 1 - Math.abs(c.luminance - 0.45) * 1.5;
    const satScore = c.saturation * 2.0;
    const score = c.count * (1 + satScore) * Math.max(0.2, lumScore);
    return { ...c, score };
  }).sort((a, b) => b.score - a.score);

  if (sortedColors.length === 0) {
    return DEFAULT_POSTER_PALETTE;
  }

  // Primary color: Highest scoring dominant color
  const p = sortedColors[0];
  const primaryRgb = `rgb(${Math.round(p.r)}, ${Math.round(p.g)}, ${Math.round(p.b)})`;
  const primaryHex = rgbToHex(p.r, p.g, p.b);

  // Secondary color: Find a color with distinct hue/distance from primary
  let s = sortedColors.find((c) => {
    const dist = Math.abs(c.r - p.r) + Math.abs(c.g - p.g) + Math.abs(c.b - p.b);
    return dist > 110;
  }) || sortedColors[1] || p;

  const secondaryRgb = `rgb(${Math.round(s.r)}, ${Math.round(s.g)}, ${Math.round(s.b)})`;
  const secondaryHex = rgbToHex(s.r, s.g, s.b);

  // Accent color: Highest saturation color in the image
  const aColor = [...sortedColors].sort((a, b) => b.saturation - a.saturation)[0] || p;
  const accentRgb = `rgb(${Math.round(aColor.r)}, ${Math.round(aColor.g)}, ${Math.round(aColor.b)})`;
  const accentHex = rgbToHex(aColor.r, aColor.g, aColor.b);

  // Swatches: Top 4 distinct colors
  const swatches: string[] = [primaryHex];
  for (const c of sortedColors) {
    const hex = rgbToHex(c.r, c.g, c.b);
    if (!swatches.includes(hex)) {
      swatches.push(hex);
    }
    if (swatches.length >= 4) break;
  }
  while (swatches.length < 4) {
    swatches.push(secondaryHex);
  }

  // Construct dynamic CSS glassmorphic values
  const r1 = Math.round(p.r);
  const g1 = Math.round(p.g);
  const b1 = Math.round(p.b);

  const r2 = Math.round(s.r);
  const g2 = Math.round(s.g);
  const b2 = Math.round(s.b);

  return {
    primary: primaryRgb,
    primaryHex,
    secondary: secondaryRgb,
    secondaryHex,
    accent: accentRgb,
    accentHex,
    ambientRadial: `radial-gradient(ellipse at 50% -5%, rgba(${r1}, ${g1}, ${b1}, 0.38) 0%, rgba(${r2}, ${g2}, ${b2}, 0.18) 45%, rgba(5, 5, 8, 0.96) 80%)`,
    glassBackground: `rgba(${Math.max(4, Math.round(r1 * 0.06))}, ${Math.max(4, Math.round(g1 * 0.06))}, ${Math.max(8, Math.round(b1 * 0.08))}, 0.94)`,
    glassBorder: `rgba(${r1}, ${g1}, ${b1}, 0.32)`,
    glowShadow: `0 25px 90px -15px rgba(${r1}, ${g1}, ${b1}, 0.45)`,
    buttonGradient: `linear-gradient(135deg, ${primaryHex} 0%, ${secondaryHex} 100%)`,
    pillBackground: `rgba(${r1}, ${g1}, ${b1}, 0.18)`,
    swatches,
  };
}

/**
 * Extracts a dynamic palette from an image URL
 */
export const extractPosterPalette = async (
  imageUrl: string | null | undefined
): Promise<PosterPalette> => {
  if (!imageUrl) {
    return DEFAULT_POSTER_PALETTE;
  }

  if (posterPaletteCache.has(imageUrl)) {
    return posterPaletteCache.get(imageUrl)!;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';

    // Fallback timer if image hangs or CORS is blocked
    const timer = setTimeout(() => {
      posterPaletteCache.set(imageUrl, DEFAULT_POSTER_PALETTE);
      resolve(DEFAULT_POSTER_PALETTE);
    }, 1800);

    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          posterPaletteCache.set(imageUrl, DEFAULT_POSTER_PALETTE);
          resolve(DEFAULT_POSTER_PALETTE);
          return;
        }

        // Downsample to 48x72 for instant calculation
        canvas.width = 48;
        canvas.height = 72;
        ctx.drawImage(img, 0, 0, 48, 72);

        const imgData = ctx.getImageData(0, 0, 48, 72).data;
        const palette = extractColorsFromImageData(imgData);

        posterPaletteCache.set(imageUrl, palette);
        resolve(palette);
      } catch (err) {
        console.warn('[Poster Palette Extraction] Canvas read error, using default:', err);
        posterPaletteCache.set(imageUrl, DEFAULT_POSTER_PALETTE);
        resolve(DEFAULT_POSTER_PALETTE);
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      posterPaletteCache.set(imageUrl, DEFAULT_POSTER_PALETTE);
      resolve(DEFAULT_POSTER_PALETTE);
    };

    img.src = imageUrl;
  });
};
