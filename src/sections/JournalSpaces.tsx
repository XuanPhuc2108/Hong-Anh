import { useMemo, useRef, useState } from 'react';
import { Flower2, Heart, Images, Sparkles } from 'lucide-react';
import { Lightbox, type LightboxItem } from '@/components/Lightbox';
import { RefractiveImageLens } from '@/components/RefractiveImageLens';
import type { DiaryRecord, GalleryRecord, MemoryRecord, NoteRecord } from '@/lib/journalData';
import { imageSpace } from '@/lib/journalData';

const SPACES = [
  { id: 'together', title: 'Tụi mình', subtitle: 'Ảnh chụp chung', icon: Heart },
  { id: 'phuc', title: 'Góc Phúc', subtitle: 'Ảnh của Phúc', icon: Images },
  { id: 'anh', title: 'Góc Ánh', subtitle: 'Ảnh của Ánh', icon: Flower2 },
] as const;

type SpaceId = (typeof SPACES)[number]['id'];
type LightboxScope = 'space' | 'unclassified' | 'diary';
type LightboxSelection = { scope: LightboxScope; index: number } | null;

function PhotoTile({
  image,
  index,
  spaceTitle,
  onOpen,
}: {
  image: GalleryRecord | DiaryRecord;
  index: number;
  spaceTitle: string;
  onOpen: () => void;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const caption = image.caption?.trim();
  const size = 'span' in image ? image.span : String(index % 5);
  return (
    <figure className={`space-photo space-photo--${size}`}>
      <button ref={buttonRef} type="button" className="space-photo__button photo-hover" onClick={onOpen} aria-label={`Mở ảnh ${index + 1} trong ${spaceTitle}`}>
        <img
          ref={imageRef}
          src={image.public_url}
          alt={caption || `Ảnh ${index + 1} trong ${spaceTitle}`}
          loading="lazy"
          decoding="async"
          width="1200"
          height="900"
        />
        {index === 0 && (
          <RefractiveImageLens
            stageRef={buttonRef}
            imageRef={imageRef}
            src={image.public_url}
            className="space-photo__lens"
            radius={18}
            refraction={20}
          />
        )}
      </button>
    </figure>
  );
}

function SpaceGlyph({ id }: { id: SpaceId }) {
  if (id === 'together') {
    return (
      <svg viewBox="0 0 220 140" aria-hidden>
        <path d="M37 24h90a14 14 0 0 1 14 14v76H51a14 14 0 0 1-14-14V24Z" fill="#F5DCE3" />
        <path d="M78 40h91a14 14 0 0 1 14 14v70H92a14 14 0 0 1-14-14V40Z" fill="#FFF9F2" />
        <path d="M128 91c-17-12-29-21-29-33 0-11 13-17 22-7 9-10 22-4 22 7 0 12-12 21-29 33Z" fill="#C64F76" />
        <path d="M49 111h71" stroke="#C8798E" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (id === 'phuc') {
    return (
      <svg viewBox="0 0 220 140" aria-hidden>
        <rect x="36" y="24" width="148" height="96" rx="3" fill="#E4D9D0" />
        <rect x="51" y="38" width="118" height="68" rx="2" fill="#F8F1E9" />
        <path d="M61 94 89 65l16 16 17-22 26 35H61Z" fill="#9E7778" />
        <circle cx="139" cy="55" r="8" fill="#D9A5A9" />
        <path d="M50 119h122" stroke="#7D5B60" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 220 140" aria-hidden>
      <path d="M107 67c-17-22-37-23-44-8-6 14 6 28 31 34-28 1-40 14-32 28 8 13 27 9 44-12-10 26-3 43 12 41 16-2 17-21-1-43 22 18 42 17 47 2 5-15-10-28-38-27 26-11 33-28 21-38-13-10-29-1-40 23Z" fill="#D77E98" fillOpacity=".42" stroke="#B84F72" strokeWidth="2" />
      <circle cx="111" cy="83" r="7" fill="#B84F72" />
      <path d="M111 90c-4 18-12 31-23 42m24-33c8 15 18 24 31 30" stroke="#8D596A" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function JournalSpaces({
  gallery,
  diary,
  memories,
  notes,
  localNoteCount = 0,
}: {
  gallery: GalleryRecord[];
  diary: DiaryRecord[];
  memories: MemoryRecord[];
  notes: NoteRecord[];
  localNoteCount?: number;
}) {
  const [activeSpace, setActiveSpace] = useState<SpaceId>('together');
  const [lightbox, setLightbox] = useState<LightboxSelection>(null);
  const grouped = useMemo(
    () => ({
      together: gallery.filter((image) => imageSpace(image.storage_path) === 'together'),
      phuc: gallery.filter((image) => imageSpace(image.storage_path) === 'phuc'),
      anh: gallery.filter((image) => imageSpace(image.storage_path) === 'anh'),
      unclassified: gallery.filter((image) => imageSpace(image.storage_path) === null),
    }),
    [gallery]
  );
  const active = SPACES.find((space) => space.id === activeSpace) ?? SPACES[0];
  const activeImages = grouped[activeSpace];
  const activeLightbox: LightboxItem[] = activeImages.map((image) => ({
    src: image.public_url,
    caption: image.caption || undefined,
  }));
  const unclassifiedLightbox: LightboxItem[] = grouped.unclassified.map((image) => ({
    src: image.public_url,
    caption: image.caption || undefined,
  }));
  const diaryLightbox: LightboxItem[] = diary.map((image) => ({
    src: image.public_url,
    caption: image.caption || undefined,
  }));
  const highlight = gallery[0] ?? diary[0];
  const knownTitles = ['ngày bắt đầu trò chuyện', 'chính thức bên nhau'];
  const savedMemoryCount =
    memories.length +
    2 -
    memories.filter((memory) => knownTitles.includes(memory.title.trim().toLocaleLowerCase('vi'))).length;
  const statistics = [
    { label: 'Ảnh tụi mình', value: grouped.together.length },
    { label: 'Ảnh của Phúc', value: grouped.phuc.length },
    { label: 'Ảnh của Ánh', value: grouped.anh.length },
    { label: 'Kỷ niệm', value: Math.max(0, savedMemoryCount) },
    { label: 'Trang nhật ký', value: diary.length },
    { label: 'Ghi chú', value: notes.length + localNoteCount },
  ].filter((stat) => stat.value > 0);

  return (
    <section id="spaces" aria-labelledby="spaces-title" className="spaces-section section-anchor">
      <div className="spaces-wrap">
        <div className="section-lead section-lead--wide">
          <span className="section-kicker">Kho ảnh</span>
          <h2 id="spaces-title">Ba góc ảnh xinh xinh</h2>
          <p>Ảnh được xếp theo từng góc nè. Ảnh chưa phân loại sẽ nằm riêng.</p>
        </div>

        <div className="space-portals" aria-label="Chọn không gian ảnh">
          {SPACES.map((space, index) => {
            const Icon = space.icon;
            const selected = space.id === activeSpace;
            const count = grouped[space.id].length;
            return (
              <button
                type="button"
                key={space.id}
                className={`space-portal space-portal--${space.id} ${selected ? 'is-selected' : ''}`}
                onClick={() => {
                  setActiveSpace(space.id);
                  setLightbox(null);
                }}
                aria-pressed={selected}
              >
                <span className="space-portal__art"><SpaceGlyph id={space.id} /></span>
                <span className="space-portal__meta">
                  <span className="space-portal__index">0{index + 1}</span>
                  {count > 0 &&                   <span className="space-portal__count">{count} ảnh</span>}
                </span>
                <span className="space-portal__title">{space.title}</span>
                <span className="space-portal__subtitle">{space.subtitle}</span>
                <Icon className="space-portal__icon" size={18} aria-hidden />
              </button>
            );
          })}
        </div>

        <div className={`space-gallery space-gallery--${activeSpace}`}>
          <div className="space-gallery__heading">
            <div>
              <h3>{active.title}</h3>
              <p>{activeImages.length > 0 ? `${activeImages.length} ảnh trong góc này` : 'Góc này đang chờ ảnh đầu tiên nè.'}</p>
            </div>
            <Sparkles size={20} aria-hidden />
          </div>
          {activeImages.length > 0 ? (
            <div className="space-masonry">
              {activeImages.map((image, index) => (
                <PhotoTile
                  key={image.id}
                  image={image}
                  index={index}
                  spaceTitle={active.title}
                  onOpen={() => setLightbox({ scope: 'space', index })}
                />
              ))}
            </div>
          ) : (
            <div className="space-empty">
              <SpaceGlyph id={activeSpace} />
              <p>Chưa có ảnh trong {active.title} nè.</p>
              <span>Ảnh sẽ hiện ở đây khi được thêm vào kho.</span>
            </div>
          )}
        </div>
        <Lightbox
          items={activeLightbox}
          index={lightbox?.scope === 'space' ? lightbox.index : null}
          onClose={() => setLightbox(null)}
          onNavigate={(index) => setLightbox({ scope: 'space', index })}
        />

        {grouped.unclassified.length > 0 && (
          <div className="unclassified-shelf">
            <div className="unclassified-shelf__heading">
              <h3>Ảnh chưa gắn không gian</h3>
              <span>{grouped.unclassified.length} ảnh</span>
            </div>
            <p>Mấy tấm này chưa có góc riêng, nên mình để ở đây nha.</p>
            <div className="space-masonry space-masonry--unclassified">
              {grouped.unclassified.map((image, index) => (
                <PhotoTile
                  key={image.id}
                  image={image}
                  index={index}
                  spaceTitle="kho ảnh"
                  onOpen={() => setLightbox({ scope: 'unclassified', index })}
                />
              ))}
            </div>
          </div>
        )}
        <Lightbox
          items={unclassifiedLightbox}
          index={lightbox?.scope === 'unclassified' ? lightbox.index : null}
          onClose={() => setLightbox(null)}
          onNavigate={(index) => setLightbox({ scope: 'unclassified', index })}
        />

        <div className="diary-spread">
          <div className="diary-spread__head">
            <div>
              <span className="section-kicker">Nhật ký ảnh</span>
              <h3>Mấy trang đã cất</h3>
            </div>
            {diary.length > 0 && <span>{diary.length} trang</span>}
          </div>
          {diary.length > 0 ? (
            <div className="diary-grid">
              {diary.map((entry, index) => (
                <article className="diary-entry" key={entry.id}>
                  <div className="diary-entry__text">
                    {entry.date && <time>{entry.date}</time>}
                    {entry.caption && <p>{entry.caption}</p>}
                  </div>
                  <PhotoTile image={entry} index={index} spaceTitle="nhật ký ảnh" onOpen={() => setLightbox({ scope: 'diary', index })} />
                </article>
              ))}
            </div>
          ) : (
            <div className="diary-empty">
              <span className="diary-empty__line" aria-hidden />
              <p>Chưa có trang ảnh nào nè.</p>
            </div>
          )}
          <Lightbox
            items={diaryLightbox}
            index={lightbox?.scope === 'diary' ? lightbox.index : null}
            onClose={() => setLightbox(null)}
            onNavigate={(index) => setLightbox({ scope: 'diary', index })}
          />
        </div>

        {highlight && (
          <div className="memory-highlight">
            <div className="memory-highlight__text">
              <span className="section-kicker">Một khung hình</span>
              <h3>Ảnh đầu tiên trong kho</h3>
              {highlight.caption && <p>{highlight.caption}</p>}
            </div>
            <figure>
              <img src={highlight.public_url} alt={highlight.caption || 'Ảnh trong kho My Love'} loading="lazy" decoding="async" width="1200" height="900" />
            </figure>
          </div>
        )}

        {statistics.length > 0 && (
          <dl className="real-statistics" aria-label="Số liệu trong kho My Love">
            {statistics.map((stat) => (
              <div key={stat.label}>
                <dt>{stat.label}</dt>
                <dd>{stat.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
