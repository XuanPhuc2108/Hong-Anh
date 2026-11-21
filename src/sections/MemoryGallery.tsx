import { useState } from 'react';
import { Reveal } from '@/components/Reveal';
import { Lightbox, type LightboxItem } from '@/components/Lightbox';
import { siteContent, type GalleryImage } from '@/lib/content';

// Khi chưa có ảnh thật, hiển thị khung trống trung thực (không bịa ảnh).
// Khi admin thêm ảnh, items được nạp và thay thế các khung này.
const placeholderCount = 6;

// Editorial rhythm: first tile dominates, then varied proportions.
const spanClass: Record<GalleryImage['span'], string> = {
  big: 'col-span-2 row-span-2 md:col-span-4 md:row-span-3',
  tall: 'row-span-2 md:col-span-2 md:row-span-3',
  wide: 'col-span-2 md:col-span-3 md:row-span-2',
  square: 'md:col-span-2 md:row-span-2',
};

const placeholderSpans: GalleryImage['span'][] = ['big', 'tall', 'square', 'wide', 'square', 'tall'];

export function MemoryGallery() {
  const { gallery } = siteContent;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const realImages = gallery.images;
  const tiles: { src?: string; caption?: string; span: GalleryImage['span'] }[] = [
    ...realImages.map((img) => ({ src: img.src, caption: img.caption, span: img.span })),
    ...Array.from({ length: Math.max(0, placeholderCount - realImages.length) }).map((_, i) => ({
      src: undefined,
      caption: undefined,
      span: placeholderSpans[(realImages.length + i) % placeholderSpans.length],
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
    <div>
      <div className="grid auto-rows-[120px] grid-cols-2 gap-3 sm:auto-rows-[150px] sm:gap-4 md:auto-rows-[88px] md:grid-cols-6 md:gap-5">
        {tiles.map((tile, i) => (
          <Reveal
            key={i}
            variant="photo"
            delay={((i % 3) + 1) as 1 | 2 | 3}
            className={`group relative ${spanClass[tile.span]}`}
          >
            {tile.src ? (
              <button
                onClick={() => openLightbox(i)}
                className="photo-hover block h-full w-full overflow-hidden rounded-[2px] shadow-soft"
                aria-label={tile.caption ? `Xem ảnh: ${tile.caption}` : 'Xem ảnh'}
              >
                <img src={tile.src} alt={tile.caption ?? ''} loading="lazy" className="h-full w-full object-cover" />
                {tile.caption && (
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-3 text-left font-serif text-sm italic text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    {tile.caption}
                  </span>
                )}
              </button>
            ) : (
              <div className="frame-empty relative flex h-full w-full items-end overflow-hidden rounded-[2px] p-4">
                <span className="meta relative z-[1] tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              </div>
            )}
          </Reveal>
        ))}
      </div>

      <p className="meta mt-6">
        {lightboxItems.length > 0
          ? 'Chạm vào một ảnh để xem lớn hơn — vuốt sang trái/phải để chuyển ảnh.'
          : 'Các khung đang chờ ảnh — thêm ảnh qua trang quản lý.'}
      </p>

      <Lightbox
        items={lightboxItems}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}
