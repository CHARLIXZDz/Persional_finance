import confettiPackage from 'canvas-confetti';

/**
 * Returns the reliable confetti function (either from window.confetti or npm package).
 */
const getConfettiFn = () => {
  if (typeof window !== 'undefined' && typeof window.confetti === 'function') {
    return window.confetti;
  }
  if (typeof confettiPackage === 'function') {
    return confettiPackage;
  }
  if (confettiPackage && typeof confettiPackage.default === 'function') {
    return confettiPackage.default;
  }
  return null;
};

/**
 * The beloved classic celebration animation exactly as in prototype:
 * 80 particles, spread 70, origin { y: 0.65 }, brand palette ['#10B981', '#6366F1', '#3B82F6', '#F59E0B'].
 * Guaranteed high z-index (99999) so it displays clearly above all cards, headers, and views.
 */
export const triggerConfetti = () => {
  if (typeof window === 'undefined') return;
  const fire = getConfettiFn();
  if (!fire) return;

  try {
    // 1. Primary burst exactly matching home_login.js
    fire({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#10B981', '#6366F1', '#3B82F6', '#F59E0B'],
      zIndex: 99999,
    });

    // 2. Second wider celebratory burst after 150ms for a full delightful atmosphere
    setTimeout(() => {
      try {
        fire({
          particleCount: 50,
          spread: 85,
          origin: { y: 0.6 },
          colors: ['#10B981', '#6366F1', '#3B82F6', '#F59E0B'],
          zIndex: 99999,
        });
      } catch {}
    }, 150);
  } catch (err) {
    console.warn('Confetti error:', err);
  }
};

export const triggerFireworks = triggerConfetti;

export const triggerQuickBurst = () => {
  if (typeof window === 'undefined') return;
  const fire = getConfettiFn();
  if (!fire) return;
  try {
    fire({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.75 },
      zIndex: 99999,
      colors: ['#10B981', '#6366F1', '#3B82F6', '#F59E0B'],
    });
  } catch (err) {
    console.warn('Quick burst error:', err);
  }
};
