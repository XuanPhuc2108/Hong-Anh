import { useState, type FormEvent } from 'react';
import { Check, Feather, MailOpen, Mail } from 'lucide-react';
import { useSound } from '@/components/SoundContext';
import { useDeviceValue } from '@/lib/deviceStorage';

type LetterSettings = { title: string; body: string; signature: string };
type LetterDraft = { body: string; signature: string };

export function Letter({ initialLetter }: { initialLetter: LetterSettings }) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [draft, setDraft, storageError] = useDeviceValue<LetterDraft>('my-love:letter-draft:v1', {
    body: initialLetter.body,
    signature: initialLetter.signature,
  });
  const { playSound } = useSound();

  const toggleLetter = () => {
    if (!open) playSound('letter');
    setOpen((value) => !value);
  };
  const saveDraft = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  };

  return (
    <section id="letter" className={`letter-experience ${open ? 'is-open' : ''}`} aria-labelledby="letter-title">
      <div className="letter-envelope" aria-hidden>
        <div className="letter-envelope__paper">
          <Feather size={22} />
        </div>
        <div className="letter-envelope__flap" />
        <span className="letter-envelope__seal"><Mail size={18} /></span>
      </div>
      <div className="letter-copy">
        <span className="section-kicker">Một bức thư</span>
        <h3 id="letter-title">{initialLetter.title}</h3>
        <p>{initialLetter.body ? 'Bức thư đang được cất trong My Love.' : 'Trang thư vẫn còn chỗ trống nè.'}</p>
        <button type="button" className="letter-toggle" onClick={toggleLetter} aria-expanded={open} aria-controls="letter-content">
          {open ? <MailOpen size={17} aria-hidden /> : <Mail size={17} aria-hidden />}
          {open ? 'Gấp thư lại' : initialLetter.body ? 'Mở thư nè' : 'Viết vài dòng'}
        </button>
      </div>
      <div id="letter-content" className="letter-content" hidden={!open}>
        <form onSubmit={saveDraft}>
          <label htmlFor="letter-body">Nội dung bức thư</label>
          <textarea
            id="letter-body"
            rows={7}
            maxLength={4000}
            value={draft.body}
            onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))}
          />
          <label htmlFor="letter-signature">Tên người gửi</label>
          <input
            id="letter-signature"
            value={draft.signature}
            maxLength={80}
            onChange={(event) => setDraft((current) => ({ ...current, signature: event.target.value }))}
          />
          <div className="letter-save-row">
            <button type="submit" className="letter-save"><Check size={16} aria-hidden /> Cất bản nháp</button>
            <span className="letter-save-status" role="status" aria-live="polite">
              {saved ? 'Bản nháp đã cất trên thiết bị này nè.' : storageError || 'Thư vẫn ở trên thiết bị này thôi nha.'}
            </span>
          </div>
        </form>
      </div>
    </section>
  );
}
