import { useCallback, useEffect, useRef } from 'react';
import { Pencil, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPhotoDate } from '@/lib/imageFiles';

export type LightboxItem = { src: string; caption?: string; date?: string; note?: string; onEdit?: () => void };

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const next = useCallback(
    (dir: number) => {
      if (index === null) return;
      const n = (index + dir + items.length) % items.length;
      onNavigate(n);
    },
    [index, items.length, onNavigate]
  );

  const actionsRef = useRef({ onClose, next });
  actionsRef.current = { onClose, next };

  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        actionsRef.current.onClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        actionsRef.current.next(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        actionsRef.current.next(-1);
      } else if (e.key === 'Tab') {
        const controls = [...(dialogRef.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') ?? [])]
          .filter((button) => button.getClientRects().length > 0);
        if (controls.length === 0) {
          e.preventDefault();
          return;
        }
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (e.shiftKey && (document.activeElement === first || !dialogRef.current?.contains(document.activeElement))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (document.activeElement === last || !dialogRef.current?.contains(document.activeElement))) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      if (returnFocusRef.current?.isConnected) returnFocusRef.current.focus();
    };
  }, [open]);

  if (!open || !current) return null;

  return (
    <div
      ref={dialogRef}
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
      aria-label={current.caption ?? 'Xem ảnh trong kho My Love'}
    >
      <div className="absolute inset-0 bg-[#1e1016]/65 backdrop-blur-xl" />

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
          aria-label="Đóng ảnh"
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
            aria-label="Xem ảnh trước"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next(1);
            }}
            className="lg-dark btn-tactile absolute right-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full sm:grid"
            aria-label="Xem ảnh kế tiếp"
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
          alt={current.caption || `Ảnh ${index! + 1} trong album`}
          className="max-h-[76vh] max-w-full rounded-sm object-contain shadow-soft-lg"
        />
        {(current.caption || current.date || current.note || current.onEdit) && (
          <figcaption className="flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 text-sm text-white/85">
            <span className="min-w-0 flex-1 text-center sm:text-left">
              {current.caption && <span className="block">{current.caption}</span>}
              {current.date && <time className="mt-1 block text-xs text-white/65" dateTime={current.date}>{formatPhotoDate(current.date)}</time>}
              {current.note && <span className="mt-1 block text-xs text-white/65">{current.note}</span>}
            </span>
            {current.onEdit && (
              <button
                type="button"
                className="lg-dark btn-tactile inline-flex min-h-11 items-center gap-2 rounded-full px-4"
                onClick={current.onEdit}
              >
                <Pencil size={15} aria-hidden /> Chỉnh sửa
              </button>
            )}
          </figcaption>
        )}
      </figure>
    </div>
  );
}
