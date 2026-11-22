import { useRef, useState, type KeyboardEvent } from 'react';
import { SectionHeading } from '@/components/SectionHeading';
import { MemoryGallery } from '@/sections/MemoryGallery';
import { PhotoDiary } from '@/sections/PhotoDiary';
import { siteContent } from '@/lib/content';

const TABS = [
  { id: 'gallery', label: 'Tủ ảnh' },
  { id: 'diary', label: 'Nhật ký ảnh' },
] as const;

type TabId = (typeof TABS)[number]['id'];

/** Thư viện — gallery and photo diary as two tabs; each keeps its own data. */
export function Library() {
  const { gallery, diary } = siteContent;
  const [tab, setTab] = useState<TabId>('gallery');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length;
    setTab(TABS[n].id);
    tabRefs.current[n]?.focus();
  };

  const intro = tab === 'gallery' ? gallery.intro : diary.intro;

  return (
    <section id="library" aria-labelledby="library-title" className="relative py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading id="library-title" number="02" eyebrow="Thư viện" title="Tủ ảnh và nhật ký" intro={intro} />

        <div role="tablist" aria-label="Thư viện" className="mt-12 flex gap-8 border-b border-ink/10 md:mt-16">
          {TABS.map((t, i) => {
            const selected = tab === t.id;
            return (
              <button
                key={t.id}
                ref={(el) => (tabRefs.current[i] = el)}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={selected}
                aria-controls={`panel-${t.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setTab(t.id)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={`relative -mb-px flex items-baseline gap-2 border-b py-3 font-serif text-xl transition-colors sm:text-2xl ${
                  selected ? 'border-fuchsia-600 italic text-ink' : 'border-transparent text-ink-soft hover:text-ink'
                }`}
              >
                <span className="meta not-italic tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                {t.label}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`panel-${tab}`}
          aria-labelledby={`tab-${tab}`}
          key={tab}
          className="mt-10 animate-fade-in md:mt-14"
        >
          {tab === 'gallery' ? <MemoryGallery /> : <PhotoDiary />}
        </div>
      </div>
    </section>
  );
}
