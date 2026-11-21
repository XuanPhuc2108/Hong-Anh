import { useParallax, useScrollReveal, useTypewriter } from '@/lib/hooks';
import { siteContent } from '@/lib/content';

function EmptyFrame({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div className={`frame-empty relative flex h-full w-full items-end p-5 ${className}`}>
      <span className="meta relative z-[1]">{label}</span>
    </div>
  );
}

/**
 * Asymmetric editorial cover: an oversized headline on the left columns,
 * one dominant portrait photograph on the right, and two small supporting
 * details (a second frame and a folio caption). Uses the first gallery
 * images when available; otherwise shows honest empty frames.
 */
export function Hero() {
  const { hero, gallery } = siteContent;
  const coverRef = useParallax<HTMLDivElement>(0.06);
  const detailRef = useParallax<HTMLDivElement>(0.12);
  const { ref: headRef, visible } = useScrollReveal<HTMLDivElement>();
  const typewriter = useTypewriter('một cuốn sổ nhỏ cho những điều thương nhớ', 1400, 45);

  const cover = gallery.images[0];
  const detail = gallery.images[1];

  return (
    <section id="hero" aria-labelledby="hero-title" className="relative overflow-hidden pb-20 pt-28 sm:pt-32 md:pb-28">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 sm:px-8 md:grid-cols-12 md:gap-8">
        <div ref={headRef} className="relative z-[2] flex flex-col md:col-span-7 md:pt-10">
          <div className="hero-rise flex items-center gap-4" style={{ animationDelay: '0.3s' }}>
            <span className="eyebrow">{hero.eyebrow}</span>
            <span className="rule h-px w-12" />
            <span className="meta">Tập I</span>
          </div>

          <h1 id="hero-title" className="display mt-8 text-[3.6rem] text-ink sm:text-[5.5rem] lg:text-[7.5rem]">
            <span className={`line-mask ${visible ? 'is-visible' : ''}`}>
              <span style={{ transitionDelay: '0.45s' }}>Dành cho</span>
            </span>
            <span className={`line-mask ${visible ? 'is-visible' : ''}`}>
              <span className="italic text-fuchsia-600" style={{ transitionDelay: '0.6s' }}>
                Ánh,
              </span>
            </span>
            <span className={`line-mask ${visible ? 'is-visible' : ''}`}>
              <span className="text-[0.42em] tracking-[-0.02em] text-ink-soft" style={{ transitionDelay: '0.75s' }}>
                người thương nhất.
              </span>
            </span>
          </h1>

          <p
            aria-label={typewriter.done ? undefined : 'một cuốn sổ nhỏ cho những điều thương nhớ'}
            className="hero-rise mt-8 min-h-[1.5em] font-hand text-2xl text-fuchsia-700"
            style={{ animationDelay: '1s' }}
          >
            {typewriter.output}
          </p>

          <div className="hero-rise mt-6 grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end" style={{ animationDelay: '1.15s' }}>
            <p className="max-w-md text-pretty text-base leading-relaxed text-ink-soft sm:text-[1.05rem]">{hero.subtitle}</p>
          </div>

          <div className="hero-rise mt-9 flex flex-wrap items-center gap-3" style={{ animationDelay: '1.3s' }}>
            <a
              href="#journey"
              className="btn-tactile inline-flex h-12 items-center rounded-full bg-ink px-6 text-sm font-medium text-paper-ivory shadow-[0_10px_24px_-12px_rgba(59,31,43,0.6)]"
            >
              Bắt đầu đọc
            </a>
            <a href="#corner" className="btn-tactile link-underline px-2 py-3 text-sm font-medium text-fuchsia-700">
              Đọc bức thư
            </a>
          </div>
        </div>

        <div className="relative md:col-span-5">
          <div ref={coverRef} className="hero-rise relative will-change-transform" style={{ animationDelay: '0.7s' }}>
            <figure className="relative ml-auto w-[86%] md:w-full">
              <div className="photo-hover relative aspect-[4/5] overflow-hidden rounded-[2px] shadow-soft-lg">
                {cover ? (
                  <img src={cover.src} alt={cover.caption} className="h-full w-full object-cover" />
                ) : (
                  <EmptyFrame label="Ảnh bìa — thêm từ trang quản lý" />
                )}
              </div>
              <figcaption className="mt-3 flex items-baseline justify-between gap-4">
                <span className="meta">Tr. 01</span>
                <span className="font-serif text-sm italic text-ink-soft">{cover?.caption ?? 'Trang đầu tiên'}</span>
              </figcaption>
            </figure>
          </div>

          <div
            ref={detailRef}
            className="hero-rise absolute -bottom-6 left-0 w-[38%] will-change-transform md:-left-16 md:bottom-16 md:w-[42%]"
            style={{ animationDelay: '1.1s' }}
          >
            <div className="aspect-square overflow-hidden rounded-[2px] border-[6px] border-paper-ivory shadow-soft-lg">
              {detail ? (
                <img src={detail.src} alt={detail.caption} className="h-full w-full object-cover" />
              ) : (
                <EmptyFrame label="Chi tiết" className="p-3" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-16 flex max-w-6xl items-center gap-4 px-5 sm:px-8 md:mt-20">
        <span className="meta">{hero.scrollHint}</span>
        <span className="rule h-px flex-1" />
        <span className="meta tabular-nums">01 — 04</span>
      </div>
    </section>
  );
}
