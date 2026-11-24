import { useCallback, useEffect, useState } from 'react';
import { FloatingNav } from '@/components/FloatingNav';
import { Footer } from '@/components/Footer';
import { AmbientLight } from '@/components/AmbientLight';
import { OpeningExperience } from '@/components/OpeningExperience';
import { useSound } from '@/components/SoundContext';
import { emptyJournalData, loadJournalData, type JournalData } from '@/lib/journalData';
import { Hero } from '@/sections/Hero';
import { RelationshipCounter } from '@/sections/RelationshipCounter';
import { JournalMoment } from '@/sections/JournalMoment';
import { OurStory } from '@/sections/OurStory';
import { GuestJournalSpaces, JournalSpaces } from '@/sections/JournalSpaces';
import { OurSoundtrack } from '@/sections/OurSoundtrack';
import { Corner } from '@/sections/Corner';
import { TodayTogether } from '@/sections/TodayTogether';
import { CoupleAuthGate, type CoupleAccess } from '@/components/CoupleAuthGate';
import type { CoupleIdentity } from '@/lib/photoLetterRepository';
import { GuestLetterPreview } from '@/sections/Letter';

type Phase = 'opening' | 'loading' | 'error' | 'site';

async function preloadImage(source: string): Promise<void> {
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Không thể tải hình ảnh quan trọng: ${source}`));
    image.src = source;
  });
  if (typeof image.decode === 'function') await image.decode();
}

async function preloadThumbnails(sources: string[]) {
  await Promise.all(
    sources.slice(0, 4).map(async (source) => {
      try {
        await preloadImage(source);
      } catch (error) {
        console.warn('Một ảnh xem trước chưa tải được; trang vẫn có thể mở.', error);
      }
    })
  );
}

function AppContent({
  identity,
  initialSection,
  onSignOut,
}: {
  identity: CoupleIdentity;
  initialSection: string | null;
  onSignOut: () => Promise<void>;
}) {
  const [phase, setPhase] = useState<Phase>('opening');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Sẵn sàng mở nhật ký.');
  const [error, setError] = useState('');
  const [data, setData] = useState<JournalData>(emptyJournalData);
  const { primeAudio, playSound } = useSound();

  const loadExperience = useCallback(async () => {
    setPhase('loading');
    setError('');
    setProgress(8);
    setStatus('Đang tải nhật ký.');
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      setProgress(24);
      setStatus('Đang tải kiểu chữ.');

      await preloadImage('/my-love-cover.svg');
      setProgress(44);
      setStatus('Đang tải ảnh bìa.');

      const journal = await loadJournalData();
      setData(journal);
      setProgress(72);
      setStatus('Đang tải kỷ niệm.');

      const thumbnails = [
        ...journal.gallery.slice(0, 3).map((image) => image.signed_url),
        ...journal.diary.slice(0, 1).map((image) => image.signed_url),
      ];
      await preloadThumbnails(thumbnails);
      setProgress(100);
      setStatus('Đã tải xong nhật ký.');
      await new Promise<void>((resolve) => window.setTimeout(resolve, 220));
      setPhase('site');
    } catch (loadError) {
      console.error('Không thể tải dữ liệu My Love.', loadError);
      setError('Không thể tải nhật ký. Hãy thử lại.');
      setStatus('Không thể mở nhật ký.');
      setPhase('error');
    }
  }, []);

  const openGift = () => {
    primeAudio();
    playSound('open');
    void loadExperience();
  };

  useEffect(() => {
    if (phase !== 'site') return;
    const root = document.documentElement;
    root.classList.remove('m-enter-done');
    root.classList.add('m-enter');
    requestAnimationFrame(() => {
      (window as Window & { myLoveMotion?: { refresh: () => void } }).myLoveMotion?.refresh();
      window.setTimeout(() => root.classList.add('m-enter-done'), 700);
    });
  }, [phase]);

  useEffect(() => {
    if (phase !== 'site' || !initialSection) return;
    requestAnimationFrame(() => {
      document.getElementById(initialSection)?.scrollIntoView({ block: 'start' });
    });
  }, [phase, initialSection]);

  useEffect(() => {
    if (phase !== 'site') return;
    const main = document.querySelector('#main');
    if (!main) return;
    requestAnimationFrame(() => {
      (window as Window & { myLoveMoments?: { mountAll: (root: Element) => Promise<Element[]> } }).myLoveMoments?.mountAll(main);
    });
  }, [phase]);

  useEffect(() => {
    if (phase !== 'site') return;
    let targetId: string;
    try {
      targetId = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      return;
    }
    if (!targetId.startsWith('memory-')) return;
    requestAnimationFrame(() => document.getElementById(targetId)?.scrollIntoView({ block: 'start' }));
  }, [phase, data.memories.length]);

  if (phase !== 'site') {
    return (
      <OpeningExperience
        phase={phase === 'error' ? 'error' : phase === 'loading' ? 'loading' : 'opening'}
        progress={progress}
        status={status}
        error={error}
        onOpen={openGift}
        onRetry={() => void loadExperience()}
      />
    );
  }

  return (
    <div className="my-love-app" data-connected={data.connected}>
      <a href="#main" className="skip-link">Bỏ qua đến nội dung chính</a>
      <AmbientLight />
      <FloatingNav identity={identity} onSignOut={onSignOut} />
      <main id="main" tabIndex={-1} className="site-content">
        <Hero />
        <TodayTogether userId={identity.userId} />
        <RelationshipCounter />
        <JournalMoment />
        <OurStory memories={data.memories} />
        <JournalSpaces identity={identity} gallery={data.gallery} diary={data.diary} memories={data.memories} notes={data.notes} />
        <OurSoundtrack />
        <Corner identity={identity} notes={data.notes} stories={data.stories} />
        {!data.connected && (
          <p className="connection-note" role="status">
            Không kết nối được với kho kỷ niệm. Tải lại trang để thử lại.
          </p>
        )}
      </main>
      <Footer />
    </div>
  );
}

function GuestContent({ onRequestSignIn }: Extract<CoupleAccess, { mode: 'guest' }>) {
  return (
    <div className="my-love-app" data-connected="false" data-access="guest">
      <a href="#main" className="skip-link">Bỏ qua đến nội dung chính</a>
      <AmbientLight />
      <FloatingNav mode="guest" onRequestSignIn={onRequestSignIn} />
      <main id="main" tabIndex={-1} className="site-content">
        <Hero mode="guest" />
        <GuestJournalSpaces onRequestSignIn={onRequestSignIn} />
        <GuestLetterPreview onRequestSignIn={onRequestSignIn} />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <CoupleAuthGate>
      {(access) => access.mode === 'guest'
        ? <GuestContent {...access} />
        : (
          <AppContent
            key={access.identity.userId}
            identity={access.identity}
            initialSection={access.initialSection}
            onSignOut={access.onSignOut}
          />
        )}
    </CoupleAuthGate>
  );
}
