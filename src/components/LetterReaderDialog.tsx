import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, MailOpen, X } from 'lucide-react';
import { formatPhotoDate } from '@/lib/imageFiles';
import type { LoveLetter } from '@/lib/photoLetterRepository';

type LetterReaderDialogProps = {
  letter: LoveLetter;
  onClose: () => void;
  onOpened: (letter: LoveLetter) => Promise<void>;
};

function LetterImages({ letter }: { letter: LoveLetter }) {
  const [urls, setUrls] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const next = new Map<string, string>();
    const objectUrls: string[] = [];
    for (const attachment of letter.attachments) {
      if (attachment.url) {
        next.set(attachment.id, attachment.url);
      } else if (attachment.blob) {
        const url = URL.createObjectURL(attachment.blob);
        next.set(attachment.id, url);
        objectUrls.push(url);
      }
    }
    setUrls(next);
    return () => objectUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [letter.attachments]);

  if (letter.attachments.length === 0) return null;
  return (
    <div className="letter-attachments">
      {letter.attachments.map((attachment) => (
        <figure key={attachment.id}>
          <img src={urls.get(attachment.id)} alt={attachment.fileName} />
          <figcaption>{attachment.fileName}</figcaption>
        </figure>
      ))}
    </div>
  );
}

export function LetterReaderDialog({ letter, onClose, onOpened }: LetterReaderDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [opened, setOpened] = useState(false);
  const [openError, setOpenError] = useState('');
  const date = formatPhotoDate((letter.sentAt || letter.createdAt).slice(0, 10));

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  const revealLetter = () => {
    if (opened) return;
    setOpened(true);
    void onOpened(letter).catch((error: unknown) => {
      console.error('Không cập nhật được trạng thái đã mở của thư.', error);
      setOpenError('Đã mở thư, nhưng chưa cập nhật được trạng thái trong hộp thư chung.');
    });
  };

  return (
    <dialog
      ref={dialogRef}
      className="photo-dialog letter-reader-dialog"
      aria-labelledby="letter-reader-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="photo-dialog__surface letter-reader">
        <header className="photo-dialog__header">
          <button type="button" className="photo-button photo-button--quiet" onClick={onClose}>
            <ArrowLeft size={17} aria-hidden /> Hộp thư
          </button>
          <button type="button" className="photo-icon-button" onClick={onClose} aria-label="Đóng lá thư">
            <X size={19} aria-hidden />
          </button>
        </header>

        <section className={`letter-opening ${opened ? 'is-open' : ''}`}>
          <div className="letter-opening__envelope">
            <div className="letter-opening__paper-mark"><MailOpen size={24} aria-hidden /></div>
            <span className="letter-opening__flap" aria-hidden />
            <span className="letter-opening__seal" aria-hidden>✿</span>
          </div>
          {!opened && (
            <button type="button" className="photo-button photo-button--primary letter-opening__button" onClick={revealLetter}>
              <MailOpen size={17} aria-hidden /> Mở phong bì
            </button>
          )}
        </section>

        {!opened && (
          <div className="letter-opening__address">
            <p>Thư gửi {letter.to}</p>
            <h2 id="letter-reader-title">{letter.subject || 'Chưa có tiêu đề'}</h2>
            <span>Từ {letter.from} · {date}</span>
          </div>
        )}

        {openError && <p className="photo-form-error" role="status">{openError}</p>}
        {opened && (
          <article className="letter-paper letter-paper--opened" aria-labelledby="letter-reader-title">
            <div className="letter-paper__meta">
              <span>Thư gửi {letter.to}</span>
              <time dateTime={letter.sentAt || letter.createdAt}>{date}</time>
            </div>
            <h2 id="letter-reader-title">{letter.subject || 'Chưa có tiêu đề'}</h2>
            <p className="letter-paper__from">Từ {letter.from}</p>
            <p className="letter-paper__body">{letter.body}</p>
            {letter.signature && <p className="letter-paper__signature">{letter.signature}</p>}
            <LetterImages letter={letter} />
          </article>
        )}
      </div>
    </dialog>
  );
}
