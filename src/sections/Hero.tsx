import { useRef } from 'react';
import { useTypewriter } from '@/lib/hooks';
import { useSound } from '@/components/SoundContext';
import { RefractiveImageLens } from '@/components/RefractiveImageLens';
import { formatDateOnly } from '@/lib/dates';
import { relationshipDates } from '@/lib/my-love-config';
import { BotanicalAccent } from '@/components/BotanicalAccent';

export function Hero() {
  const { playSound } = useSound();
  const typewriter = useTypewriter('Nay có gì vui hong?', 420, 72, () => playSound('key'));
  const firstConversation = formatDateOnly(relationshipDates.firstConversation);
  const artRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLImageElement>(null);

  return (
    <section id="hero" aria-labelledby="hero-title" className="hero hero-section section-anchor" data-enter>
      <div className="hero-grid">
        <div className="hero-copy">
          <div className="hero-brandline">
            <span className="hero-orbit" aria-hidden>
              <span />
            </span>
            <span>MY LOVE · CUỐN SỔ NHỎ</span>
          </div>
          <h1 id="hero-title">Nhật ký của<br /><em>Phúc &amp; Ánh.</em></h1>
          <p className="hero-type" aria-label={typewriter.done ? undefined : 'Những trang dành cho Phúc và Ánh'}>
            {typewriter.output}<span className="type-cursor" aria-hidden />
          </p>
          <p className="hero-lead">
            Cất lại những ngày quan trọng, ảnh và ghi chú của tụi mình.
          </p>
          <div className="hero-actions">
            <a className="hero-primary" href="#journey">Xem hành trình <span aria-hidden>↘</span></a>
            <a className="hero-secondary" href="#spaces">Mở kho ảnh</a>
          </div>
          <div className="hero-first-date">
            <BotanicalAccent kind="flower" className="hero-first-date__flower" />
            <time dateTime={relationshipDates.firstConversation}>{firstConversation}</time>
            <span className="hero-first-date__rule" />
            <span>Ngày đầu tụi mình trò chuyện</span>
          </div>
        </div>
        <div ref={artRef} className="hero-art" data-enter-media>
          <div className="hero-art__wash" aria-hidden />
          <img
            ref={coverRef}
            src="/my-love-cover.svg"
            alt="Minh họa cuốn sổ My Love với một trái tim trên trang giấy"
            className="hero-book-art"
            width="640"
            height="528"
            fetchPriority="high"
          />
          <RefractiveImageLens
            stageRef={artRef}
            imageRef={coverRef}
            src="/my-love-cover.svg"
            className="hero-art__lens"
            radius={22}
            refraction={22}
            bezel={0.64}
          />
          <span className="hero-art__stamp" aria-hidden>
            <span>MY</span><strong>LOVE</strong>
          </span>
          <BotanicalAccent kind="butterfly" className="hero-art__butterfly" />
          <BotanicalAccent kind="flower" className="hero-art__flower" />
        </div>
      </div>
      <a className="hero-scroll" href="#counter">
        <span>Cuộn xuống xem tiếp nè</span>
        <span className="hero-scroll__line" aria-hidden />
      </a>
    </section>
  );
}
