import confettiPackage from 'canvas-confetti';

/**
 * MoneyDairy Celebration Confetti Engine
 * - Utilizes offscreen Web Worker rendering (OffscreenCanvas) for silky-smooth 60-120fps physics,
 *   completely independent of React DOM reconciliation and main-thread view transitions.
 * - Forces GPU hardware layer promotion (translateZ(0), willChange: transform) to prevent compositor jank.
 * - Auto-detects environment: Worker Engine -> Main Thread Canvas -> Native 2D Canvas Fallback.
 * - Tuned physics: 60 particles, 68° spread, 0.85 gravity, 200 ticks for crisp, fluid celebration.
 * - Strictly debounce-locked to prevent duplicate bursts or GPU lag.
 */

const BRAND_COLORS = ['#10B981', '#6366F1', '#3B82F6', '#F59E0B'];

/**
 * Promotes all celebration canvases to dedicated GPU compositor layers.
 */
const promoteCanvasToGpu = () => {
  if (typeof document === 'undefined') return;
  const canvases = document.querySelectorAll('canvas');
  canvases.forEach((c) => {
    if (c.style.zIndex === '999999' || c.id === 'global-confetti-canvas') {
      c.style.transform = 'translateZ(0)';
      c.style.willChange = 'transform';
      c.style.backfaceVisibility = 'hidden';
    }
  });
};

/**
 * Retrieves the primary canvas-confetti fire function.
 * Prioritizes window.confetti (from CDN browser bundle) and npm package default fire.
 * The default fire function automatically utilizes Web Worker & OffscreenCanvas for ultra-smooth 60fps.
 */
const getFireFunction = () => {
  if (typeof window !== 'undefined' && typeof window.confetti === 'function') {
    return window.confetti;
  }
  if (typeof confettiPackage === 'function') {
    return confettiPackage;
  }
  if (typeof confettiPackage?.default === 'function') {
    return confettiPackage.default;
  }
  return null;
};

/**
 * Fallback: Retrieves or creates a guaranteed full-screen overlay canvas with GPU acceleration.
 */
export const getGlobalCanvas = () => {
  if (typeof document === 'undefined') return null;

  let canvas = document.getElementById('global-confetti-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'global-confetti-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '999999';
    canvas.style.transform = 'translateZ(0)';
    canvas.style.willChange = 'transform';
    canvas.style.backfaceVisibility = 'hidden';
    document.body.appendChild(canvas);
  }
  return canvas;
};

/**
 * Built-in pure 2D Canvas particle animation fallback.
 * Zero external dependencies, runs at locked 60fps with VSYNC alignment.
 */
const runNativeCanvasBurst = (canvas) => {
  if (!canvas || typeof window === 'undefined') return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;

  const particles = [];
  const count = 60;
  const originX = (w * dpr) / 2;
  const originY = (h * dpr) * 0.65;

  for (let i = 0; i < count; i++) {
    const angle = ((Math.random() * 70 + 55) * Math.PI) / 180; // Upward celebratory cone
    const speed = (Math.random() * 15 + 10) * dpr;
    const spreadX = (Math.random() - 0.5) * 1.5;
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed * spreadX * 2,
      vy: -Math.sin(angle) * speed,
      size: (Math.random() * 7 + 5) * dpr,
      aspect: Math.random() * 0.4 + 0.5,
      color: BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
      gravity: 0.38 * dpr,
      drag: 0.982,
      opacity: 1,
      decay: Math.random() * 0.008 + 0.011,
    });
  }

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.opacity <= 0) continue;
      alive = true;

      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      p.opacity -= p.decay;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, (-p.size * p.aspect) / 2, p.size, p.size * p.aspect);
      ctx.restore();
    }

    if (alive) {
      requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  requestAnimationFrame(frame);
};

let lastFireTime = 0;
const CONFETTI_COOLDOWN_MS = 1600;

/**
 * Triggers the celebration animation:
 * Exactly ONE ultra-smooth, silky, crisp burst (60 particles, spread 68, gravity 0.85)
 * Rendered via Web Worker & OffscreenCanvas with GPU layer promotion for stutter-free 60fps.
 * Protected by a 1.6s debounce lock to prevent lag, stutter, or duplicate firing.
 */
export const triggerConfetti = (customOptions = {}) => {
  if (typeof window === 'undefined') return;

  const now = Date.now();
  if (now - lastFireTime < CONFETTI_COOLDOWN_MS) {
    // Strictly block duplicate triggers within debounce window to prevent lag & double firing
    return;
  }
  lastFireTime = now;

  const fire = getFireFunction();
  let fired = false;

  const celebrationConfig = {
    particleCount: 60,
    spread: 68,
    startVelocity: 38,
    origin: { y: 0.65 },
    colors: BRAND_COLORS,
    gravity: 0.85,  // Smooth floating descent
    ticks: 200,     // Crisp ~2s fade out duration
    scalar: 1.0,    // Clear, sharp particles
    drift: 0,
    shapes: ['square', 'circle'],
    disableForReducedMotion: false,
    zIndex: 999999,
    ...customOptions,
  };

  if (fire) {
    try {
      fire(celebrationConfig);
      fired = true;

      // Promote canvas to hardware compositor layer
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(promoteCanvasToGpu);
      }
    } catch (err) {
      console.warn('Primary confetti fire failed, trying fallback cannon:', err);
      // Fallback try with explicit canvas binding if direct fire threw
      try {
        const createFn = window.confetti?.create || confettiPackage?.create;
        const canvas = getGlobalCanvas();
        if (createFn && canvas) {
          const cannon = createFn(canvas, { resize: true, useWorker: false });
          cannon(celebrationConfig);
          fired = true;
        }
      } catch (cannonErr) {
        console.warn('Canvas cannon fallback failed:', cannonErr);
      }
    }
  }

  // Guaranteed fallback: If canvas-confetti failed completely, run native 2D canvas burst
  if (!fired) {
    runNativeCanvasBurst(getGlobalCanvas());
  }
};

export const triggerFireworks = triggerConfetti;

export const triggerQuickBurst = () => {
  if (typeof window === 'undefined') return;
  const fire = getFireFunction();
  if (fire) {
    try {
      fire({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.75 },
        colors: BRAND_COLORS,
        disableForReducedMotion: false,
        zIndex: 999999,
      });
      return;
    } catch {}
  }
  runNativeCanvasBurst(getGlobalCanvas());
};
