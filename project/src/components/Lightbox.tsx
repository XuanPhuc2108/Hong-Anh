import { useCallback, useEffect, useState } from 'react';
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
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, next, onClose]);

  if (!open || !current) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-ink/70 backdrop-blur-xl" />

      {/* Controls */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="glass-dark glass-specular btn-tactile absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full text-white safe-top"
        aria-label="Đóng"
      >
        <X size={20} />
      </button>
      {items.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); next(-1); }}
            className="glass-dark glass-specular btn-tactile absolute left-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-white sm:left-4"
            aria-label="Ảnh trước"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(1); }}
            className="glass-dark glass-specular btn-tactile absolute right-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-white sm:right-4"
            aria-label="Ảnh sau"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Image */}
      <figure
        className="relative z-[1] flex max-h-full max-w-4xl flex-col items-center animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={current.src}
          alt={current.caption ?? ''}
          className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-soft-lg"
        />
        {current.caption && (
          <figcaption className="glass glass-specular mt-4 rounded-full px-5 py-2 text-sm text-ink safe-bottom">
            {current.caption}
          </figcaption>
        )}
      </figure>
    </div>
  );
}
