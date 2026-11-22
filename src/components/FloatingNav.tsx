import { useEffect, useRef, useState } from 'react';
import { Menu, Volume2, VolumeX, X } from 'lucide-react';
import { BrandMark } from '@/components/BrandMark';
import { SoundControls } from '@/components/SoundControls';
import { useSound } from '@/components/SoundContext';
import { useActiveSection, useGlassPointer } from '@/lib/hooks';

const SECTIONS = [
  { id: 'hero', label: 'Trang đầu' },
  { id: 'today', label: 'Hôm nay' },
  { id: 'journey', label: 'Hành trình' },
  { id: 'spaces', label: 'Kho ảnh' },
  { id: 'soundtrack', label: 'Nhạc' },
  { id: 'corner', label: 'Góc nhỏ' },
];
const SECTION_IDS = SECTIONS.map((section) => section.id);

export function FloatingNav() {
  const [open, setOpen] = useState(false);
  const active = useActiveSection(SECTION_IDS);
  const glassRef = useGlassPointer<HTMLDivElement>();
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const { preferences, updatePreferences, playSound } = useSound();

  useEffect(() => {
    panelRef.current?.toggleAttribute('inert', !open);
    panelRef.current?.setAttribute('aria-hidden', String(!open));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = () => {
      setOpen(false);
      toggleRef.current?.focus();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    if (window.matchMedia('(max-width: 900px)').matches) document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const toggleMenu = () => {
    if (!open) playSound('menu');
    setOpen((value) => !value);
  };
  const closeAfterNavigation = () => {
    setOpen(false);
    window.setTimeout(() => toggleRef.current?.focus(), 0);
  };
  const toggleSound = () => {
    updatePreferences({ enabled: !preferences.enabled });
  };

  return (
    <>
      {open && <button className="nav-backdrop" aria-label="Đóng menu" onClick={closeAfterNavigation} />}
      <header className="site-nav" data-scrolled={active !== 'hero'}>
        <div ref={glassRef} className="site-nav__bar lg">
          <a href="#hero" className="site-nav__brand" onClick={closeAfterNavigation} aria-label="My Love — về trang chủ">
            <BrandMark className="site-nav__mark" />
            <span>My Love</span>
          </a>
          <nav className="site-nav__links" aria-label="Điều hướng chính">
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={closeAfterNavigation}
                aria-current={active === section.id ? 'location' : undefined}
              >
                {section.label}
              </a>
            ))}
          </nav>
          <div className="site-nav__actions">
            <button type="button" className="nav-sound-toggle" onClick={toggleSound} aria-label={preferences.enabled ? 'Tắt âm thanh giao diện' : 'Bật âm thanh giao diện'}>
              {preferences.enabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
            </button>
            <button
              ref={toggleRef}
              type="button"
              className="nav-menu-toggle"
              onClick={toggleMenu}
              aria-expanded={open}
              aria-controls="my-love-menu"
              aria-label={open ? 'Đóng menu' : 'Mở menu'}
            >
              <span>{open ? 'Đóng' : 'Mục lục'}</span>
              {open ? <X size={17} aria-hidden /> : <Menu size={17} aria-hidden />}
            </button>
          </div>
        </div>
        <div id="my-love-menu" ref={panelRef} className={`site-nav__panel ${open ? 'is-open' : ''}`}>
          <div className="site-nav__panel-inner lg">
            <p className="site-nav__panel-title">Mình ghé góc nào nè?</p>
            <nav className="site-nav__panel-links" aria-label="Các phần trong My Love">
              {SECTIONS.map((section, index) => (
                <a key={section.id} href={`#${section.id}`} onClick={closeAfterNavigation}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {section.label}
                </a>
              ))}
            </nav>
            <SoundControls />
          </div>
        </div>
      </header>
    </>
  );
}
