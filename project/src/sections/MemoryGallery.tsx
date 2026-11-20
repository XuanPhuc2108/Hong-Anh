import { useState } from 'react';
import { Reveal } from '@/components/Reveal';
import { SectionHeading } from '@/components/SectionHeading';
import { Lightbox, type LightboxItem } from '@/components/Lightbox';
import { siteContent, type GalleryImage } from '@/lib/content';

// Placeholder images: khi chưa có ảnh thật, dùng gradient "petal" cards.
// Khi admin upload ảnh, items sẽ được nạp từ Supabase và thay thế mảng này.
const placeholderCount = 7;

const spanClass: Record<GalleryImage['span'], string> = {
  tall: 'row-span-2',
  wide: 'col-span-2',
  square: '',
  big: 'col-span-2 row-span-2',
};

function PlaceholderTile({ index, span }: { index: number; span: GalleryImage['span'] }) {
  const gradients = [
    'from-fuchsia-400 to-fuchsia-600',
    'from-rose-300 to-fuchsia-500',
    'from-fuchsia-200 to-rose-400',
    'from-fuchsia-600 to-fuchsia-800',
    'from-rose-200 to-fuchsia-400',
    'from-fuchsia-300 to-fuchsia-500',
    'from-rose-400 to-fuchsia-600',
  ];
  const g = gradients[index % gradients.length];
  return (
    <div className={`relative h-full w-full overflow-hidden bg-gradient-to-br ${g}`}>
      <div className="paper-grain absolute inset-0 opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-700/30 to-transparent" />
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-serif text-5xl font-semibold italic text-white/70">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

export function MemoryGallery() {
  const { gallery } = siteContent;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Build display list: real images first, then placeholders to fill the editorial grid.
  const realImages = gallery.images;
  const tiles: { src?: string; caption?: string; span: GalleryImage['span'] }[] = [
    ...realImages.map((img) => ({ src: img.src, caption: img.caption, span: img.span })),
    ...Array.from({ length: Math.max(0, placeholderCount - realImages.length) }).map((_, i) => ({
      src: undefined,
      caption: undefined,
      span: (['big', 'tall', 'square', 'wide', 'square', 'tall', 'square'] as const)[i % 7],
    })),
  ];

  const lightboxItems: LightboxItem[] = tiles
    .filter((t) => t.src)
    .map((t) => ({ src: t.src!, caption: t.caption }));

  const openLightbox = (tileIndex: number) => {
    const tile = tiles[tileIndex];
    if (!tile.src) return;
    const realIndex = lightboxItems.findIndex((l) => l.src === tile.src);
    if (realIndex >= 0) setLightboxIndex(realIndex);
  };

  return (
    <section id="gallery" className="paper-texture relative bg-paper-pale/40 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow={gallery.eyebrow} title={gallery.title} intro={gallery.intro} />

        <div className="mt-12 grid auto-rows-[180px] grid-cols-2 gap-3 sm:gap-4 md:mt-16 md:auto-rows-[220px] md:grid-cols-4">
          {tiles.map((tile, i) => (
            <Reveal
              key={i}
              delay={((i % 3) + 1) as 1 | 2 | 3}
              className={`group relative overflow-hidden rounded-2xl shadow-glass ${spanClass[tile.span]}`}
            >
              <button
                onClick={() => openLightbox(i)}
                className="img-lift block h-full w-full"
                aria-label={tile.caption ? `Xem ảnh: ${tile.caption}` : 'Xem ảnh'}
              >
                {tile.src ? (
                  <img src={tile.src} alt={tile.caption ?? ''} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <PlaceholderTile index={i} span={tile.span} />
                )}
              </button>
              {tile.caption && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-ink/70 to-transparent p-3 text-left text-xs text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  {tile.caption}
                </div>
              )}
            </Reveal>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-ink-soft">
          Chạm vào một ảnh để xem lớn hơn{lightboxItems.length > 0 ? ' — vuốt sang trái/phải để chuyển ảnh.' : '.'}
        </p>
      </div>

      <Lightbox
        items={lightboxItems}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </section>
  );
}
