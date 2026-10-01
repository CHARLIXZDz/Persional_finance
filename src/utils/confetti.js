import confettiPackage from 'canvas-confetti';

/**
 * MoneyDairy Celebration Confetti Engine
 * - Main-thread rendering (useWorker: false) to prevent iOS Safari / WebKit OffscreenCanvas bugs.
 * - Forces disableForReducedMotion: false so accessibility settings never suppress celebrations.
 * - Multi-layered fallback: Canvas-Confetti -> Native 2D Canvas Particle Engine.
 * - Persistent global canvas (z-index: 999999) surviving all React route / view changes.
 */

const BRAND_COLORS = ['#10B981', '#6366F1', '#3B82F6', '#F59E0B'];

let activeCanvasInstance = null;
let activeConfettiCannon = null;

/**
 * Retrieves or creates a guaranteed full-screen overlay canvas.
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
    document.body.appendChild(canvas);
  }
  return canvas;
};

/**
 * Returns a configured main-thread confetti cannon instance.
 */
const getCannon = () => {
  if (typeof window === 'undefined') return null;

  const canvas = getGlobalCanvas();
  if (!canvas) return null;

  if (activeConfettiCannon && activeCanvasInstance === canvas) {
    return activeConfettiCannon;
  }

  // Find confetti.create
  const createFn =
    (typeof window.confetti?.create === 'function' && window.confetti.create) ||
    (typeof confettiPackage?.create === 'function' && confettiPackage.create) ||
    (typeof confettiPackage?.default?.create === 'function' && confettiPackage.default.create) ||
    null;

  if (createFn) {
    try {
      activeConfettiCannon = createFn(canvas, {
        resize: true,
        useWorker: false, // Critical for iOS Safari / WebKit stability
        disableForReducedMotion: false, // Ensure animation always displays
      });
      activeCanvasInstance = canvas;
      return activeConfettiCannon;
    } catch (e) {
      console.warn('Failed to bind canvas-confetti cannon:', e);
    }
  }

  // Fallback to global confetti function if create() wasn't supported
  if (typeof window.confetti === 'function') return window.confetti;
  if (typeof confettiPackage === 'function') return confettiPackage;
  if (typeof confettiPackage?.default === 'function') return confettiPackage.default;

  return null;
};

/**
 * Built-in pure 2D Canvas particle animation fallback.
 * Zero dependencies, works on 100% of browsers even if external libraries fail.
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
  const count = 80;
  const originX = (w * dpr) / 2;
  const originY = (h * dpr) * 0.65;

  for (let i = 0; i < count; i++) {
    const angle = ((Math.random() * 80 + 50) * Math.PI) / 180; // Erupting upwards
    const speed = (Math.random() * 16 + 10) * dpr;
    const spreadX = (Math.random() - 0.5) * 1.6;
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed * spreadX * 2,
      vy: -Math.sin(angle) * speed,
      size: (Math.random() * 8 + 6) * dpr,
      aspect: Math.random() * 0.5 + 0.4,
      color: BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 14,
      gravity: 0.38 * dpr,
      drag: 0.985,
      opacity: 1,
      decay: Math.random() * 0.009 + 0.009,
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

/**
 * Triggers the beloved celebration animation exactly matching prototype:
 * 80 particles, spread 70, origin { y: 0.65 }, colors ['#10B981', '#6366F1', '#3B82F6', '#F59E0B'].
 * Followed by an energetic second burst for peak delight.
 */
export const triggerConfetti = () => {
  if (typeof window === 'undefined') return;

  const cannon = getCannon();
  let fired = false;

  if (cannon) {
    try {
      // 1. Primary burst matching home_login.js
      cannon({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
        colors: BRAND_COLORS,
        disableForReducedMotion: false,
        zIndex: 999999,
      });

      // 2. Secondary wider burst after 160ms
      setTimeout(() => {
        try {
          cannon({
            particleCount: 50,
            spread: 85,
            origin: { y: 0.6 },
            colors: BRAND_COLORS,
            disableForReducedMotion: false,
            zIndex: 999999,
          });
        } catch {}
      }, 160);

      fired = true;
    } catch (err) {
      console.warn('Confetti cannon fire failed, falling back to native canvas:', err);
    }
  }

  // Guaranteed fallback: If cannon wasn't available or failed, run native canvas burst
  if (!fired) {
    runNativeCanvasBurst(getGlobalCanvas());
  }
};

export const triggerFireworks = triggerConfetti;

export const triggerQuickBurst = () => {
  if (typeof window === 'undefined') return;
  const cannon = getCannon();
  if (cannon) {
    try {
      cannon({
        particleCount: 45,
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
