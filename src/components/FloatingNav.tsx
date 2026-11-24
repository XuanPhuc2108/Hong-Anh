import { useEffect, useRef, useState } from 'react';
import { Menu, Volume2, VolumeX, X } from 'lucide-react';
import { BrandMark } from '@/components/BrandMark';
import { SoundControls } from '@/components/SoundControls';
import { useSound } from '@/components/SoundContext';
import { useActiveSection, useGlassPointer } from '@/lib/hooks';
import type { CoupleIdentity } from '@/lib/photoLetterRepository';

const SECTIONS = [
  { id: 'hero', label: 'Trang đầu' },
  { id: 'today', label: 'Hôm nay' },
  { id: 'journey', label: 'Hành trình' },
  { id: 'spaces', label: 'Kho ảnh' },
  { id: 'soundtrack', label: 'Nhạc' },
  { id: 'corner', label: 'Góc nhỏ' },
];
const SECTION_IDS = SECTIONS.map((section) => section.id);

export function FloatingNav({
  identity,
  onSignOut,
}: {
  identity: CoupleIdentity;
  onSignOut: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [accountError, setAccountError] = useState('');
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
  const signOut = () => {
    setAccountError('');
    void onSignOut().catch((error: unknown) => {
      console.error('Không đăng xuất được.', error);
      setAccountError('Chưa đăng xuất được. Hãy thử lại.');
    });
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
            <p className="site-nav__panel-title">Chọn một mục</p>
            <nav className="site-nav__panel-links" aria-label="Các phần trong My Love">
              {SECTIONS.map((section, index) => (
                <a key={section.id} href={`#${section.id}`} onClick={closeAfterNavigation}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {section.label}
                </a>
              ))}
            </nav>
            <SoundControls />
            <div className="site-nav__account">
              <span>Đang đăng nhập: {identity.name}</span>
              <button type="button" className="photo-button photo-button--quiet" onClick={signOut}>
                Đăng xuất
              </button>
              {accountError && <p role="alert">{accountError}</p>}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
