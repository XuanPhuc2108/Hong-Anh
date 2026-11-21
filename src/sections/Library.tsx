import { useRef, useState, type KeyboardEvent } from 'react';
import { SectionHeading } from '@/components/SectionHeading';
import { Lightbox, type LightboxItem } from '@/components/Lightbox';
import { PhotoDiary } from '@/sections/PhotoDiary';
import { siteContent, type GalleryImage, type PhotoSpaceId } from '@/lib/content';

const SPACES: { id: PhotoSpaceId | 'diary'; label: string; title: string; description: string }[] = [
  { id: 'together', label: 'Tụi mình', title: 'Những ngày có nhau', description: 'Khoảnh khắc chung, chuyến đi và những tấm hình mình cùng muốn giữ.' },
  { id: 'phuc', label: 'Góc của Phúc', title: 'Qua ống kính của Phúc', description: 'Một góc ảnh riêng, được xếp theo dữ liệu album thực tế.' },
  { id: 'anh', label: 'Góc của Ánh', title: 'Thế giới của Ánh', description: 'Những bức ảnh riêng của Ánh — mềm mại, vui vui, đúng chất Ánh.' },
  { id: 'diary', label: 'Nhật ký ảnh', title: 'Trang nhật ký', description: 'Mỗi trang là một ngày, một khoảnh khắc và vài dòng ghi chú.' },
];

function CollectionGrid({ collection }: { collection: PhotoSpaceId }) {
  const all = siteContent.gallery.images;
  const images = all.filter((image) => image.collection === collection);
  const unassigned = collection === 'together' ? all.filter((image) => !image.collection) : [];
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const lightboxItems: LightboxItem[] = [...images, ...unassigned].map((image) => ({ src: image.src, caption: image.caption }));

  const renderImages = (items: GalleryImage[], offset = 0) => (
    <div className="photo-space-grid mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
      {items.map((image, index) => (
        <button key={image.id} onClick={() => setLightboxIndex(offset + index)} className="photo-hover group relative aspect-[4/5] overflow-hidden rounded-2xl bg-white/50 text-left shadow-soft" aria-label={`Xem ảnh: ${image.caption || 'Ảnh kỷ niệm'}`}>
          <img src={image.src} alt={image.caption || 'Ảnh kỷ niệm'} loading="lazy" className="h-full w-full object-cover" />
          {image.caption && <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 to-transparent p-4 pt-10 text-sm text-white">{image.caption}</span>}
        </button>
      ))}
    </div>
  );

  if (!images.length && !unassigned.length) {
    const title = collection === 'together' ? 'Một chiếc khung còn trống nè' : 'Góc này đang chờ những bức ảnh đầu tiên';
    return (
      <div className={`photo-space-cover photo-space-${collection} relative overflow-hidden rounded-[2rem] p-7 sm:p-10`}>
        <div className="relative z-[1] max-w-xl">
          <p className="eyebrow">Bộ sưu tập · {String(all.filter((image) => image.collection === collection).length).padStart(2, '0')} ảnh</p>
          <h3 className="display mt-4 text-3xl text-ink sm:text-4xl">{title}</h3>
          <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-ink-soft">Ảnh chỉ xuất hiện ở đây khi được gắn đúng bộ sưu tập trong dữ liệu. Mình không tự đoán ảnh thuộc về ai đâu.</p>
          <a href="/admin" className="btn-tactile mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-white">Thêm ảnh trong Quản lý</a>
        </div>
        <span aria-hidden className="photo-space-orbit absolute -right-10 -top-14 size-56 rounded-full border border-rose-300/40 sm:size-72" />
      </div>
    );
  }

  return (
    <div>
      {images.length > 0 && <section aria-label="Ảnh trong bộ sưu tập">{renderImages(images)}</section>}
      {unassigned.length > 0 && (
        <section className="mt-12 border-t border-ink/10 pt-8" aria-labelledby="unassigned-title">
          <p className="eyebrow">Chưa gắn bộ sưu tập · {unassigned.length} ảnh</p>
          <h3 id="unassigned-title" className="display mt-2 text-2xl text-ink">Kho ảnh hiện có</h3>
          <p className="meta mt-2">Giữ riêng ở đây để không tự ý xếp nhầm ảnh vào album nào.</p>
          {renderImages(unassigned, images.length)}
        </section>
      )}
      <p className="meta mt-5">{images.length} ảnh trong bộ sưu tập này.</p>
      <Lightbox items={lightboxItems} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />
    </div>
  );
}

export function Library() {
  const [tab, setTab] = useState<(typeof SPACES)[number]['id']>('together');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeSpace = SPACES.find((space) => space.id === tab) ?? SPACES[0];

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % SPACES.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + SPACES.length) % SPACES.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = SPACES.length - 1;
    else return;

    event.preventDefault();
    setTab(SPACES[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <section id="library" aria-labelledby="library-title" className="relative py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading id="library-title" number="02" eyebrow="Không gian ảnh" title="Mỗi người một góc nhỏ" intro="Ba bộ sưu tập riêng và một trang nhật ký — ảnh chưa có thông tin phân loại sẽ được giữ tách biệt." />
        <div role="tablist" aria-label="Không gian ảnh" aria-orientation="horizontal" className="library-tabs mt-10 grid grid-cols-2 gap-3 md:mt-14 md:grid-cols-4 md:gap-4">
          {SPACES.map((space, index) => {
            const selected = tab === space.id;
            const count = space.id === 'diary'
              ? siteContent.diary.entries.length
              : siteContent.gallery.images.filter((image) => image.collection === space.id).length;
            const countLabel = space.id === 'diary' ? 'trang' : 'ảnh';
            return (
              <button
                key={space.id}
                ref={(element) => { tabRefs.current[index] = element; }}
                role="tab"
                id={`tab-${space.id}`}
                aria-selected={selected}
                aria-controls={`panel-${space.id}`}
                aria-label={`${space.label}, ${count} ${countLabel}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setTab(space.id)}
                onKeyDown={(event) => onKeyDown(event, index)}
                className={`library-tab group flex min-w-0 flex-col gap-5 rounded-2xl border p-4 text-left transition-all duration-300 sm:p-5 ${selected ? 'border-fuchsia/30 bg-white/80 text-ink shadow-soft' : 'border-ink/10 bg-white/35 text-ink-soft hover:border-fuchsia/20 hover:bg-white/60'}`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="eyebrow text-[0.62rem] tracking-[0.18em]">{String(index + 1).padStart(2, '0')}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs tabular-nums ${selected ? 'bg-fuchsia/10 text-fuchsia' : 'bg-ink/5 text-ink-soft'}`}>
                    {String(count).padStart(2, '0')} <span className="sr-only">{countLabel}</span>
                  </span>
                </span>
                <span className={`font-serif text-lg sm:text-xl ${selected ? 'italic' : 'group-hover:text-ink'}`}>{space.label}</span>
              </button>
            );
          })}
        </div>
        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} tabIndex={0} key={tab} className="mt-8 animate-fade-in outline-none md:mt-10">
          {tab === 'diary' ? <PhotoDiary /> : <>
            <div className="mb-6">
              <p className="eyebrow">{activeSpace.label}</p>
              <h3 className="display mt-2 text-3xl text-ink">{activeSpace.title}</h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">{activeSpace.description}</p>
            </div>
            <CollectionGrid collection={tab} />
          </>}
        </div>
      </div>
    </section>
  );
}
