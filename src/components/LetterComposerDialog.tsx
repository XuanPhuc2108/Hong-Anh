import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Eye, EyeOff, LoaderCircle, Paperclip, Send, X } from 'lucide-react';
import { findReadableImages, formatFileSize, getImageMimeType } from '@/lib/imageFiles';
import {
  createLocalId,
  type CoupleName,
  type LetterAttachment,
  type LoveLetter,
} from '@/lib/photoLetterRepository';

type LetterComposerDialogProps = {
  sender: CoupleName;
  recipient: CoupleName;
  letter?: LoveLetter;
  onClose: () => void;
  onSaveDraft: (letter: LoveLetter) => Promise<void>;
  onSend: (letter: LoveLetter) => Promise<void>;
};

function createDraft(sender: CoupleName, recipient: CoupleName): LoveLetter {
  const now = new Date().toISOString();
  return {
    id: createLocalId(),
    from: sender,
    to: recipient,
    subject: '',
    body: '',
    signature: '',
    attachments: [],
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };
}

function createAttachmentPreviews(attachments: LetterAttachment[]) {
  const urls = new Map<string, string>();
  const objectUrls: string[] = [];
  for (const attachment of attachments) {
    if (attachment.url) {
      urls.set(attachment.id, attachment.url);
    } else if (attachment.blob) {
      const url = URL.createObjectURL(attachment.blob);
      urls.set(attachment.id, url);
      objectUrls.push(url);
    }
  }
  return { urls, dispose: () => objectUrls.forEach((url) => URL.revokeObjectURL(url)) };
}

function AttachmentPreview({ attachments }: { attachments: LetterAttachment[] }) {
  const [urls, setUrls] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const previews = createAttachmentPreviews(attachments);
    setUrls(previews.urls);
    return previews.dispose;
  }, [attachments]);

  if (attachments.length === 0) return null;
  return (
    <div className="letter-attachments">
      {attachments.map((attachment) => (
        <figure key={attachment.id}>
          <img src={urls.get(attachment.id)} alt={attachment.fileName} />
          <figcaption>{attachment.fileName}</figcaption>
        </figure>
      ))}
    </div>
  );
}

