import { useCallback, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export type LightboxItem = { src: string; caption?: string };

type LightboxProps = {
  items: LightboxItem[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

export function Lightbox({ items, index, onClose, onNavigate }: LightboxProps) {
  const open = index !== null;
  const current = open ? items[index!] : null;
  const touchX = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const next = useCallback(
    (dir: number) => {
      if (index === null) return;
      const n = (index + dir + items.length) % items.length;
      onNavigate(n);
    },
    [index, items.length, onNavigate]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next(1);
      if (e.key === 'ArrowLeft') next(-1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, next, onClose]);

  if (!open || !current) return null;

  return (
    <div
      className="lb-enter fixed inset-0 z-50 flex flex-col items-center justify-center px-4 py-16"
      onClick={onClose}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null || items.length < 2) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) next(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
      role="dialog"
      aria-modal="true"
      aria-label={current.caption ?? 'Xem ảnh'}
    >
      <div className="absolute inset-0 bg-[#1e1016]/85 backdrop-blur-xl" />

      <div className="safe-pt absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-3">
        <span className="meta text-white/70 tabular-nums">
          {items.length > 1 ? `${String(index! + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}` : ''}
        </span>
        <button
          ref={closeRef}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="lg-dark btn-tactile grid h-11 w-11 place-items-center rounded-full"
          aria-label="Đóng"
        >
          <X size={18} />
        </button>
      </div>

      {items.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next(-1);
            }}
            className="lg-dark btn-tactile absolute left-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full sm:grid"
            aria-label="Ảnh trước"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next(1);
            }}
            className="lg-dark btn-tactile absolute right-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full sm:grid"
            aria-label="Ảnh sau"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      <figure
        key={current.src}
        className="lb-photo relative z-[1] flex max-h-full max-w-5xl flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={current.src}
          alt={current.caption ?? ''}
          className="max-h-[76vh] max-w-full rounded-sm object-contain shadow-soft-lg"
        />
        {current.caption && (
          <figcaption className="max-w-xl text-center font-serif text-base italic text-white/85">
            {current.caption}
          </figcaption>
        )}
      </figure>
    </div>
  );
}
