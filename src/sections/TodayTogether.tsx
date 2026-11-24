import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import { BotanicalAccent } from '@/components/BotanicalAccent';
import { formatDateOnly, getHcmDate } from '@/lib/dates';

const DAILY_QUESTIONS = [
  'Hôm nay có điều gì làm bạn vui nhất?',
  'Có món nào bạn muốn ăn cùng nhau không?',
  'Nếu đi đâu đó ngay bây giờ, bạn muốn đi đâu?',
  'Một điều nhỏ bạn muốn kể hôm nay là gì?',
];

function getTodayKey() {
  const { year, month, day } = getHcmDate();
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function displayDate(date?: string) {
  if (!date) return undefined;
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? formatDateOnly(date) : date;
}

export function TodayTogether({ userId }: { userId: string }) {
  const todayKey = getTodayKey();
  const storageKey = `my-love:today:${userId}:${todayKey}`;
  const date = useMemo(() => new Date(`${todayKey}T12:00:00+07:00`), [todayKey]);
  const questionIndex = Math.floor(date.getTime() / 86_400_000) % DAILY_QUESTIONS.length;
  const question = DAILY_QUESTIONS[questionIndex];
  const [answer, setAnswer] = useState('');
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    try {
      const savedAnswer = window.localStorage.getItem(storageKey);
      if (savedAnswer !== null) {
        setAnswer(savedAnswer);
        setSaved(true);
      }
    } catch (error) {
      console.error('Không đọc được câu trả lời trong ngày trên thiết bị.', error);
      setStatus('Không đọc được câu trả lời đã lưu. Bạn vẫn có thể viết câu mới.');
    }
  }, [storageKey, todayKey]);

  const saveAnswer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = answer.trim();
    if (!value) {
      setStatus('Nhập câu trả lời trước khi lưu.');
      return;
    }
    try {
      window.localStorage.setItem(storageKey, value);
      setAnswer(value);
      setSaved(true);
      setStatus('Đã lưu trên thiết bị này.');
    } catch (error) {
      console.error('Không lưu được câu trả lời trong ngày trên thiết bị.', error);
      setSaved(false);
      setStatus('Không lưu được. Hãy sao chép câu trả lời trước khi rời trang.');
    }
  };

  return (
    <section className="today-section section-anchor" id="today" aria-labelledby="today-title">
      <div className="today-wrap">
        <div className="section-lead">
          <span className="section-kicker">Câu hỏi hôm nay</span>
          <h2 id="today-title">Hôm nay của tụi mình</h2>
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
                placeholder="Viết câu trả lời…"
              />
              <div className="today-card__actions">
                <button type="submit" className="today-save" disabled={!answer.trim()}>
                  <Send size={16} aria-hidden />
                  {saved ? 'Lưu thay đổi' : 'Lưu câu trả lời'}
                </button>
                <span className="today-status" role="status" aria-live="polite">
                  {status || (saved ? 'Đã lưu trên thiết bị này.' : 'Câu trả lời chỉ lưu trong trình duyệt này.')}
                </span>
              </div>
            </form>
          </article>
        </div>
      </div>
    </section>
  );
}
