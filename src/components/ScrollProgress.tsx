import { useEffect, useRef } from 'react';

/**
 * 1px hairline under the top bar that fills with scroll progress.
 * Driven by rAF on transform only — no layout thrash.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      el.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px">
      <div
        ref={barRef}
        className="scroll-progress h-full w-full origin-left bg-gradient-to-r from-fuchsia-400 via-fuchsia-600 to-fuchsia-300"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
}
