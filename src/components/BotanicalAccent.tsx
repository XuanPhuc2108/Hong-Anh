import { useEffect, useRef, useState } from 'react';

type BotanicalAccentProps = {
  kind: 'flower' | 'butterfly';
  className?: string;
};

export function BotanicalAccent({ kind, className = '' }: BotanicalAccentProps) {
  const accentRef = useRef<HTMLSpanElement>(null);
  const [near, setNear] = useState(false);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const accent = accentRef.current;
    if (!accent) return;
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true);
      setSeen(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setNear(entry.isIntersecting);
        if (entry.isIntersecting) setSeen(true);
      },
      { rootMargin: '120px' }
    );
    observer.observe(accent);
    return () => observer.disconnect();
  }, []);

  return (
    <span
      ref={accentRef}
      className={`botanical-accent botanical-accent--${kind} ${className}`}
      data-near={near}
      data-seen={seen}
      aria-hidden="true"
    >
      {kind === 'flower' ? (
        <svg viewBox="0 0 48 48" fill="none">
          <g className="botanical-accent__petals">
            <path d="M24 7c4-5 10-2 8 4l-3 7-5 1-5-1-3-7c-2-6 4-9 8-4Z" />
            <path d="M41 19c6 1 6 8 0 10l-8 1-3-4v-5l7-3c1-.3 2-.3 4 1Z" />
            <path d="M35 39c-2 6-9 5-10-1l-1-8 4-4 5 1 3 8c0 2 0 3-1 4Z" />
            <path d="M13 40c-6 2-9-4-4-8l6-5 5 2 2 4-4 7c-2 1-3 1-5 0Z" />
            <path d="M6 22c-4-5 1-10 6-6l6 5-1 5-4 3-7-4c-1-1-1-2 0-3Z" />
          </g>
          <circle cx="24" cy="24" r="4" />
          <path d="M24 29c-1 7-4 12-9 16m10-11c3 5 7 8 12 9" />
        </svg>
      ) : (
        <svg viewBox="0 0 48 36" fill="none">
          <g className="botanical-accent__wings">
            <path d="M22 16C17 3 5 2 5 11c0 5 7 8 17 8-10 1-15 7-11 12 4 4 10-1 12-9Z" />
            <path d="M26 16C31 3 43 2 43 11c0 5-7 8-17 8 10 1 15 7 11 12-4 4-10-1-12-9Z" />
          </g>
          <path className="botanical-accent__body" d="M24 14v15m0-14-4-6m4 6 4-6" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="36" cy="12" r="1.5" />
        </svg>
      )}
    </span>
  );
}
