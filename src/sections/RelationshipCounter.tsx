import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { calendarDuration, formatDateOnly, getHcmDate } from '@/lib/dates';
import { relationshipDates } from '@/lib/my-love-config';

export function RelationshipCounter() {
  const [today, setToday] = useState(getHcmDate);
  const duration = calendarDuration(relationshipDates.relationshipStart, today);

  useEffect(() => {
    const timer = window.setInterval(() => setToday(getHcmDate()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const values = [
    { value: duration.years, label: 'năm' },
    { value: duration.months, label: 'tháng' },
    { value: duration.days, label: 'ngày' },
  ];

  return (
    <section id="counter" className="counter-section section-anchor" aria-labelledby="counter-title">
      <div className="counter-paper">
        <div className="counter-flower" aria-hidden>
          <svg viewBox="0 0 120 120" fill="none">
            <path d="M60 17c7 12 13 17 25 14-1 13 2 20 15 25-11 8-15 15-12 27-13-2-20 1-28 14-7-12-14-17-26-14 1-13-2-20-15-27 11-8 15-15 12-27 13 2 20-1 29-12Z" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="60" cy="58" r="8" fill="currentColor" fillOpacity=".2" stroke="currentColor" strokeWidth="1.4" />
            <path d="M60 67c-3 19-9 31-20 39m20-29c6 15 13 24 25 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <div className="counter-copy">
          <p className="counter-kicker">Từ {formatDateOnly(relationshipDates.relationshipStart)}</p>
          <h2 id="counter-title">Tụi mình bên nhau được</h2>
          <p className="counter-subtitle">Tính theo lịch Việt Nam, từ ngày Phúc và Ánh chính thức bên nhau.</p>
        </div>
        <div className="counter-values" aria-label={`${duration.years} năm, ${duration.months} tháng, ${duration.days} ngày`}>
          {values.map((part) => (
            <div className="counter-value" key={part.label}>
              <span className="counter-number" key={`${part.label}-${part.value}`}>{part.value}</span>
              <span className="counter-unit">{part.label}</span>
            </div>
          ))}
        </div>
        <div className="counter-total">
          <Heart size={14} fill="currentColor" aria-hidden />
          <span>{duration.totalDays} ngày đã cùng đi qua</span>
        </div>
      </div>
    </section>
  );
}
