import { useEffect, useState } from 'react';
import { Menu, X, BookHeart } from 'lucide-react';
import { useActiveSection } from '@/lib/hooks';
import { MusicControls } from '@/components/MusicPlayer';

const SECTIONS = [
  { id: 'hero', label: 'Trang đầu' },
  { id: 'story', label: 'Câu chuyện' },
  { id: 'gallery', label: 'Khoảnh khắc' },
  { id: 'things', label: 'Điều nhỏ bé' },
  { id: 'diary', label: 'Nhật ký' },
  { id: 'letter', label: 'Bức thư' },
  { id: 'next', label: 'Chương sau' },
];

export function FloatingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(SECTIONS.map((s) => s.id));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock page scroll only while the sheet is open (body, not the sheet,
  // so iOS rubber-banding inside the sheet stays natural).
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    // Wait for the body unlock before scrolling, otherwise smooth scroll is clamped.
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 20);
  };

  return (
    <>
      <div
        className={`fixed top-0 left-0 right-0 z-40 safe-pt px-4 transition-all duration-500 ${
          scrolled ? 'py-2' : 'py-4'
        }`}
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <button
            onClick={() => go('hero')}
            className="glass glass-specular glass-refraction btn-tactile flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-fuchsia-700"
            aria-label="Về trang đầu"
          >
            <BookHeart size={16} className="text-fuchsia-600" />
            <span className="hidden sm:inline">Nhật ký cho Ánh</span>
          </button>

          {/* Desktop section pills */}
          <div className="glass glass-specular hidden items-center gap-1 rounded-full p-1.5 md:flex">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => go(s.id)}
                className={`btn-tactile rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  active === s.id
                    ? 'gradient-fuchsia text-white shadow-soft'
                    : 'text-ink-soft hover:text-fuchsia-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="glass glass-specular btn-tactile grid h-10 w-10 place-items-center rounded-full text-fuchsia-700 md:hidden"
            aria-label={open ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>
      </div>

      {/* Mobile sheet — dims the light field behind, items cascade in */}
      {open && (
        <div
          className="fixed inset-0 z-30 overflow-y-auto overscroll-contain md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-paper-warm/50 backdrop-blur-md animate-fade-in"
            onClick={() => setOpen(false)}
          />
          <div className="relative px-4 pt-24 pb-10 safe-top">
            <div
              className="glass glass-specular glass-refraction sheet-in rounded-3xl p-3 shadow-glass-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <ul className="flex flex-col">
                {SECTIONS.map((s, i) => (
                  <li key={s.id}>
                    <button
                      onClick={() => go(s.id)}
                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                        active === s.id
                          ? 'bg-fuchsia-50 text-fuchsia-700'
                          : 'text-ink-soft hover:bg-fuchsia-50/60'
                      }`}
                    >
                      <span>{s.label}</span>
                      <span className="text-xs text-fuchsia-300">{String(i + 1).padStart(2, '0')}</span>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="my-2 h-px bg-fuchsia-200/60" />

              {/* Music + sound controls folded into the sheet */}
              <div className="px-2 pb-1 pt-2">
                <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ink-soft">
                  Nhạc và âm thanh
                </p>
                <MusicControls />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
