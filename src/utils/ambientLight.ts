/**
 * Ambient Light (Ambilight) Engine for VideoPlayer
 * Analyzes media backdrop & poster image color dynamics to project living, frame-matched
 * ambient glow around the video player container, enhancing immersion.
 */

export interface AmbientPalette {
  primary: string;       // Dominant vibrant color (hex/rgb)
  secondary: string;     // Complementary accent glow
  tertiary: string;      // Deep ambient fill
  topLight: string;      // Top edge diffusion
  bottomLight: string;   // Bottom edge diffusion
  leftLight: string;     // Left edge diffusion
  rightLight: string;    // Right edge diffusion
  accentGlow: string;    // Core center bloom
}

// Fallback thematic palettes based on genre or default
export const DEFAULT_AMBIENT_PALETTE: AmbientPalette = {
  primary: '#06B6D4',
  secondary: '#3B82F6',
  tertiary: '#1E1B4B',
  topLight: '#0891B2',
  bottomLight: '#1D4ED8',
  leftLight: '#06B6D4',
  rightLight: '#6366F1',
  accentGlow: '#00F0FF',
};

// Cache for extracted palettes by image URL
const paletteCache = new Map<string, AmbientPalette>();

/**
 * Extracts dominant ambient light palette from an image URL using offscreen canvas.
 * Falls back safely to genre-matched or radiant cyber glow if CORS/loading restricts canvas.
 */
export const extractAmbientPalette = async (
  imageUrl: string | null | undefined,
  fallbackAccent: string = '#06B6D4'
): Promise<AmbientPalette> => {
  if (!imageUrl) {
    return generateAccentPalette(fallbackAccent);
  }

  if (paletteCache.has(imageUrl)) {
    return paletteCache.get(imageUrl)!;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';

    // Timeout fallback after 1.5s
    const timer = setTimeout(() => {
      const fallback = generateAccentPalette(fallbackAccent);
      paletteCache.set(imageUrl, fallback);
      resolve(fallback);
    }, 1500);

    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          const fallback = generateAccentPalette(fallbackAccent);
          paletteCache.set(imageUrl, fallback);
          resolve(fallback);
          return;
        }

        // Downsample for performance (32x18 grid matches 16:9 aspect)
        canvas.width = 32;
        canvas.height = 18;
        ctx.drawImage(img, 0, 0, 32, 18);

        const imgData = ctx.getImageData(0, 0, 32, 18).data;

        // Sample quadrants:
        // Top edge: y = 0..3, x = 0..31
        // Bottom edge: y = 14..17, x = 0..31
        // Left edge: x = 0..4, y = 0..17
        // Right edge: x = 27..31, y = 0..17
        // Center: x = 10..22, y = 5..13

        const sampleAverageRgb = (startX: number, endX: number, startY: number, endY: number) => {
          let r = 0, g = 0, b = 0, count = 0;
          for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
              const idx = (y * 32 + x) * 4;
              const red = imgData[idx];
              const green = imgData[idx + 1];
              const blue = imgData[idx + 2];
              // Boost saturation slightly
              r += red;
              g += green;
              b += blue;
              count++;
            }
          }
          if (count === 0) return [20, 30, 60];
          return [
            Math.min(255, Math.round((r / count) * 1.15)),
            Math.min(255, Math.round((g / count) * 1.15)),
            Math.min(255, Math.round((b / count) * 1.15)),
          ];
        };

        const top = sampleAverageRgb(0, 31, 0, 3);
        const bottom = sampleAverageRgb(0, 31, 14, 17);
        const left = sampleAverageRgb(0, 4, 0, 17);
        const right = sampleAverageRgb(27, 31, 0, 17);
        const center = sampleAverageRgb(10, 22, 5, 13);

        const toRgbStr = (rgb: number[]) => `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;

        const palette: AmbientPalette = {
          primary: toRgbStr(center),
          secondary: toRgbStr(top),
          tertiary: toRgbStr(bottom),
          topLight: toRgbStr(top),
          bottomLight: toRgbStr(bottom),
          leftLight: toRgbStr(left),
          rightLight: toRgbStr(right),
          accentGlow: `rgba(${center[0]}, ${center[1]}, ${center[2]}, 0.8)`,
        };

        paletteCache.set(imageUrl, palette);
        resolve(palette);
      } catch {
        const fallback = generateAccentPalette(fallbackAccent);
        paletteCache.set(imageUrl, fallback);
        resolve(fallback);
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      const fallback = generateAccentPalette(fallbackAccent);
      paletteCache.set(imageUrl, fallback);
      resolve(fallback);
    };

    img.src = imageUrl;
  });
};

/**
 * Generates an ambient palette from an accent color
 */
export const generateAccentPalette = (accentHex: string): AmbientPalette => {
  const cleanHex = accentHex.startsWith('#') ? accentHex : `#${accentHex}`;
  return {
    primary: cleanHex,
    secondary: '#3B82F6',
    tertiary: '#1E1B4B',
    topLight: cleanHex,
    bottomLight: '#1D4ED8',
    leftLight: cleanHex,
    rightLight: '#6366F1',
    accentGlow: cleanHex,
  };
};
