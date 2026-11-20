import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useActiveSection } from '@/lib/hooks';

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

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      {/* Top floating glass nav — pill of section dots on desktop, menu button on mobile */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 safe-pt px-4 transition-all duration-500 ${
          scrolled ? 'py-2' : 'py-4'
        }`}
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <button
            onClick={() => go('hero')}
            className="glass glass-specular btn-tactile flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-fuchsia-700"
            aria-label="Về trang đầu"
          >
            <span className="grid h-5 w-5 place-items-center rounded-full gradient-fuchsia text-[10px] font-bold text-white">
              Á
            </span>
            <span className="hidden sm:inline">Nhật ký cho Ánh</span>
          </button>

          {/* Desktop section dots */}
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

      {/* Mobile dropdown sheet */}
      {open && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        >
          <div className="absolute inset-0 bg-paper-warm/40 backdrop-blur-sm animate-fade-in" />
          <div
            className="glass glass-specular absolute left-4 right-4 top-20 rounded-3xl p-3 shadow-glass-lg animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="flex flex-col">
              {SECTIONS.map((s) => (
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
                    <span className="text-xs text-fuchsia-300">{SECTIONS.indexOf(s) + 1 < 10 ? `0${SECTIONS.indexOf(s) + 1}` : SECTIONS.indexOf(s) + 1}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
