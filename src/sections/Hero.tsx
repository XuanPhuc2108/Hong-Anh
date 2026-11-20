import { ChevronDown } from 'lucide-react';
import { useParallax, useTypewriter } from '@/lib/hooks';
import { useScrollReveal } from '@/lib/hooks';

/** Decorative SVG petal blob — soft fuchsia atmosphere. */
function PetalBlob({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 600" className={className} aria-hidden>
      <defs>
        <radialGradient id="petalG" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#F7B6D2" stopOpacity="0.85" />
          <stop offset="55%" stopColor="#F47EAF" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#D81B72" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        d="M300 80c80 40 150 30 200 90s60 150 30 220-110 130-200 140-170-30-220-100-40-180 10-250 100-140 180-100z"
        fill="url(#petalG)"
      />
    </svg>
  );
}

/**
 * Editorial hero: overlapping type block and cover card, asymmetric
 * composition. Each line of the headline rises out of its own mask;
 * the tagline types itself once. Parallax separates cover from text.
 */
export function Hero() {
  const blobRef = useParallax<HTMLDivElement>(0.08);
  const coverRef = useParallax<HTMLDivElement>(0.05);
  const titleRef = useParallax<HTMLHeadingElement>(0.03);
  const { ref: headRef, visible } = useScrollReveal<HTMLDivElement>();
  const typewriter = useTypewriter('một cuốn sổ nhỏ cho những điều thương nhớ', 1400, 45);

  return (
    <section
      id="hero"
      className="paper-texture relative flex min-h-[100svh] items-center overflow-hidden pt-28 pb-32"
    >
      {/* Atmospheric blobs */}
      <div ref={blobRef} className="parallax-slow pointer-events-none absolute inset-0">
        <PetalBlob className="absolute -left-32 -top-24 h-[36rem] w-[36rem] opacity-60" />
        <PetalBlob className="absolute -right-40 bottom-0 h-[40rem] w-[40rem] rotate-45 opacity-50" />
      </div>

      {/* Soft vignette to keep text readable */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-paper-warm/40 via-transparent to-paper-warm/80" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
        <div ref={headRef} className="relative">
          {/* Cover card — offset behind the type on mobile, to the right on desktop */}
          <div
            ref={coverRef}
            className="hero-rise pointer-events-none absolute right-0 top-1/2 hidden w-[19rem] -translate-y-1/2 sm:block md:w-[22rem]"
            style={{ animationDelay: '0.9s' }}
          >
            <div className="relative aspect-[4/5]">
              <div className="absolute -left-4 top-6 h-full w-full rotate-[-5deg] rounded-3xl gradient-fuchsia opacity-25 blur-md" />
              <div className="absolute -right-3 -top-3 h-full w-full rotate-[3.5deg] rounded-3xl bg-fuchsia-200/60" />
              <figure className="glass glass-specular glass-refraction relative h-full w-full rotate-[1.5deg] overflow-hidden rounded-3xl p-3 shadow-glass-lg">
                <div className="relative h-full w-full overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 gradient-fuchsia" />
                  <div className="paper-grain absolute inset-0 opacity-40" />
                  <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-700/40 via-transparent to-fuchsia-200/30" />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <span className="font-serif text-7xl font-semibold italic text-white/95">
                        Á
                      </span>
                      <span className="divider text-white/80" />
                      <span className="font-hand text-2xl text-white/90">trang đầu tiên</span>
                    </div>
                  </div>
                </div>
              </figure>
            </div>
          </div>

          {/* Type block */}
          <div className="relative flex max-w-2xl flex-col gap-6 md:max-w-3xl">
            <p className="hero-rise eyebrow" style={{ animationDelay: '0.55s' }}>
              Cuốn nhật ký nhỏ
            </p>

            <h1
              ref={titleRef}
              className="parallax-slow text-balance text-[2.9rem] font-semibold leading-[1.04] tracking-tightish text-ink sm:text-6xl md:text-7xl"
            >
              <span className={`line-mask ${visible ? 'is-visible' : ''}`}>
                <span style={{ transitionDelay: '0.6s' }}>Dành cho</span>
              </span>
              <span className={`line-mask ${visible ? 'is-visible' : ''}`}>
                <span
                  className="gradient-text-fuchsia italic"
                  style={{ transitionDelay: '0.72s' }}
                >
                  Ánh
                </span>
              </span>
            </h1>

            <p
              aria-label={typewriter.done ? undefined : 'một cuốn sổ nhỏ cho những điều thương nhớ'}
              className={`hero-rise type-caret min-h-[1.6em] max-w-md font-hand text-xl text-fuchsia-700 sm:text-2xl ${
                typewriter.done ? 'after:content-none' : ''
              }`}
              style={{ animationDelay: '1s' }}
            >
              {typewriter.output}
            </p>

            <p
              className="hero-rise max-w-lg text-pretty text-base leading-relaxed text-ink-soft sm:text-lg"
              style={{ animationDelay: '1.15s' }}
            >
              Một nơi để cất giữ những khoảnh khắc, câu chuyện và điều nhỏ bé — để
              sau này có thể lật từng trang mà mỉm cười.
            </p>

            <div
              className="hero-rise flex flex-wrap items-center gap-3"
              style={{ animationDelay: '1.3s' }}
            >
              <a
                href="#story"
                className="btn-tactile gradient-fuchsia inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-soft"
              >
                Bắt đầu đọc
              </a>
              <a
                href="#letter"
                className="btn-tactile glass glass-specular inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-fuchsia-700"
              >
                Đọc bức thư
              </a>
            </div>
          </div>

          {/* Mobile cover — inline below the type, small and tilted */}
          <div className="hero-rise mt-10 w-44 sm:hidden" style={{ animationDelay: '1.4s' }}>
            <figure className="glass glass-specular glass-refraction rotate-2 overflow-hidden rounded-3xl p-2.5 shadow-glass-lg">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                <div className="absolute inset-0 gradient-fuchsia" />
                <div className="paper-grain absolute inset-0 opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-700/40 via-transparent to-fuchsia-200/30" />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <span className="font-serif text-5xl font-semibold italic text-white/95">Á</span>
                    <span className="font-hand text-lg text-white/90">trang đầu tiên</span>
                  </div>
                </div>
              </div>
            </figure>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <a
        href="#story"
        className="hero-rise absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-ink-soft safe-bottom"
        style={{ animationDelay: '1.6s' }}
        aria-label="Cuộn xuống"
      >
        <span className="text-[0.7rem] font-medium uppercase tracking-[0.2em]">Cuộn xuống</span>
        <span className="glass glass-specular grid h-9 w-9 place-items-center rounded-full text-fuchsia-600 animate-float-soft">
          <ChevronDown size={18} />
        </span>
      </a>
    </section>
  );
}
