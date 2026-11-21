import { useEffect, useRef, useState } from 'react';
import { useActiveSection, useGlassPointer } from '@/lib/hooks';
import { MusicControls } from '@/components/MusicPlayer';
import { BrandMark } from '@/components/BrandMark';
import { playMenuSound } from '@/lib/audio';

const SECTIONS = [
  { id: 'hero', label: 'Trang chủ', note: 'Bìa cuốn sổ' },
  { id: 'journey', label: 'Hành trình', note: 'Hai cột mốc của tụi mình' },
  { id: 'library', label: 'Không gian ảnh', note: 'Ba album riêng' },
  { id: 'soundtrack', label: 'Playlist', note: 'Our Soundtrack' },
  { id: 'corner', label: 'Góc riêng', note: 'Điều nhỏ và bức thư' },
];

const SECTION_IDS = SECTIONS.map((s) => s.id);

/**
 * One liquid-glass capsule that morphs open into a panel. Desktop shows the
 * four chapters inline; the panel adds chapter notes and audio. On mobile
 * the panel is the whole menu. Music stays mounted so playback survives
 * opening and closing the panel.
 */
export function FloatingNav() {
  const [open, setOpen] = useState(false);
  const active = useActiveSection(SECTION_IDS);
  const glassRef = useGlassPointer<HTMLDivElement>();
  const panelRef = useRef<HTMLDivElement>(null);

  // Collapsed panel content must not be reachable by keyboard / screen readers.
  useEffect(() => {
    panelRef.current?.toggleAttribute('inert', !open);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    const prev = document.body.style.overflow;
    if (mobile) document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 20);
  };

  return (
    <>
      {open && (
        <div
          aria-hidden
          className="fixed inset-0 z-30 animate-fade-in bg-paper-warm/40 md:bg-transparent"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="safe-pt fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5">
        <div
          ref={glassRef}
          className="lg mx-auto w-full max-w-[44rem] rounded-[1.75rem] transition-[border-radius] duration-500"
        >
          <nav aria-label="Điều hướng chính" className="flex items-center justify-between gap-2 py-1.5 pl-4 pr-1.5">
            <button
              onClick={() => go('hero')}
              className="btn-tactile flex min-w-0 items-center gap-2 py-1.5 text-left"
              aria-label="Về trang chủ My Love"
            >
              <BrandMark size={34} />
              <span className="font-serif text-lg italic text-ink">My Love</span>
            </button>

            <ul className="hidden items-center gap-0.5 md:flex">
              {SECTIONS.map((s) => {
                const isActive = active === s.id;
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => go(s.id)}
                      aria-current={isActive ? 'true' : undefined}
                      className={`btn-tactile relative rounded-full px-3.5 py-2 text-[0.8rem] font-medium ${
                        isActive ? 'bg-white/70 text-fuchsia-700 shadow-[inset_0_1px_0_white,0_4px_12px_-6px_rgba(120,40,70,0.35)]' : 'text-ink-soft hover:text-ink'
                      }`}
                    >
                      {s.label}
                    </button>
                  </li>
                );
              })}
            </ul>

            <button
              onClick={() => {
                playMenuSound();
                setOpen((value) => !value);
              }}
              aria-expanded={open}
              aria-controls="nav-panel"
              aria-label={open ? 'Đóng bảng điều hướng' : 'Mở bảng điều hướng'}
              className="btn-tactile flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-[0.78rem] font-medium text-paper-ivory"
            >
              <span className="md:hidden">{open ? 'Đóng' : 'Mục lục'}</span>
              <span className="hidden md:inline">{open ? 'Đóng' : 'Thêm'}</span>
              <span aria-hidden className="relative block h-2.5 w-3">
                <span
                  className={`absolute left-0 right-0 top-0 h-px bg-current transition-transform duration-500 ${
                    open ? 'translate-y-[5px] rotate-45' : ''
                  }`}
                />
                <span
                  className={`absolute bottom-0 left-0 right-0 h-px bg-current transition-transform duration-500 ${
                    open ? '-translate-y-[4px] -rotate-45' : ''
                  }`}
                />
              </span>
            </button>
          </nav>

          <div id="nav-panel" ref={panelRef} className="nav-expand" data-open={open}>
            <div>
              <div className="mx-4 rule" />
              <div className="grid gap-6 px-4 pb-4 pt-4 md:grid-cols-[1.3fr_1fr] md:gap-8">
                <ol className="flex flex-col">
                  {SECTIONS.map((s, i) => (
                    <li key={s.id} className="nav-item">
                      <button
                        onClick={() => go(s.id)}
                        className="group flex w-full items-baseline gap-4 rounded-xl py-2.5 text-left"
                      >
                        <span className="meta w-6 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                        <span className="flex flex-1 flex-col">
                          <span
                            className={`font-serif text-2xl transition-colors ${
                              active === s.id ? 'italic text-fuchsia-700' : 'text-ink group-hover:text-fuchsia-700'
                            }`}
                          >
                            {s.label}
                          </span>
                          <span className="text-xs text-ink-soft">{s.note}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
                <div className="nav-item flex flex-col justify-end gap-3">
                  <p className="eyebrow">Âm thanh</p>
                  <MusicControls />
                  <p className="text-xs leading-relaxed text-ink-soft">
                    Hiệu ứng chỉ phát khi mình tương tác; không có nhạc tự phát.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
