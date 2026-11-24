import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, Check, ImagePlus, LoaderCircle, Trash2, X } from 'lucide-react';
import { findReadableImages, formatFileSize, getImageMimeType } from '@/lib/imageFiles';
import {
  createLocalId,
  GALLERY_ALBUMS,
  type CoupleName,
  type GalleryAlbumId,
  type GalleryImage,
} from '@/lib/photoLetterRepository';

type UploadItem = { id: string; file: File };

type PhotoUploadDialogProps = {
  initialAlbum: GalleryAlbumId;
  uploader: CoupleName;
  onClose: () => void;
  onUpload: (images: GalleryImage[], coverPhotoId: string) => Promise<void>;
  onUploaded: (albumId: GalleryAlbumId, count: number) => Promise<void>;
};

export function PhotoUploadDialog({ initialAlbum, uploader, onClose, onUpload, onUploaded }: PhotoUploadDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [files, setFiles] = useState<UploadItem[]>([]);
  const [coverId, setCoverId] = useState('');
  const [albumId, setAlbumId] = useState<GalleryAlbumId>(initialAlbum);
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [activity, setActivity] = useState<'idle' | 'checking' | 'saving'>('idle');
  const busy = activity !== 'idle';
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [previews, setPreviews] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  useEffect(() => {
    const urls = new Map(files.map((item) => [item.id, URL.createObjectURL(item.file)]));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const addFiles = async (incoming: File[]) => {
    if (incoming.length === 0) return;
    setActivity('checking');
    setError('');
    try {
      const { accepted, rejected } = await findReadableImages(incoming);
      const additions = accepted.map((file) => ({ id: createLocalId(), file }));
      setFiles((current) => [...current, ...additions]);
      setCoverId((current) => current || additions[0]?.id || '');
      if (rejected.length > 0) {
        setError(`Không thể dùng ${rejected.slice(0, 3).join(', ')}${rejected.length > 3 ? ` và ${rejected.length - 3} ảnh khác` : ''}. Ảnh cần dưới 50 MB và trình duyệt phải đọc được.`);
      }
    } catch (validationError) {
      console.error('Không thể kiểm tra ảnh đã chọn.', validationError);
      setError('Không kiểm tra được ảnh. Hãy chọn lại hoặc thử một định dạng ảnh khác.');
    } finally {
      setActivity('idle');
    }
  };

  const onChoose = (event: ChangeEvent<HTMLInputElement>) => {
    void addFiles(Array.from(event.currentTarget.files ?? []));
    event.currentTarget.value = '';
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    void addFiles(Array.from(event.dataTransfer.files));
  };

  const removeFile = (id: string) => {
    const next = files.filter((item) => item.id !== id);
    setFiles(next);
    setCoverId((current) => current === id ? next[0]?.id ?? '' : current);
  };

  const moveFile = (index: number, direction: -1 | 1) => {
    setFiles((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (files.length === 0) {
      setError('Chọn ít nhất một ảnh để tiếp tục.');
      return;
    }
    setActivity('saving');
    setError('');
    try {
      const now = new Date().toISOString();
      const images: GalleryImage[] = files.map(({ id, file }, sortOrder) => ({
        id,
        albumId,
        sortOrder,
        blob: file,
        fileName: file.name,
        fileSize: file.size,
        mimeType: getImageMimeType(file),
        caption: caption.trim(),
        date,
        uploader,
        note: note.trim(),
        createdAt: now,
        updatedAt: now,
      }));
      await onUpload(images, coverId);
      await onUploaded(albumId, images.length);
      onClose();
    } catch (saveError) {
      console.error('Không tải được ảnh vào album chung.', saveError);
      const message = saveError instanceof Error ? saveError.message : '';
      setError(message.includes('vượt quá giới hạn') || message.includes('không được hỗ trợ') || message.includes('không còn dữ liệu')
        ? message
        : 'Chưa tải được ảnh lên album chung. Kiểm tra kết nối rồi thử lại.');
    } finally {
      setActivity('idle');
    }
  };

  const close = () => {
    if (busy) return;
    if ((files.length > 0 || caption || date || note) && !window.confirm('Bỏ ảnh đang chọn? Những ảnh này chưa được lưu.')) return;
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="photo-dialog photo-upload-dialog"
      aria-labelledby="photo-upload-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
    >
      <form className="photo-dialog__surface" onSubmit={submit}>
        <header className="photo-dialog__header">
          <div>
            <p className="photo-dialog__eyebrow">Album riêng của hai người</p>
            <h2 id="photo-upload-title">Thêm ảnh mới</h2>
          </div>
          <button type="button" className="photo-icon-button" onClick={close} aria-label="Đóng cửa sổ thêm ảnh" disabled={busy}>
            <X size={19} aria-hidden />
          </button>
        </header>

        <p className="photo-dialog__notice">Ảnh sẽ được lưu vào album riêng để Phúc và Ánh cùng xem.</p>

        <div
          className={`photo-dropzone ${dragging ? 'is-dragging' : ''}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <ImagePlus size={24} aria-hidden />
          <div>
            <strong>Chọn ảnh từ thiết bị</strong>
            <span>JPG, PNG, WebP và ảnh trình duyệt có thể mở · Có thể chọn nhiều ảnh</span>
          </div>
          <label className="photo-button photo-button--quiet" htmlFor="photo-upload-input">Chọn ảnh</label>
          <input
            id="photo-upload-input"
            className="photo-visually-hidden"
            type="file"
            accept="image/*"
            multiple
            onChange={onChoose}
            disabled={busy}
          />
        </div>

        {files.length > 0 && (
          <section className="photo-upload-list" aria-label="Ảnh đã chọn">
            <div className="photo-upload-list__heading">
              <h3>{files.length} ảnh đã chọn</h3>
              <span>Chọn ảnh bìa và sắp xếp thứ tự</span>
            </div>
            <ol>
              {files.map(({ id, file }, index) => (
                <li className="photo-upload-item" key={id}>
                  <img src={previews.get(id)} alt={`Xem trước ${file.name}`} />
                  <div className="photo-upload-item__details">
                    <strong title={file.name}>{file.name}</strong>
                    <span>{formatFileSize(file.size)}</span>
                    <label className="photo-cover-choice">
                      <input type="radio" name="photo-cover" checked={coverId === id} onChange={() => setCoverId(id)} />
                      Ảnh bìa
                    </label>
                  </div>
                  <div className="photo-upload-item__actions">
                    <button type="button" className="photo-icon-button" onClick={() => moveFile(index, -1)} disabled={index === 0} aria-label={`Đưa ${file.name} lên trước`}>
                      <ArrowUp size={16} aria-hidden />
                    </button>
                    <button type="button" className="photo-icon-button" onClick={() => moveFile(index, 1)} disabled={index === files.length - 1} aria-label={`Đưa ${file.name} xuống sau`}>
                      <ArrowDown size={16} aria-hidden />
                    </button>
                    <button type="button" className="photo-icon-button photo-icon-button--danger" onClick={() => removeFile(id)} aria-label={`Bỏ ${file.name} khỏi danh sách`}>
                      <Trash2 size={16} aria-hidden />
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        <div className="photo-form-grid">
          <label>
            <span>Album</span>
            <select value={albumId} onChange={(event) => setAlbumId(event.target.value as GalleryAlbumId)}>
              {GALLERY_ALBUMS.map((album) => <option value={album.id} key={album.id}>{album.title}</option>)}
            </select>
          </label>
          <p className="photo-uploader"><span>Người đăng</span><strong>{uploader}</strong></p>
          <label className="photo-form-grid__wide">
            <span>Chú thích</span>
            <input value={caption} onChange={(event) => setCaption(event.target.value)} maxLength={240} placeholder="Ví dụ: Buổi chiều ở Đà Lạt" />
          </label>
          <label>
            <span>Ngày chụp hoặc ngày kỷ niệm</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <label className="photo-form-grid__wide">
            <span>Ghi chú <em>(không bắt buộc)</em></span>
            <textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} maxLength={800} placeholder="Điều muốn nhớ về những bức ảnh này" />
          </label>
        </div>

        {error && <p className="photo-form-error" role="alert">{error}</p>}
        <footer className="photo-dialog__footer">
          <span className="photo-save-hint">Chỉ đóng cửa sổ sau khi ảnh lưu xong.</span>
          <button type="button" className="photo-button photo-button--quiet" onClick={close} disabled={busy}>Hủy</button>
          <button type="submit" className="photo-button photo-button--primary" disabled={busy}>
            {activity === 'checking'
              ? <><LoaderCircle className="photo-spinner" size={17} aria-hidden /> Đang kiểm tra ảnh…</>
              : activity === 'saving'
                ? <><LoaderCircle className="photo-spinner" size={17} aria-hidden /> Đang lưu…</>
                : <><Check size={17} aria-hidden /> Đăng ảnh</>}
          </button>
        </footer>
      </form>
    </dialog>
  );
}
