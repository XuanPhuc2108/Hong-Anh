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
import { JournalSpaces } from '@/sections/JournalSpaces';
import { OurSoundtrack } from '@/sections/OurSoundtrack';
import { Corner } from '@/sections/Corner';
import { TodayTogether } from '@/sections/TodayTogether';

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

function getErrorMessage(error: unknown) {
  return error instanceof Error ? `Mình mở chưa được: ${error.message}` : 'Có chút trục trặc khi mở cuốn sổ nè.';
}

function AppContent() {
  const [phase, setPhase] = useState<Phase>('opening');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Sẵn sàng mở cuốn sổ nè.');
  const [error, setError] = useState('');
  const [data, setData] = useState<JournalData>(emptyJournalData);
  const { primeAudio, playSound } = useSound();

  const loadExperience = useCallback(async () => {
    setPhase('loading');
    setError('');
    setProgress(8);
    setStatus('Đang chuẩn bị một chút xíu');
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      setProgress(24);
      setStatus('Đang sửa soạn từng trang');

      await preloadImage('/my-love-cover.svg');
      setProgress(44);
      setStatus('Đang mở chiếc bìa');

      const journal = await loadJournalData();
      setData(journal);
      setProgress(72);
      setStatus(journal.connected ? 'Đang xếp kỷ niệm vào sổ' : 'Đang xếp những trang đầu');

      const thumbnails = [
        ...journal.gallery.slice(0, 3).map((image) => image.public_url),
        ...journal.diary.slice(0, 1).map((image) => image.public_url),
      ];
      await preloadThumbnails(thumbnails);
      setProgress(100);
      setStatus('Cuốn sổ sẵn sàng rồi nè');
      await new Promise<void>((resolve) => window.setTimeout(resolve, 220));
      setPhase('site');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setStatus('Chưa mở được cuốn sổ');
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
      <FloatingNav />
      <main id="main" tabIndex={-1} className="site-content">
        <Hero />
        <TodayTogether memories={data.memories} gallery={data.gallery} diary={data.diary} />
        <RelationshipCounter />
        <JournalMoment />
        <OurStory memories={data.memories} />
        <JournalSpaces gallery={data.gallery} diary={data.diary} memories={data.memories} notes={data.notes} />
        <OurSoundtrack />
        <Corner notes={data.notes} stories={data.stories} settings={data.settings} />
        {!data.connected && (
          <p className="connection-note" role="status">
            Chưa kết nối được kho kỷ niệm trong môi trường này. Bạn thử tải lại nha.
          </p>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
