/**
 * Safe mobile haptic feedback utility using navigator.vibrate()
 */
export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'selection';

export const triggerHaptic = (type: HapticType = 'light') => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
  if (!('vibrate' in navigator)) return;

  try {
    switch (type) {
      case 'selection':
      case 'light':
        navigator.vibrate(12);
        break;
      case 'medium':
        navigator.vibrate(25);
        break;
      case 'heavy':
        navigator.vibrate(45);
        break;
      case 'success':
        navigator.vibrate([20, 50, 25]);
        break;
      case 'warning':
        navigator.vibrate([30, 60, 30, 60, 30]);
        break;
      default:
        navigator.vibrate(15);
    }
  } catch {
    // Gracefully handle any browser restrictions or sandboxed environment policies
  }
};
