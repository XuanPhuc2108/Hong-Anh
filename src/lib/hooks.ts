import { useEffect, useRef, useState } from 'react';

/**
 * Reveal element on scroll into view.
 * Adds `is-visible` to the ref element when it enters the viewport.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit
) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px', ...options }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [options]);

  return { ref, visible };
}

/** Track the active section id for floating nav highlight (rAF-throttled). */
export function useActiveSection(sectionIds: string[], offset = 0.4) {
  const [active, setActive] = useState<string>(sectionIds[0] ?? '');

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const mid = window.innerHeight * offset;
      let current = sectionIds[0] ?? '';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= mid) current = id;
      }
      setActive((prev) => (prev === current ? prev : current));
    };
    const handler = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', handler, { passive: true });
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler);
      window.removeEventListener('resize', handler);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [sectionIds, offset]);

  return active;
}

/**
 * Lightweight parallax offset based on element position in viewport.
 * Runs on both desktop and touch devices (transform-only, rAF throttled
 * so scrolling stays native on iPhone), skipped under reduced motion.
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(strength = 0.15) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let lastOffset: number | null = null;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
      const offset = Math.max(-1, Math.min(1, progress)) * strength * 100;
      // Skip DOM writes when the offset hasn't moved a full pixel —
      // keeps scroll frames free of redundant style work.
      const rounded = Math.round(offset * 4) / 4;
      if (rounded !== lastOffset) {
        lastOffset = rounded;
        el.style.transform = `translate3d(0, ${rounded}px, 0)`;
      }
      raf = 0;
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
  }, [strength]);

  return ref;
}

/**
 * Typewriter for one hero line. Starts after `startDelay` ms, respects
 * prefers-reduced-motion (shows the full text instantly).
 */
export function useTypewriter(text: string, startDelay = 900, speed = 55) {
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOutput(text);
      return;
    }
    let i = 0;
    let interval: number | undefined;
    const timeout = window.setTimeout(() => {
      interval = window.setInterval(() => {
        i += 1;
        setOutput(text.slice(0, i));
        if (i >= text.length && interval) window.clearInterval(interval);
      }, speed);
    }, startDelay);
    return () => {
      window.clearTimeout(timeout);
      if (interval) window.clearInterval(interval);
    };
  }, [text, startDelay, speed]);

  return { output, done: output.length >= text.length };
}
