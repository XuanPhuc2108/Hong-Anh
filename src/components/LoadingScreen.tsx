import { useState } from 'react';
import { playOpeningSound, unlockSound } from '@/lib/audio';
import { BrandMark } from '@/components/BrandMark';

function preloadImage(src: string) {
  return new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Không tải được ảnh bìa.'));
    image.src = src;
    if (image.complete && image.naturalWidth > 0) resolve();
  });
}

export function LoadingScreen({ onDone, criticalImages = [] }: { onDone: () => void; criticalImages?: string[] }) {
  const [phase, setPhase] = useState<'welcome' | 'loading' | 'failed'>('welcome');
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  const enter = async () => {
    if (phase === 'loading' || leaving) return;
    unlockSound();
    playOpeningSound();
    setPhase('loading');
    setProgress(0);

    const tasks = [
      () => document.fonts.ready.then(() => undefined),
      ...criticalImages.slice(0, 1).map((src) => () => preloadImage(src)),
    ];

    try {
      for (let index = 0; index < tasks.length; index += 1) {
        await tasks[index]();
        setProgress(Math.round(((index + 1) / tasks.length) * 100));
      }
      setLeaving(true);
      window.setTimeout(() => {
        setGone(true);
        onDone();
      }, 650);
    } catch {
      setPhase('failed');
    }
  };

  if (gone) return null;
  const loading = phase === 'loading';
  return (
    <div
      role="dialog"
      aria-modal={!leaving}
      aria-hidden={leaving}
      aria-label="Mở món quà My Love"
      className={`boot-exit fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-paper-warm ${leaving ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
    >
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 size-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: 'radial-gradient(45% 45% at 50% 50%, rgba(247,182,210,.5), transparent 70%)' }} />
      <div className="relative flex w-full max-w-lg flex-col items-center gap-7 px-6 text-center">
        <div className={`gift-book ${loading ? 'gift-book-open' : ''}`} aria-hidden>
          <span className="gift-book-page gift-book-left" />
          <span className="gift-book-page gift-book-right" />
          <span className="gift-book-mark"><BrandMark size={44} /></span>
        </div>
        <div>
          <p className="eyebrow">MỘT VŨ TRỤ NHỎ CỦA PHÚC & ÁNH</p>
          <h1 className="display mt-3 text-4xl text-ink sm:text-5xl">My Love</h1>
          <p className="meta mt-3">Một món quà nhỏ, cất những điều thương nhớ.</p>
        </div>

        {phase === 'welcome' && (
          <button type="button" onClick={enter} className="btn-tactile lg relative rounded-full px-8 py-4 text-sm font-semibold text-fuchsia-800">
            Mở món quà <span aria-hidden>↗</span>
          </button>
        )}

        {loading && (
          <div className="lg w-full max-w-sm rounded-[1.5rem] p-5" aria-live="polite">
            <svg className="mx-auto block h-14 w-full overflow-visible" viewBox="0 0 300 56" role="progressbar" aria-label="Đang chuẩn bị những trang đầu tiên" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
              <path d="M8 44 C48 44 40 12 82 12 S116 44 154 44 S192 12 228 12 S258 44 292 44" fill="none" stroke="rgba(184,50,95,.16)" strokeWidth="3" strokeLinecap="round" />
              <path d="M8 44 C48 44 40 12 82 12 S116 44 154 44 S192 12 228 12 S258 44 292 44" fill="none" stroke="#b8325f" strokeWidth="3" strokeLinecap="round" pathLength="100" strokeDasharray="100" strokeDashoffset={100 - progress} className="progress-ribbon" />
              {[8, 82, 154, 228, 292].map((x) => <circle key={x} cx={x} cy={x === 82 || x === 228 ? 12 : 44} r="3" fill="#b8325f" fillOpacity={progress > (x / 3) ? 1 : 0.25} />)}
            </svg>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="meta">Đang mở từng trang</span>
              <span className="display text-2xl tabular-nums text-fuchsia-700">{progress}%</span>
            </div>
          </div>
        )}

        {phase === 'failed' && (
          <div role="alert" className="lg w-full max-w-sm rounded-2xl p-5">
            <p className="text-sm text-ink">Chưa tải được ảnh bìa, mình thử lại nha.</p>
            <button type="button" onClick={enter} className="btn-tactile mt-3 rounded-full bg-ink px-5 py-2.5 text-sm text-white">Thử tải lại</button>
          </div>
        )}
      </div>
    </div>
  );
}
