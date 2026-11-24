import { useCallback, useEffect, useMemo, useState } from 'react';
import { Flower2, Heart, Images, Plus, Sparkles } from 'lucide-react';
import { Lightbox, type LightboxItem } from '@/components/Lightbox';
import { PhotoDetailDialog } from '@/components/PhotoDetailDialog';
import { PhotoUploadDialog } from '@/components/PhotoUploadDialog';
import { formatPhotoDate } from '@/lib/imageFiles';
import {
  GALLERY_ALBUMS,
  photoLetterRepository,
  type CoupleIdentity,
  type GalleryAlbum,
  type GalleryAlbumId,
  type GalleryImage,
  type SharedJournalRepository,
} from '@/lib/photoLetterRepository';
import { SupabaseSharedJournalRepository } from '@/lib/sharedJournalRepository';
import { supabase } from '@/lib/supabase';
import type { DiaryRecord, GalleryRecord, MemoryRecord, NoteRecord } from '@/lib/journalData';
import { imageSpace } from '@/lib/journalData';

const SPACE_ICONS = { together: Heart, phuc: Images, anh: Flower2 };

type DisplayPhoto = {
  id: string;
  albumId: GalleryAlbumId | null;
  src: string;
  caption: string;
  date: string;
  source: 'local' | 'existing' | 'shared';
  note?: string;
  local?: GalleryImage;
  shared?: GalleryImage;
};

type LightboxScope = 'album' | 'unclassified' | 'diary';
type LightboxSelection = { scope: LightboxScope; index: number } | null;

