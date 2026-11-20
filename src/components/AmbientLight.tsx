import { useEffect, useRef } from 'react';

/**
 * AmbientLight — full-page fixed light field behind all content.
 *
 * Five soft pink / cream light sources drift on very slow, desynced CSS
 * loops (GPU-composited transform/opacity only — no JS on scroll). Two
 * layers also carry a CSS variable set ONCE per page (not per frame) so
 * the field shifts subtly as you move down the page without any scroll
 * listener cost. No cursor tracking: it ran continuously on desktop and
 * cost more than it added.
 */
export function AmbientLight() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Set the scroll-shift variables occasionally, not on every frame.
    // scroll events fire dozens of times per second; 4 updates over the
    // whole page gives the same gentle shift for near-zero cost.
    let timer: number | undefined;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      root.style.setProperty('--scroll-p', p.toFixed(3));
      timer = window.setTimeout(update, 900);
    };
    timer = window.setTimeout(update, 300);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ contain: 'strict' }}
    >
      {/* Layer 1 — large warm field, top left, breathes on a 26s loop */}
      <div
        className="ambient-drift-a absolute -top-[20%] -left-[15%] h-[70vmax] w-[70vmax]"
        style={{
          background:
            'radial-gradient(45% 45% at 50% 50%, rgba(252, 229, 239, 0.9) 0%, rgba(247, 182, 210, 0.45) 45%, rgba(247, 182, 210, 0) 72%)',
        }}
      />
      {/* Layer 2 — rose light, bottom right, offset drift + gentle scroll shift */}
      <div
        className="ambient-drift-b absolute -right-[20%] -bottom-[25%] h-[75vmax] w-[75vmax]"
        style={{
          transform: 'translateY(calc(var(--scroll-p, 0) * -120px))',
          background:
            'radial-gradient(42% 42% at 50% 50%, rgba(244, 126, 175, 0.5) 0%, rgba(247, 182, 210, 0.25) 50%, rgba(244, 126, 175, 0) 74%)',
        }}
      />
      {/* Layer 3 — cream counter-light, upper right */}
      <div
        className="ambient-drift-c absolute -top-[10%] right-[5%] h-[55vmax] w-[55vmax]"
        style={{
          background:
            'radial-gradient(40% 40% at 50% 50%, rgba(255, 250, 244, 0.85) 0%, rgba(255, 247, 250, 0.4) 48%, rgba(255, 250, 244, 0) 70%)',
        }}
      />
      {/* Layer 4 — small deep-rose ember, slow travel with scroll */}
      <div
        className="ambient-drift-d absolute left-[8%] top-[45%] h-[38vmax] w-[38vmax]"
        style={{
          transform: 'translateY(calc(var(--scroll-p, 0) * -220px))',
          background:
            'radial-gradient(45% 45% at 50% 50%, rgba(216, 27, 114, 0.16) 0%, rgba(216, 27, 114, 0) 70%)',
        }}
      />
      {/* Layer 5 — cream ember near the fold, counter-drift */}
      <div
        className="ambient-drift-e absolute bottom-[8%] left-[30%] h-[30vmax] w-[30vmax]"
        style={{
          background:
            'radial-gradient(45% 45% at 50% 50%, rgba(255, 255, 255, 0.7) 0%, rgba(252, 229, 239, 0) 70%)',
        }}
      />
      {/* Fine grain so large gradients never band on OLED screens */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.85 0 0 0 0 0.7 0 0 0 0 0.78 0 0 0 0.03 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
