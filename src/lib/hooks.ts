import { useEffect, useRef, useState } from 'react';

/**
 * Reveal element on scroll into view.
 * Adds `is-visible` to the ref element when it enters the viewport.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit
) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionPreference.matches) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px', ...options }
    );
    const onMotionPreferenceChange = () => {
      if (!motionPreference.matches) return;
      setVisible(true);
      observer.disconnect();
    };

    motionPreference.addEventListener('change', onMotionPreferenceChange);
    observer.observe(el);
    return () => {
      observer.disconnect();
      motionPreference.removeEventListener('change', onMotionPreferenceChange);
    };
  }, [options]);

  return { ref, visible };
}

/** Track the active section id for floating nav without measuring on every scroll frame. */
export function useActiveSection(sectionIds: string[], offset = 0.4) {
  const [active, setActive] = useState<string>(sectionIds[0] ?? '');

  useEffect(() => {
    if (typeof IntersectionObserver !== 'undefined') {
      const observedSections = sectionIds
        .map((id) => document.getElementById(id))
        .filter((section): section is HTMLElement => section !== null);
      if (!observedSections.length) return;

      const observer = new IntersectionObserver(
        (entries) => {
          const current = entries
            .filter((entry) => entry.isIntersecting)
            .sort(
              (a, b) =>
                Math.abs(a.boundingClientRect.top + a.boundingClientRect.height / 2 - window.innerHeight / 2) -
                Math.abs(b.boundingClientRect.top + b.boundingClientRect.height / 2 - window.innerHeight / 2)
            )[0];
          if (current) setActive(current.target.id);
        },
        {
          rootMargin: `-${Math.max(0, offset * 100 - 5)}% 0px -${Math.max(0, (1 - offset) * 100 - 5)}% 0px`,
          threshold: 0,
        }
      );
      observedSections.forEach((section) => observer.observe(section));
      return () => observer.disconnect();
    }

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
 * Moves a glass surface's specular lobe toward the pointer (fine pointers
 * only). Writes two CSS vars on pointermove, rAF-throttled; no layout work.
 */
export function useGlassPointer<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let x = 0;
    let y = 0;
    const apply = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const gx = Math.max(0, Math.min(100, ((x - r.left) / r.width) * 100));
      const gy = Math.max(-20, Math.min(60, ((y - r.top) / r.height) * 100 - 30));
      el.style.setProperty('--gx', `${gx.toFixed(1)}%`);
      el.style.setProperty('--gy', `${gy.toFixed(1)}%`);
    };
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      el.style.removeProperty('--gx');
      el.style.removeProperty('--gy');
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return ref;
}

/**
 * Fills a vertical line (scaleY 0..1) as its container passes through the
 * viewport — used for the timeline spine.
 */
export function useScrollFill<C extends HTMLElement, F extends HTMLElement>() {
  const containerRef = useRef<C | null>(null);
  const fillRef = useRef<F | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const fill = fillRef.current;
    if (!container || !fill) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      fill.style.transform = 'scaleY(1)';
      return;
    }
    let raf = 0;
    let last = -1;
    const update = () => {
      raf = 0;
      const r = container.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.max(0, Math.min(1, (vh * 0.6 - r.top) / r.height));
      const rounded = Math.round(p * 200) / 200;
      if (rounded !== last) {
        last = rounded;
        fill.style.transform = `scaleY(${rounded})`;
      }
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

  return { containerRef, fillRef };
}

/**
 * Typewriter for one hero line. Starts after `startDelay` ms, respects
 * prefers-reduced-motion (shows the full text instantly).
 */
export function useTypewriter(text: string, startDelay = 900, speed = 55, onCharacter?: () => void) {
  const [output, setOutput] = useState('');
  const onCharacterRef = useRef(onCharacter);
  onCharacterRef.current = onCharacter;

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
        onCharacterRef.current?.();
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
