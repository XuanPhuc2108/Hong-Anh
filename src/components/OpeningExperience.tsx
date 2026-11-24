import { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { BrandMark } from '@/components/BrandMark';

type Props = {
  phase: 'opening' | 'loading' | 'error';
  progress: number;
  status: string;
  error: string;
  onOpen: () => void;
  onRetry: () => void;
};

const JOURNEY_PATH = 'M 76 8 C 42 17 20 25 31 37 C 41 48 81 49 69 62 C 57 74 22 74 31 88 C 36 96 53 99 72 102';

export function OpeningExperience({ phase, progress, status, error, onOpen, onRetry }: Props) {
  const pathRef = useRef<SVGPathElement>(null);
  const [marker, setMarker] = useState({ x: 76, y: 8 });

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const point = path.getPointAtLength((path.getTotalLength() * progress) / 100);
    setMarker({ x: point.x, y: point.y });
  }, [progress]);

  if (phase === 'opening') {
    return (
      <div className="opening-screen" role="dialog" aria-modal="true" aria-labelledby="opening-title">
        <div className="opening-wash opening-wash--one" aria-hidden />
        <div className="opening-wash opening-wash--two" aria-hidden />
        <div className="opening-motes" aria-hidden>
          <span className="mote mote--flower" />
          <span className="mote mote--butterfly" />
          <span className="mote mote--petal" />
          <span className="mote mote--spark" />
        </div>
        <div className="opening-content">
          <div className="opening-brand">
            <BrandMark className="h-12 w-12" />
            <span>MY LOVE</span>
          </div>
          <div className="gift-book" aria-hidden>
            <img src="/my-love-cover.svg" alt="" width="640" height="528" />
          </div>
          <p className="opening-overline">
            Từ cuộc trò chuyện đầu tiên · <time dateTime="2026-10-26">26.10.2026</time>
          </p>
          <h1 id="opening-title" className="opening-title">Nhật ký của<br />Phúc <span>&amp;</span> Ánh</h1>
          <button type="button" className="glass-action" onClick={onOpen}>
            <span>Mở cuốn sổ</span>
            <span aria-hidden className="glass-action__arrow">↗</span>
          </button>
          <p className="opening-hint">Chạm để mở nhật ký</p>
        </div>
      </div>
    );
  }

  return (
    <div className="opening-screen opening-screen--loading" role="dialog" aria-modal="true" aria-labelledby="loading-title">
      <div className="opening-wash opening-wash--one" aria-hidden />
      <div className="loading-content">
        <BrandMark className="h-10 w-10" />
        <h1 id="loading-title" className="loading-title">
          {phase === 'error' ? 'Không thể mở nhật ký' : 'Đang tải nhật ký'}
        </h1>
        <div className="journey-loader" role="img" aria-label={`Đã tải ${progress}%`}>
          <svg viewBox="0 0 100 110" aria-hidden>
            <path ref={pathRef} d={JOURNEY_PATH} className="journey-loader__track" />
            <path
              d={JOURNEY_PATH}
              className="journey-loader__progress"
              pathLength="100"
              style={{ strokeDasharray: 100, strokeDashoffset: 100 - progress }}
            />
            {[16, 38, 63, 88].map((step) => {
              const point = pathRef.current?.getPointAtLength((pathRef.current.getTotalLength() * step) / 100);
              return point ? (
                <circle key={step} cx={point.x} cy={point.y} r="1.8" className="journey-loader__milestone" />
              ) : null;
            })}
            <circle cx={marker.x} cy={marker.y} r="3.1" className="journey-loader__orb" />
          </svg>
          <span className="journey-loader__percent">{progress}%</span>
        </div>
        <p className="loading-status" aria-live="polite">{phase === 'error' ? error : status}</p>
        {phase === 'error' ? (
          <button type="button" className="glass-action glass-action--small" onClick={onRetry}>
            <RefreshCw size={16} aria-hidden />
            Thử mở lại
          </button>
        ) : (
          <div className="loading-steps" aria-hidden>
            <span className={progress >= 24 ? 'is-complete' : ''}>Kiểu chữ</span>
            <i />
            <span className={progress >= 45 ? 'is-complete' : ''}>Bìa sổ</span>
            <i />
            <span className={progress >= 72 ? 'is-complete' : ''}>Kỷ niệm</span>
            <i />
            <span className={progress >= 100 ? 'is-complete' : ''}>Ảnh</span>
          </div>
        )}
      </div>
    </div>
  );
}
