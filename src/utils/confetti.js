import confetti from 'canvas-confetti';

/**
 * Triggers a spectacular, multi-stage fireworks celebration.
 * Features:
 * - High zIndex (99999) to render above all headers, modals, and screen transitions.
 * - Multi-layer center explosions.
 * - Dual cannon bursts from the bottom left & right corners over 1.5 seconds.
 */
export const triggerFireworks = () => {
  if (typeof window === 'undefined') return;

  const count = 180;
  const defaults = {
    origin: { y: 0.65 },
    zIndex: 99999,
  };

  const fire = (particleRatio, opts) => {
    try {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    } catch (e) {
      console.warn('Fireworks error:', e);
    }
  };

  // 1. Center multi-stage firework explosions
  fire(0.25, {
    spread: 30,
    startVelocity: 55,
    colors: ['#10B981', '#34D399', '#6EE7B7'],
  });

  fire(0.2, {
    spread: 60,
    colors: ['#6366F1', '#818CF8', '#A5B4FC'],
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.9,
    colors: ['#F59E0B', '#FBBF24', '#FCD34D'],
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 30,
    decay: 0.92,
    scalar: 1.2,
    colors: ['#EC4899', '#F472B6', '#FBCFE8'],
  });

  fire(0.1, {
    spread: 130,
    startVelocity: 45,
    colors: ['#3B82F6', '#60A5FA', '#93C5FD'],
  });

  // 2. Continuous left & right fireworks cannons shooting upward
  const duration = 1600; // 1.6 seconds
  const end = Date.now() + duration;
  const cannonColors = ['#10B981', '#6366F1', '#F59E0B', '#EC4899', '#3B82F6', '#8B5CF6'];

  const frame = () => {
    try {
      // Left side cannon
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 60,
        origin: { x: 0.05, y: 0.75 },
        colors: cannonColors,
        zIndex: 99999,
        scalar: 1.1,
      });

      // Right side cannon
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 60,
        origin: { x: 0.95, y: 0.75 },
        colors: cannonColors,
        zIndex: 99999,
        scalar: 1.1,
      });
    } catch {}

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  requestAnimationFrame(frame);
};

/**
 * Quick burst for transactions or small achievements
 */
export const triggerQuickBurst = () => {
  if (typeof window === 'undefined') return;
  try {
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.75 },
      zIndex: 99999,
      colors: ['#10B981', '#34D399', '#6366F1', '#F59E0B'],
    });
  } catch (e) {
    console.warn('Quick burst error:', e);
  }
};
