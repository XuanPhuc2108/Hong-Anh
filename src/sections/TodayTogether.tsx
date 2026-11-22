import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Flower2, Heart, RefreshCw, Send, X } from 'lucide-react';
import { BotanicalAccent } from '@/components/BotanicalAccent';
import { formatDateOnly, getHcmDate } from '@/lib/dates';
import type { DiaryRecord, GalleryRecord, MemoryRecord } from '@/lib/journalData';

const DAILY_QUESTIONS = [
  'Hôm nay có điều gì làm bạn vui nhất?',
  'Có món gì muốn ăn cùng nhau hong?',
  'Nếu đi đâu đó ngay bây giờ, bạn muốn đi đâu?',
  'Một điều nhỏ bạn muốn kể hôm nay là gì?',
];

type MemoryPick = {
  id: string;
  title: string;
  date?: string;
  description?: string;
  photo?: string;
};

function getTodayKey() {
  const { year, month, day } = getHcmDate();
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function displayDate(date?: string) {
  if (!date) return undefined;
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? formatDateOnly(date) : date;
}

function MemoryPolaroid({
  memory,
  onDismiss,
  onTryAgain,
}: {
  memory: MemoryPick;
  onDismiss: () => void;
  onTryAgain: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dismiss = useCallback(() => dialogRef.current?.close(), []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onDismiss();
    dialog.addEventListener('close', handleClose);
    dialog.showModal();
    return () => {
      dialog.removeEventListener('close', handleClose);
      if (dialog.open) dialog.close();
    };
  }, [onDismiss]);

  return (
    <dialog
      ref={dialogRef}
      className="memory-dialog"
      aria-labelledby="random-memory-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <div className="memory-dialog__surface">
        <button type="button" className="memory-dialog__close btn-tactile" onClick={dismiss} aria-label="Đóng kỷ niệm">
          <X size={19} aria-hidden />
        </button>
        <div className="polaroid" key={memory.id}>
          <div className="polaroid__meta">
            {displayDate(memory.date) && <time>{displayDate(memory.date)}</time>}
            <h3 id="random-memory-title">{memory.title || 'Một chiếc ảnh trong kho'}</h3>
          </div>
          {memory.photo ? (
            <img src={memory.photo} alt={memory.title ? `Ảnh trong kỷ niệm ${memory.title}` : 'Ảnh được chọn từ kho My Love'} />
          ) : (
            <div className="polaroid__text">
              <Flower2 size={26} aria-hidden />
              <p>{memory.description || 'Kỷ niệm này chưa có ảnh nè.'}</p>
            </div>
          )}
        </div>
        <button type="button" className="memory-dialog__again" onClick={onTryAgain}>
          <RefreshCw size={16} aria-hidden />
          Thử mở chiếc khác
        </button>
      </div>
    </dialog>
  );
}

export function TodayTogether({
  memories,
  gallery,
  diary,
}: {
  memories: MemoryRecord[];
  gallery: GalleryRecord[];
  diary: DiaryRecord[];
}) {
  const todayKey = getTodayKey();
  const date = useMemo(() => new Date(`${todayKey}T12:00:00+07:00`), [todayKey]);
  const questionIndex = Math.floor(date.getTime() / 86_400_000) % DAILY_QUESTIONS.length;
  const question = DAILY_QUESTIONS[questionIndex];
  const [answer, setAnswer] = useState('');
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState('');
  const [selectedMemory, setSelectedMemory] = useState<MemoryPick | null>(null);
  const dismissMemory = useCallback(() => setSelectedMemory(null), []);

  const memoryPicks = useMemo<MemoryPick[]>(
    () => [
      ...memories
        .filter((memory) => memory.title.trim())
        .map((memory) => ({
          id: `memory-${memory.id}`,
          title: memory.title,
          date: memory.date || undefined,
          description: memory.description || undefined,
          photo: memory.photo_url || undefined,
        })),
      ...gallery.map((image) => ({
        id: `gallery-${image.id}`,
        title: image.caption?.trim() || 'Một chiếc ảnh trong kho',
        photo: image.public_url,
      })),
      ...diary.map((entry) => ({
        id: `diary-${entry.id}`,
        title: entry.caption?.trim() || 'Một trang nhật ký ảnh',
        date: entry.date || undefined,
        photo: entry.public_url,
      })),
    ],
    [diary, gallery, memories]
  );

  useEffect(() => {
    try {
      const savedAnswer = window.localStorage.getItem(`my-love:today:${todayKey}`);
      if (savedAnswer !== null) {
        setAnswer(savedAnswer);
        setSaved(true);
      }
    } catch (error) {
      console.error('Không đọc được câu trả lời trong ngày trên thiết bị.', error);
      setStatus('Chưa đọc được câu trả lời đã cất. Bạn vẫn có thể viết câu mới nè.');
    }
  }, [todayKey]);

  const saveAnswer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = answer.trim();
    if (!value) {
      setStatus('Viết một chút xíu rồi mình cất nha.');
      return;
    }
    try {
      window.localStorage.setItem(`my-love:today:${todayKey}`, value);
      setAnswer(value);
      setSaved(true);
      setStatus('Đã cất trên thiết bị này nè.');
    } catch (error) {
      console.error('Không lưu được câu trả lời trong ngày trên thiết bị.', error);
      setSaved(false);
      setStatus('Chưa cất được nè. Bạn nhớ sao chép câu trả lời trước khi rời trang nha.');
    }
  };

  const openRandomMemory = () => {
    if (memoryPicks.length === 0) {
      setStatus('Kho chưa có ảnh hay kỷ niệm để mở đại nè.');
      return;
    }
    const available = selectedMemory && memoryPicks.length > 1
      ? memoryPicks.filter((memory) => memory.id !== selectedMemory.id)
      : memoryPicks;
    const next = available[Math.floor(Math.random() * available.length)];
    setSelectedMemory(next);
  };

  return (
    <section className="today-section section-anchor" id="today" aria-labelledby="today-title">
      <div className="today-wrap">
        <div className="section-lead">
          <span className="section-kicker">Một câu cho hôm nay</span>
          <h2 id="today-title">Hôm nay của tụi mình</h2>
          <p>Một câu hỏi nhỏ để cất lại điều đang vui trong ngày.</p>
        </div>
        <div className="today-grid">
          <article className="today-card today-card--question">
            <BotanicalAccent kind="flower" className="today-card__flower" />
            <time className="today-card__date" dateTime={todayKey}>{displayDate(todayKey)}</time>
            <h3>{question}</h3>
            <form onSubmit={saveAnswer}>
              <label htmlFor="today-answer">Câu trả lời của bạn</label>
              <textarea
                id="today-answer"
                rows={3}
                maxLength={500}
                value={answer}
                onChange={(event) => {
                  setAnswer(event.target.value);
                  setSaved(false);
                  setStatus('');
                }}
                placeholder="Viết vài dòng ở đây nè…"
              />
              <div className="today-card__actions">
                <button type="submit" className="today-save" disabled={!answer.trim()}>
                  <Send size={16} aria-hidden />
                  {saved ? 'Cất lại câu trả lời' : 'Cất câu trả lời'}
                </button>
                <span className="today-status" role="status" aria-live="polite">
                  {status || (saved ? 'Đã cất trên thiết bị này nè.' : 'Chỉ lưu trong trình duyệt này thôi nha.')}
                </span>
              </div>
            </form>
          </article>

          <article className="today-card today-card--memory">
            <BotanicalAccent kind="butterfly" className="today-card__butterfly" />
            <div className="today-memory-mark" aria-hidden><Heart size={20} /></div>
            <span className="today-card__date">Góc bất ngờ</span>
            <h3>Mở đại một kỷ niệm nè</h3>
            <p>Chọn ngẫu nhiên một ảnh hoặc kỷ niệm đang có trong cuốn sổ.</p>
            <button type="button" className="today-random" onClick={openRandomMemory}>
              Mở đại một kỷ niệm nè
              <span aria-hidden>↗</span>
            </button>
            {memoryPicks.length === 0 && (
              <p className="today-empty" role="status">
                Kho đang trống xíu. Thêm ảnh hoặc kỷ niệm rồi mình mở cùng nha.
              </p>
            )}
          </article>
        </div>
      </div>
      {selectedMemory && (
        <MemoryPolaroid
          memory={selectedMemory}
          onDismiss={dismissMemory}
          onTryAgain={openRandomMemory}
        />
      )}
    </section>
  );
}
