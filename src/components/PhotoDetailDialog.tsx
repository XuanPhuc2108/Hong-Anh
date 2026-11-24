import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Check, LoaderCircle, Share2, Trash2, X } from 'lucide-react';
import { formatFileSize, formatPhotoDate } from '@/lib/imageFiles';
import { GALLERY_ALBUMS, type GalleryImage } from '@/lib/photoLetterRepository';

type PhotoDetailDialogProps = {
  image: GalleryImage;
  src: string;
  canEdit: boolean;
  onClose: () => void;
  onSave: (image: GalleryImage) => Promise<void>;
  onDelete: (image: GalleryImage) => Promise<void>;
  onShare?: (image: GalleryImage) => Promise<boolean>;
};

export function PhotoDetailDialog({ image, src, canEdit, onClose, onSave, onDelete, onShare }: PhotoDetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [caption, setCaption] = useState(image.caption);
  const [date, setDate] = useState(image.date);
  const [albumId, setAlbumId] = useState(image.albumId);
  const [note, setNote] = useState(image.note);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onSave({ ...image, caption: caption.trim(), date, albumId, note: note.trim(), updatedAt: new Date().toISOString() });
      onClose();
    } catch (saveError) {
      console.error('Không lưu được thay đổi của ảnh.', saveError);
      setError('Chưa lưu được thay đổi. Hãy thử lại.');
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    const changed = caption !== image.caption || date !== image.date || albumId !== image.albumId || note !== image.note;
    if (busy) return;
    if (changed && !window.confirm('Bỏ các thay đổi chưa lưu?')) return;
    onClose();
  };

  const remove = async () => {
    const location = image.storagePath ? 'album chung' : 'thiết bị này';
    if (!window.confirm(`Xóa “${image.fileName}” khỏi ${location}?`)) return;
    setBusy(true);
    setError('');
    try {
      await onDelete(image);
      onClose();
    } catch (deleteError) {
      console.error('Không xóa được ảnh khỏi album chung.', deleteError);
      setError(deleteError instanceof Error && deleteError.message.includes('đã được gỡ khỏi album')
        ? deleteError.message
        : 'Chưa xóa được ảnh. Hãy thử lại.');
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    if (!onShare || busy) return;
    setBusy(true);
    setError('');
    try {
      const completed = await onShare(image);
      if (completed) onClose();
    } catch (shareError) {
      console.error('Không chuyển được ảnh vào album chung.', shareError);
      setError('Chưa chuyển được ảnh vào album chung. Hãy thử lại.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="photo-dialog photo-detail-dialog"
      aria-labelledby="photo-detail-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
    >
      <form className="photo-dialog__surface" onSubmit={save}>
        <header className="photo-dialog__header">
          <div>
            <p className="photo-dialog__eyebrow">{image.fileName} · {formatFileSize(image.fileSize)}</p>
            <h2 id="photo-detail-title">Chi tiết ảnh</h2>
          </div>
          <button type="button" className="photo-icon-button" onClick={close} aria-label="Đóng chi tiết ảnh" disabled={busy}>
            <X size={19} aria-hidden />
          </button>
        </header>

        <figure className="photo-detail-preview">
          <img src={src} alt={caption || `Ảnh ${image.fileName}`} />
        </figure>

        <div className="photo-form-grid">
          <label className="photo-form-grid__wide">
            <span>Chú thích</span>
            <input value={caption} onChange={(event) => setCaption(event.target.value)} maxLength={240} disabled={!canEdit || busy} />
          </label>
          <label>
            <span>Ngày chụp hoặc ngày kỷ niệm</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} disabled={!canEdit || busy} />
            {date && <small>{formatPhotoDate(date)}</small>}
          </label>
          <label>
            <span>Album</span>
            <select value={albumId} onChange={(event) => setAlbumId(event.target.value as GalleryImage['albumId'])} disabled={!canEdit || busy}>
              {GALLERY_ALBUMS.map((album) => <option value={album.id} key={album.id}>{album.title}</option>)}
            </select>
          </label>
          <p className="photo-uploader"><span>Người đăng</span><strong>{image.uploader}</strong></p>
          <label className="photo-form-grid__wide">
            <span>Ghi chú <em>(không bắt buộc)</em></span>
            <textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} maxLength={800} disabled={!canEdit || busy} />
          </label>
        </div>

        {error && <p className="photo-form-error" role="alert">{error}</p>}
        <footer className="photo-dialog__footer photo-dialog__footer--split">
          {onShare && !image.storagePath && (
            <button type="button" className="photo-button photo-button--quiet" onClick={() => void share()} disabled={busy}>
              <Share2 size={16} aria-hidden /> Chuyển vào album chung
            </button>
          )}
          {canEdit && (
            <button type="button" className="photo-button photo-button--danger" onClick={() => void remove()} disabled={busy}>
              <Trash2 size={16} aria-hidden /> Xóa ảnh
            </button>
          )}
          <div>
            <button type="button" className="photo-button photo-button--quiet" onClick={close} disabled={busy}>Đóng</button>
            {canEdit && (
              <button type="submit" className="photo-button photo-button--primary" disabled={busy}>
                {busy ? <><LoaderCircle className="photo-spinner" size={17} aria-hidden /> Đang lưu…</> : <><Check size={17} aria-hidden /> Lưu thay đổi</>}
              </button>
            )}
          </div>
        </footer>
      </form>
    </dialog>
  );
}
