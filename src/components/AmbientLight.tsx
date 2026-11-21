import { useEffect, useRef } from 'react';

/**
 * Environmental light behind the interface: a warm ivory key light, a rose
 * fill and a low blush bounce. Drift loops run only on fine pointers (see
 * index.css); on desktop a single soft lamp leans toward the cursor.
 * Touch devices get a static field — no continuous work on iPhone.
 */
export function AmbientLight() {
  const lampRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lamp = lampRef.current;
    if (!lamp) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let tx = 0.5;
    let ty = 0.3;
    let cx = 0.5;
    let cy = 0.3;
    const tick = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      lamp.style.transform = `translate3d(${(cx - 0.5) * 8}vw, ${(cy - 0.5) * 6}vh, 0)`;
      raf = Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth;
      ty = e.clientY / window.innerHeight;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden" style={{ contain: 'strict' }}>
      <div
        className="ambient-a absolute -left-[20%] -top-[25%] h-[80vmax] w-[80vmax]"
        style={{
          background:
            'radial-gradient(closest-side, rgba(255, 252, 246, 0.95), rgba(255, 246, 240, 0.5) 50%, rgba(255, 246, 240, 0) 100%)',
        }}
      />
      <div
        className="ambient-b absolute -right-[25%] top-[10%] h-[70vmax] w-[70vmax]"
        style={{
          background:
            'radial-gradient(closest-side, rgba(239, 180, 200, 0.42), rgba(239, 196, 210, 0.18) 55%, rgba(239, 196, 210, 0) 100%)',
        }}
      />
      <div
        className="ambient-c absolute -bottom-[30%] left-[5%] h-[65vmax] w-[65vmax]"
        style={{
          background:
            'radial-gradient(closest-side, rgba(212, 119, 151, 0.18), rgba(212, 119, 151, 0) 100%)',
        }}
      />
      <div ref={lampRef} className="absolute left-[30%] top-[5%] h-[50vmax] w-[50vmax] will-change-transform">
        <div
          className="h-full w-full"
          style={{
            background:
              'radial-gradient(closest-side, rgba(255, 228, 236, 0.5), rgba(255, 228, 236, 0) 100%)',
          }}
        />
      </div>
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.3 0 0 0 0 0.35 0 0 0 0.035 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