export function LetterComposerDialog({
  sender,
  recipient,
  letter,
  onClose,
  onSaveDraft,
  onSend,
}: LetterComposerDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<LoveLetter>(() => letter ?? createDraft(sender, recipient));
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState('');
  const [attachmentUrls, setAttachmentUrls] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  useEffect(() => {
    const previews = createAttachmentPreviews(draft.attachments);
    setAttachmentUrls(previews.urls);
    return previews.dispose;
  }, [draft.attachments]);

  const update = (patch: Partial<LoveLetter>) => setDraft((current) => ({ ...current, ...patch, updatedAt: new Date().toISOString() }));

  const close = () => {
    if (busy) return;
    if ((draft.subject || draft.body || draft.attachments.length > 0) && !window.confirm('Bỏ lá thư đang viết? Nội dung chưa lưu sẽ mất.')) return;
    onClose();
  };

  const addAttachments = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = '';
    if (selected.length === 0) return;
    setBusy(true);
    setError('');
    try {
      const { accepted, rejected } = await findReadableImages(selected);
      const additions: LetterAttachment[] = accepted.map((file) => ({
        id: createLocalId(),
        blob: file,
        fileName: file.name,
        fileSize: file.size,
        mimeType: getImageMimeType(file),
      }));
      update({ attachments: [...draft.attachments, ...additions] });
      if (rejected.length > 0) setError(`Không thể dùng ${rejected.slice(0, 3).join(', ')}. Ảnh cần dưới 50 MB và trình duyệt phải đọc được.`);
    } catch (validationError) {
      console.error('Không thể kiểm tra ảnh đính kèm thư.', validationError);
      setError('Không kiểm tra được ảnh đính kèm. Hãy thử chọn lại.');
    } finally {
      setBusy(false);
    }
  };

  const save = async (send: boolean) => {
    if (send && !draft.subject.trim()) {
      setError('Thêm tiêu đề trước khi gửi thư.');
      return;
    }
    if (send && !draft.body.trim()) {
      setError('Viết nội dung thư trước khi gửi.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const next = {
        ...draft,
        subject: draft.subject.trim(),
        body: draft.body.trim(),
        signature: draft.signature.trim(),
        status: send ? 'sent' as const : 'draft' as const,
        updatedAt: new Date().toISOString(),
        ...(send ? { sentAt: new Date().toISOString(), openedAt: undefined } : {}),
      };
      if (send) await onSend(next);
      else await onSaveDraft(next);
      onClose();
    } catch (saveError) {
      console.error(send ? 'Không lưu được thư gửi đi.' : 'Không lưu được bản nháp.', saveError);
      setError(send ? 'Chưa gửi được thư vào hộp thư chung. Hãy thử lại.' : 'Chưa lưu được bản nháp trên thiết bị này. Hãy thử lại.');
    } finally {
      setBusy(false);
    }
  };

  const title = draft.subject.trim() || 'Chưa có tiêu đề';

  return (
    <dialog
      ref={dialogRef}
      className="photo-dialog letter-compose-dialog"
      aria-labelledby="letter-compose-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
    >
      <form
        className="photo-dialog__surface"
        onSubmit={(event) => {
          event.preventDefault();
          void save(false);
        }}
      >
        <header className="photo-dialog__header">
          <div>
            <p className="photo-dialog__eyebrow">Thư viết riêng</p>
            <h2 id="letter-compose-title">{letter ? 'Chỉnh sửa bản nháp' : 'Viết thư mới'}</h2>
          </div>
          <button type="button" className="photo-icon-button" onClick={close} aria-label="Đóng trình soạn thư" disabled={busy}>
            <X size={19} aria-hidden />
          </button>
        </header>

        <p className="photo-dialog__notice">Bản nháp lưu trên thiết bị này. Khi gửi, thư sẽ vào hộp thư riêng chung.</p>
        <div className="letter-compose-fields">
          <p className="letter-compose-sender"><span>Người gửi</span><strong>{sender}</strong></p>
          <p className="letter-compose-sender"><span>Người nhận</span><strong>{recipient}</strong></p>
          <label>
            <span>Tiêu đề</span>
            <input autoComplete="off" maxLength={140} value={draft.subject} onChange={(event) => update({ subject: event.target.value })} placeholder="Một dòng cho lá thư này" />
          </label>
          <label>
            <span>Nội dung</span>
            <textarea rows={9} maxLength={20000} value={draft.body} onChange={(event) => update({ body: event.target.value })} placeholder="Viết theo cách của bạn…" />
          </label>
          <label>
            <span>Chữ ký <em>(không bắt buộc)</em></span>
            <input maxLength={100} value={draft.signature} onChange={(event) => update({ signature: event.target.value })} placeholder="Tên hoặc cách bạn thường ký" />
          </label>
        </div>

        {draft.attachments.length > 0 && (
          <ul className="letter-attachment-list" aria-label="Ảnh đính kèm">
            {draft.attachments.map((attachment) => (
              <li key={attachment.id}>
                <img src={attachmentUrls.get(attachment.id)} alt="" />
                <span>{attachment.fileName} · {formatFileSize(attachment.fileSize)}</span>
                <button type="button" className="photo-icon-button photo-icon-button--danger" onClick={() => update({ attachments: draft.attachments.filter((item) => item.id !== attachment.id) })} aria-label={`Gỡ ${attachment.fileName}`}>
                  <X size={15} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}

        <label className="letter-attach-button">
          <Paperclip size={17} aria-hidden />
          <span>Đính kèm ảnh</span>
          <input className="photo-visually-hidden" type="file" accept="image/*" multiple onChange={(event) => void addAttachments(event)} disabled={busy} />
        </label>

        <div className="letter-preview-toggle">
          <button type="button" className="photo-button photo-button--quiet" onClick={() => setPreview((value) => !value)} aria-expanded={preview}>
            {preview ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
            {preview ? 'Đóng xem trước' : 'Xem trước'}
          </button>
        </div>
        {preview && (
          <article className="letter-paper letter-paper--preview" aria-label="Xem trước lá thư">
            <p className="letter-paper__to">Gửi {draft.to}</p>
            <h3>{title}</h3>
            <p className="letter-paper__body">{draft.body || 'Nội dung thư sẽ hiện ở đây.'}</p>
            {draft.signature && <p className="letter-paper__signature">{draft.signature}</p>}
            <AttachmentPreview attachments={draft.attachments} />
          </article>
        )}

        {error && <p className="photo-form-error" role="alert">{error}</p>}
        <footer className="photo-dialog__footer photo-dialog__footer--split">
          <span className="photo-save-hint">Ảnh của bản nháp lưu trên thiết bị; ảnh sẽ được gửi cùng thư.</span>
          <div>
            <button type="button" className="photo-button photo-button--quiet" onClick={close} disabled={busy}>Hủy</button>
            <button type="submit" className="photo-button photo-button--quiet" disabled={busy}>
              {busy ? <><LoaderCircle className="photo-spinner" size={16} aria-hidden /> Đang lưu…</> : 'Lưu bản nháp'}
            </button>
            <button type="button" className="photo-button photo-button--primary" disabled={busy} onClick={() => void save(true)}>
              {busy ? <LoaderCircle className="photo-spinner" size={16} aria-hidden /> : <Send size={16} aria-hidden />}
              Gửi thư
            </button>
          </div>
        </footer>
      </form>
    </dialog>
  );
}
