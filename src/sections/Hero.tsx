import { useRef } from 'react';
import { useTypewriter } from '@/lib/hooks';
import { useSound } from '@/components/SoundContext';
import { RefractiveImageLens } from '@/components/RefractiveImageLens';
import { BotanicalAccent } from '@/components/BotanicalAccent';

export function Hero({ mode = 'member' }: { mode?: 'member' | 'guest' }) {
  const { playSound } = useSound();
  const typewriter = useTypewriter('Nay có dì dui hông', 420, 72, () => playSound('key'));
  const artRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLImageElement>(null);

  return (
    <section id="hero" aria-labelledby="hero-title" className="hero hero-section section-anchor" data-enter>
      <div className="hero-grid">
        <div className="hero-copy">
          <h1 id="hero-title">Nhật ký của<br /><em>Phúc &amp; Ánh.</em></h1>
          <p className="hero-type" aria-label={typewriter.done ? undefined : 'Nay có dì dui hông'}>
            {typewriter.output}<span className="type-cursor" aria-hidden />
          </p>
          <div className="hero-actions">
            <a className="hero-primary" href={mode === 'guest' ? '#spaces' : '#journey'}>
              {mode === 'guest' ? 'Xem ba album' : 'Xem hành trình'} <span aria-hidden>↘</span>
            </a>
            <a className="hero-secondary" href={mode === 'guest' ? '#corner' : '#spaces'}>
              {mode === 'guest' ? 'Thư tay' : 'Mở kho ảnh'}
            </a>
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
      <a className="hero-scroll" href={mode === 'guest' ? '#spaces' : '#counter'}>
        <span>Cuộn xuống để xem tiếp</span>
        <span className="hero-scroll__line" aria-hidden />
      </a>
    </section>
  );
}