function SpaceGlyph({ id }: { id: GalleryAlbumId }) {
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

function AlbumPhoto({ image, index, onOpen }: { image: DisplayPhoto; index: number; onOpen: () => void }) {
  return (
    <figure className="gallery-photo">
      <button type="button" className="gallery-photo__open" onClick={onOpen} aria-label={`Xem ảnh ${image.caption || index + 1}`}>
        <img src={image.src} alt={image.caption || `Ảnh ${index + 1} trong album`} loading="lazy" decoding="async" />
        <span className="gallery-photo__local">
          {image.source === 'local' ? 'Trên thiết bị này' : image.source === 'shared' ? 'Album chung' : 'Ảnh hiện có'}
        </span>
      </button>
      {(image.caption || image.date) && (
        <figcaption className="gallery-photo__caption">
          {image.caption && <span>{image.caption}</span>}
          {image.date && <time dateTime={image.date}>{formatPhotoDate(image.date)}</time>}
        </figcaption>
      )}
    </figure>
  );
}

export function JournalSpaces({
  identity,
  gallery,
  diary,
  memories,
  notes,
  localNoteCount = 0,
}: {
  identity: CoupleIdentity;
  gallery: GalleryRecord[];
  diary: DiaryRecord[];
  memories: MemoryRecord[];
  notes: NoteRecord[];
  localNoteCount?: number;
}) {
  const [activeSpace, setActiveSpace] = useState<GalleryAlbumId>('together');
  const [albums, setAlbums] = useState<GalleryAlbum[]>(GALLERY_ALBUMS);
  const [localPhotos, setLocalPhotos] = useState<GalleryImage[]>([]);
  const [sharedPhotos, setSharedPhotos] = useState<GalleryImage[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Map<string, string>>(new Map());
  const [localError, setLocalError] = useState('');
  const [sharedError, setSharedError] = useState('');
  const [realtimeError, setRealtimeError] = useState('');
  const [localLoading, setLocalLoading] = useState(true);
  const [sharedLoading, setSharedLoading] = useState(true);
  const [lightbox, setLightbox] = useState<LightboxSelection>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryImage | null>(null);
  const [notice, setNotice] = useState('');
  const sharedRepository = useMemo<SharedJournalRepository>(
    () => new SupabaseSharedJournalRepository(identity),
    [identity]
  );

  const refreshLocalPhotos = useCallback(async () => {
    setLocalLoading(true);
    try {
      const [images, savedAlbums] = await Promise.all([
        photoLetterRepository.listPhotos(),
        photoLetterRepository.listAlbums(),
      ]);
      setLocalPhotos(images.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      setAlbums(savedAlbums);
      setLocalError('');
    } catch (error) {
      console.error('Không đọc được ảnh đã lưu trên thiết bị.', error);
      setLocalError('Chưa đọc được album trên thiết bị này. Tải lại trang để thử lại.');
    } finally {
      setLocalLoading(false);
    }
  }, []);

  const refreshSharedPhotos = useCallback(async () => {
    setSharedLoading(true);
    try {
      setSharedPhotos(await sharedRepository.listSharedPhotos());
      setSharedError('');
    } catch (error) {
      console.error('Không tải được album chung.', error);
      setSharedError('Chưa tải được album chung. Kiểm tra kết nối rồi thử lại.');
    } finally {
      setSharedLoading(false);
    }
  }, [sharedRepository]);

  useEffect(() => {
    void refreshLocalPhotos();
  }, [refreshLocalPhotos]);

  useEffect(() => {
    void refreshSharedPhotos();
    const channel = supabase
      .channel(`couple-gallery-${identity.userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'couple_gallery_images' }, () => {
        void refreshSharedPhotos();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeError('');
          void refreshSharedPhotos();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setRealtimeError('Cập nhật trực tiếp đang tạm ngắt. Tải lại album để xem thay đổi mới nhất.');
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [identity.userId, refreshSharedPhotos]);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void refreshSharedPhotos();
    };
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => document.removeEventListener('visibilitychange', refreshWhenVisible);
  }, [refreshSharedPhotos]);

  useEffect(() => {
    const urls = new Map(localPhotos.flatMap((image) => (
      image.blob ? [[image.id, URL.createObjectURL(image.blob)] as const] : []
    )));
    setPhotoUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [localPhotos]);

  const localDisplay = useMemo<DisplayPhoto[]>(
    () => localPhotos.flatMap((image) => {
      const src = photoUrls.get(image.id);
      return src ? [{ id: image.id, albumId: image.albumId, src, caption: image.caption, date: image.date, source: 'local' as const, local: image }] : [];
    }),
    [localPhotos, photoUrls]
  );
  const remoteDisplay = useMemo<DisplayPhoto[]>(
    () => gallery.map((image) => ({
      id: `existing-${image.id}`,
      albumId: imageSpace(image.storage_path),
      src: image.public_url,
      caption: image.caption || '',
      date: '',
      source: 'existing',
      note: 'Ảnh hiện có chỉ xem được; chỉnh sửa và xóa cần kết nối lưu trữ.',
    })),
    [gallery]
  );
  const sharedDisplay = useMemo<DisplayPhoto[]>(
    () => sharedPhotos.flatMap((image) => image.signedUrl ? [{
      id: `shared-${image.id}`,
      albumId: image.albumId,
      src: image.signedUrl,
      caption: image.caption,
      date: image.date,
      source: 'shared' as const,
      note: image.note,
      shared: image,
    }] : []),
    [sharedPhotos]
  );
  const grouped = useMemo(() => {
    const albumsById: Record<GalleryAlbumId, DisplayPhoto[]> = { together: [], phuc: [], anh: [] };
    for (const image of [...localDisplay, ...sharedDisplay, ...remoteDisplay]) {
      if (image.albumId) albumsById[image.albumId].push(image);
    }
    return {
      together: albumsById.together,
      phuc: albumsById.phuc,
      anh: albumsById.anh,
      unclassified: remoteDisplay.filter((image) => image.albumId === null),
    };
  }, [localDisplay, remoteDisplay, sharedDisplay]);

  const selectedAlbum = albums.find((item) => item.id === activeSpace) ?? GALLERY_ALBUMS[0];
  const sharedCover = sharedPhotos.find((image) => image.albumId === activeSpace && image.isCover);
  const album = sharedCover
    ? { ...selectedAlbum, coverPhotoId: `shared-${sharedCover.id}` }
    : selectedAlbum;
  const activeImages = grouped[activeSpace];
  const albumCover = activeImages.find((image) => image.id === album.coverPhotoId) ?? activeImages[0];
  const diaryImages: DisplayPhoto[] = diary.map((image) => ({
    id: image.id,
    albumId: null,
    src: image.public_url,
    caption: image.caption || '',
    date: image.date || '',
    source: 'existing',
  }));
  const groupedUnclassified = grouped.unclassified;

  const lightboxItems = (images: DisplayPhoto[]): LightboxItem[] => images.map((image) => ({
    src: image.src,
    caption: image.caption || undefined,
    date: image.date || undefined,
    note: image.note,
    ...(image.local || image.shared?.ownerId === identity.userId ? { onEdit: () => {
      setLightbox(null);
      setEditingPhoto(image.local ?? image.shared ?? null);
    } } : {}),
  }));

  const albumItems = lightboxItems(activeImages);
  const unclassifiedItems = lightboxItems(groupedUnclassified);
  const diaryItems = lightboxItems(diaryImages);

  const handleUpload = async (images: GalleryImage[], coverPhotoId: string) => {
    await sharedRepository.uploadPhotos(images, coverPhotoId);
  };

  const handleUploaded = async (albumId: GalleryAlbumId, count: number) => {
    setActiveSpace(albumId);
    await refreshSharedPhotos();
    const target = GALLERY_ALBUMS.find((item) => item.id === albumId);
    setNotice(`Đã thêm ${count} ảnh vào album ${target?.title ?? 'đã chọn'} chung.`);
  };

  const updatePhoto = async (image: GalleryImage) => {
    if (image.storagePath) await sharedRepository.updateSharedPhoto(image);
    else await photoLetterRepository.updatePhoto(image);
    setActiveSpace(image.albumId);
    await Promise.all([refreshLocalPhotos(), refreshSharedPhotos()]);
    setNotice('Đã lưu thay đổi trong album chung.');
  };

  const deletePhoto = async (image: GalleryImage) => {
    if (image.storagePath) await sharedRepository.deleteSharedPhoto(image);
    else await photoLetterRepository.deletePhoto(image.id);
    await Promise.all([refreshLocalPhotos(), refreshSharedPhotos()]);
    setNotice(image.storagePath ? 'Đã xóa ảnh khỏi album chung.' : 'Đã xóa ảnh trên thiết bị này.');
  };

  const shareLocalPhoto = async (image: GalleryImage) => {
    if (!window.confirm(`Chuyển “${image.fileName}” vào album riêng chung? Người còn lại sẽ xem được ảnh này.`)) return false;
    await sharedRepository.uploadPhotos([image], image.id);
    let localCopyRemains = false;
    try {
      await photoLetterRepository.deletePhoto(image.id);
    } catch (error) {
      console.error('Ảnh đã chia sẻ nhưng chưa xóa được bản lưu cũ trên thiết bị.', error);
      localCopyRemains = true;
    }
    await Promise.all([refreshLocalPhotos(), refreshSharedPhotos()]);
    setNotice(localCopyRemains
      ? 'Ảnh đã được chia sẻ. Bản cũ vẫn còn lưu trên thiết bị này.'
      : 'Đã chuyển ảnh vào album chung.');
    return true;
  };

  const loading = localLoading || sharedLoading;

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
    <section className="spaces-section section-anchor" id="spaces" aria-labelledby="spaces-title">
      <div className="spaces-wrap">
        <div className="section-lead section-lead--wide">
          <span className="section-kicker">Kho ảnh</span>
          <h2 id="spaces-title">Ba không gian ảnh</h2>
          <p>Mỗi album giữ một phần câu chuyện riêng. Chọn album để xem hoặc thêm ảnh.</p>
        </div>

        <div className="space-portals" role="group" aria-label="Chọn album ảnh">
          {GALLERY_ALBUMS.map((space, index) => {
            const Icon = SPACE_ICONS[space.id];
            const selected = space.id === activeSpace;
            const count = grouped[space.id].length;
            return (
              <button
                type="button"
                id={`album-tab-${space.id}`}
                aria-pressed={selected}
                key={space.id}
                className={`space-portal space-portal--${space.id} ${selected ? 'is-selected' : ''}`}
                onClick={() => {
                  setActiveSpace(space.id);
                  setLightbox(null);
                  setNotice('');
                }}
              >
                <span className="space-portal__art"><SpaceGlyph id={space.id} /></span>
                <span className="space-portal__meta">
                  <span className="space-portal__index">0{index + 1}</span>
                  <span className="space-portal__count">{count} ảnh</span>
                </span>
                <span className="space-portal__title">{space.title}</span>
                <span className="space-portal__subtitle">{space.subtitle}</span>
                <Icon className="space-portal__icon" size={18} aria-hidden />
              </button>
            );
          })}
        </div>

        <div
          className={`gallery-album gallery-album--${album.style}`}
          id="album-panel"
          aria-labelledby={`album-tab-${activeSpace}`}
        >
          <div className="gallery-album__cover">
            {albumCover
              ? <img src={albumCover.src} alt={albumCover.caption || `Ảnh bìa album ${album.title}`} />
              : <SpaceGlyph id={activeSpace} />}
            <span>Ảnh bìa</span>
          </div>
          <div className="gallery-album__intro">
            <p className="gallery-album__eyebrow">{album.owner === 'Cả hai' ? 'Album chung' : `Album của ${album.owner}`}</p>
            <h3>{album.title}</h3>
            <p className="gallery-album__subtitle">{album.subtitle}</p>
            <p className="gallery-album__description">{album.description}</p>
            <div className="gallery-album__actions">
              <span>{activeImages.length} ảnh</span>
              <button type="button" className="photo-button photo-button--primary" onClick={() => setShowUploader(true)}>
                <Plus size={17} aria-hidden /> Thêm ảnh
              </button>
            </div>
          </div>
        </div>

        {notice && <p className="gallery-notice" role="status">{notice}</p>}
        {localError && (
          <div className="gallery-storage-error" role="alert">
            <p>{localError}</p>
            <button type="button" className="photo-button photo-button--quiet" onClick={() => void refreshLocalPhotos()}>Thử tải lại</button>
          </div>
        )}
        {sharedError && (
          <div className="gallery-storage-error" role="alert">
            <p>{sharedError}</p>
            <button type="button" className="photo-button photo-button--quiet" onClick={() => void refreshSharedPhotos()}>Thử tải lại</button>
          </div>
        )}
        {realtimeError && <p className="gallery-notice" role="status">{realtimeError}</p>}

        <div className={`gallery-album-panel gallery-album-panel--${activeSpace}`}>
          <header className="gallery-album-panel__heading">
            <div>
              <h3>{activeImages.length ? 'Ảnh trong album' : 'Album đang trống'}</h3>
              <p>{loading ? 'Đang mở album…' : `${activeImages.length} bức ảnh`}</p>
            </div>
            <Sparkles size={19} aria-hidden />
          </header>
          {activeImages.length > 0 ? (
            <div className={`gallery-masonry gallery-masonry--${album.style}`}>
              {activeImages.map((image, index) => (
                <AlbumPhoto key={image.id} image={image} index={index} onOpen={() => setLightbox({ scope: 'album', index })} />
              ))}
            </div>
          ) : !loading && (
            <div className={`gallery-empty gallery-empty--${album.style}`}>
              <SpaceGlyph id={activeSpace} />
              <h4>Chưa có ảnh nào ở đây.</h4>
              <p>Thêm ảnh để bắt đầu lưu những khoảnh khắc trong album này.</p>
              <button type="button" className="photo-button photo-button--quiet" onClick={() => setShowUploader(true)}>
                <Plus size={16} aria-hidden /> Chọn ảnh
              </button>
            </div>
          )}
        </div>

        {groupedUnclassified.length > 0 && (
          <section className="gallery-unclassified" aria-labelledby="unclassified-title">
            <div className="gallery-unclassified__heading">
              <div>
                <h3 id="unclassified-title">Ảnh chưa xếp album</h3>
                <p>Ảnh hiện có chưa gắn với một trong ba không gian.</p>
              </div>
              <span>{groupedUnclassified.length}</span>
            </div>
            <div className="gallery-masonry gallery-masonry--unclassified">
              {groupedUnclassified.map((image, index) => (
                <AlbumPhoto key={image.id} image={image} index={index} onOpen={() => setLightbox({ scope: 'unclassified', index })} />
              ))}
            </div>
          </section>
        )}

        <section className="gallery-diary" aria-labelledby="gallery-diary-title">
          <div className="gallery-diary__heading">
            <div>
              <span className="section-kicker">Nhật ký ảnh</span>
              <h3 id="gallery-diary-title">Những ngày đã lưu</h3>
            </div>
            {diary.length > 0 && <span>{diary.length} trang</span>}
          </div>
          {diaryImages.length > 0 ? (
            <div className="gallery-diary__grid">
              {diaryImages.map((image, index) => (
                <AlbumPhoto key={image.id} image={image} index={index} onOpen={() => setLightbox({ scope: 'diary', index })} />
              ))}
            </div>
          ) : (
            <p className="gallery-diary__empty">Chưa có trang nhật ký ảnh.</p>
          )}
        </section>

        {statistics.length > 0 && (
          <dl className="real-statistics" aria-label="Số liệu trong kho My Love">
            {statistics.map((stat) => (
              <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>
            ))}
          </dl>
        )}

        <Lightbox
          items={albumItems}
          index={lightbox?.scope === 'album' ? lightbox.index : null}
          onClose={() => setLightbox(null)}
          onNavigate={(index) => setLightbox({ scope: 'album', index })}
        />
        <Lightbox
          items={unclassifiedItems}
          index={lightbox?.scope === 'unclassified' ? lightbox.index : null}
          onClose={() => setLightbox(null)}
          onNavigate={(index) => setLightbox({ scope: 'unclassified', index })}
        />
        <Lightbox
          items={diaryItems}
          index={lightbox?.scope === 'diary' ? lightbox.index : null}
          onClose={() => setLightbox(null)}
          onNavigate={(index) => setLightbox({ scope: 'diary', index })}
        />

        {showUploader && (
          <PhotoUploadDialog
            initialAlbum={activeSpace}
            uploader={identity.name}
            onClose={() => setShowUploader(false)}
            onUpload={handleUpload}
            onUploaded={handleUploaded}
          />
        )}
        {editingPhoto && (editingPhoto.signedUrl || photoUrls.get(editingPhoto.id)) && (
          <PhotoDetailDialog
            key={editingPhoto.id}
            image={editingPhoto}
            src={editingPhoto.signedUrl ?? photoUrls.get(editingPhoto.id) ?? ''}
            canEdit={!editingPhoto.storagePath || editingPhoto.ownerId === identity.userId}
            onClose={() => setEditingPhoto(null)}
            onSave={updatePhoto}
            onDelete={deletePhoto}
            onShare={editingPhoto.storagePath ? undefined : shareLocalPhoto}
          />
        )}
      </div>
    </section>
  );
}
