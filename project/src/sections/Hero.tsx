import { ChevronDown } from 'lucide-react';
import { useParallax } from '@/lib/hooks';

/** Decorative SVG petal blob — soft fuchsia atmosphere, no stock photo dependency. */
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

export function Hero() {
  const blobRef = useParallax<HTMLDivElement>(0.08);
  const titleRef = useParallax<HTMLHeadingElement>(0.04);

  return (
    <section
      id="hero"
      className="paper-texture relative flex min-h-[100svh] items-center overflow-hidden bg-paper-warm pt-24 pb-32"
    >
      {/* Atmospheric blobs */}
      <div ref={blobRef} className="parallax-slow pointer-events-none absolute inset-0">
        <PetalBlob className="absolute -left-32 -top-24 h-[36rem] w-[36rem] opacity-70" />
        <PetalBlob className="absolute -right-40 bottom-0 h-[40rem] w-[40rem] rotate-45 opacity-60" />
      </div>

      {/* Soft vignette to keep text readable */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-paper-warm/40 via-transparent to-paper-warm/80" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
        <div className="grid items-center gap-10 md:grid-cols-[1.15fr_0.85fr]">
          {/* Left: text */}
          <div className="flex flex-col gap-6">
            <div className="animate-fade-up">
              <span className="eyebrow">Cuốn nhật ký nhỏ</span>
            </div>
            <h1
              ref={titleRef}
              className="parallax-slow animate-fade-up text-balance text-5xl font-semibold leading-[1.05] tracking-tightish text-ink sm:text-6xl md:text-7xl"
              style={{ animationDelay: '0.1s' }}
            >
              Dành cho <span className="gradient-text-fuchsia italic">Ánh</span>
            </h1>
            <p
              className="animate-fade-up max-w-xl text-pretty text-base leading-relaxed text-ink-soft sm:text-lg"
              style={{ animationDelay: '0.25s' }}
            >
              Một nơi để cất giữ những khoảnh khắc, câu chuyện và điều nhỏ bé — để
              sau này có thể lật từng trang mà mỉm cười.
            </p>
            <div
              className="animate-fade-up flex flex-wrap items-center gap-3"
              style={{ animationDelay: '0.4s' }}
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

          {/* Right: framed "cover" — layered glass + gradient card, photo slot ready */}
          <div className="animate-scale-in relative mx-auto w-full max-w-sm" style={{ animationDelay: '0.3s' }}>
            <div className="relative aspect-[4/5]">
              {/* back layer */}
              <div className="absolute -left-4 top-6 h-full w-full rotate-[-4deg] rounded-3xl gradient-fuchsia opacity-30 blur-sm" />
              <div className="absolute -right-3 -top-3 h-full w-full rotate-[3deg] rounded-3xl bg-fuchsia-200/60" />
              {/* main card */}
              <figure className="glass glass-specular relative h-full w-full overflow-hidden rounded-3xl p-3 shadow-glass-lg">
                <div className="relative h-full w-full overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 gradient-fuchsia" />
                  <div className="paper-grain absolute inset-0 opacity-40" />
                  <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-700/40 via-transparent to-fuchsia-200/30" />
                  {/* monogram */}
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <span className="font-serif text-7xl font-semibold italic text-white/95 drop-shadow">
                        Á
                      </span>
                      <span className="divider text-white/80" />
                      <span className="font-hand text-2xl text-white/90">một cuốn sổ nhỏ</span>
                    </div>
                  </div>
                </div>
              </figure>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <a
        href="#story"
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-ink-soft safe-bottom"
        aria-label="Cuộn xuống"
      >
        <span className="text-[0.7rem] font-medium tracking-[0.2em] uppercase">Cuộn xuống</span>
        <span className="grid h-9 w-9 place-items-center rounded-full glass glass-specular text-fuchsia-600 animate-float-soft">
          <ChevronDown size={18} />
        </span>
      </a>
    </section>
  );
}
