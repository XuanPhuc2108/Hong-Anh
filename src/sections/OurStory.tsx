import { useEffect, useState } from 'react';
import { Reveal } from '@/components/Reveal';
import { SectionHeading } from '@/components/SectionHeading';
import { siteContent, relationshipDates, type StoryItem } from '@/lib/content';

const DAY_MS = 86_400_000;

function hanoiToday() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '0';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function calendarDays(start: string, end: string) {
  const [sy, sm, sd] = start.split('-').map(Number);
  const [ey, em, ed] = end.split('-').map(Number);
  const startDate = new Date(Date.UTC(sy, sm - 1, sd));
  const endDate = new Date(Date.UTC(ey, em - 1, ed));
  const totalDays = Math.max(0, Math.floor((endDate.getTime() - startDate.getTime()) / DAY_MS));
  let months = (ey - sy) * 12 + em - sm;
  if (ed < sd) months -= 1;
  const anchor = new Date(Date.UTC(sy, sm - 1 + months, sd));
  const days = Math.max(0, Math.floor((endDate.getTime() - anchor.getTime()) / DAY_MS));
  return { years: Math.floor(months / 12), months: months % 12, days, totalDays };
}

function RelationshipCounter() {
  const [today, setToday] = useState(hanoiToday);
  useEffect(() => {
    const timer = window.setInterval(() => setToday(hanoiToday()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const duration = calendarDays(relationshipDates.officialStart, today);
  const firstTalkDays = calendarDays(relationshipDates.firstConversation, today).totalDays;
  const values = [
    ['Năm', duration.years],
    ['Tháng', duration.months],
    ['Ngày', duration.days],
  ] as const;

  return (
    <Reveal className="lg relative mt-16 overflow-hidden rounded-[2rem] p-6 sm:p-9 md:mt-20 md:p-12">
      <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-end">
        <div>
          <p className="eyebrow">Từ ngày 1 tháng 11, 2026</p>
          <h3 className="display mt-3 text-3xl text-ink sm:text-4xl">Tụi mình đã bên nhau</h3>
          <p className="meta mt-3">Một chiếc đồng hồ nhỏ, cứ thế đếm tiếp nè.</p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {values.map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-white/45 px-2 py-4 sm:px-4 sm:py-5">
              <span className="display block text-4xl tabular-nums text-fuchsia-700 sm:text-5xl">{value}</span>
              <span className="meta mt-1 block">{label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-ink/10 pt-5">
        <span className="eyebrow">{duration.totalDays.toLocaleString('vi-VN')} ngày bên nhau</span>
        <span className="meta">Và {firstTalkDays.toLocaleString('vi-VN')} ngày kể từ lần đầu trò chuyện.</span>
      </div>
    </Reveal>
  );
}

function TimelineItem({ item, index }: { item: StoryItem; index: number }) {
  const isLeft = index % 2 === 0;
  const number = String(index + 1).padStart(2, '0');
  return (
    <li className={`journey-item relative grid grid-cols-[1.5rem_1fr] gap-5 md:grid-cols-[1fr_3rem_1fr] md:gap-0 ${isLeft ? 'is-left' : 'is-right'}`}>
      <div className="relative flex justify-center pt-2 md:col-start-2 md:row-start-1">
        <span className="journey-dot relative z-[1] block size-3 rounded-full border-2 border-paper-ivory bg-fuchsia-600 shadow-[0_0_0_4px_rgba(212,119,151,0.18)]" />
      </div>
      <Reveal as="article" className={`md:row-start-1 ${isLeft ? 'md:col-start-1 md:pr-12 md:text-right' : 'md:col-start-3 md:pl-12'}`}>
        <div className={`flex items-baseline gap-3 ${isLeft ? 'md:justify-end' : ''}`}>
          <span className="meta tabular-nums">{number}</span>
          <time className="eyebrow">{item.date}</time>
        </div>
        <h3 className="display mt-3 text-balance text-3xl text-ink sm:text-4xl">{item.title}</h3>
        {item.photo && (
          <Reveal variant="photo" className="mt-5 overflow-hidden">
            <figure className="photo-hover overflow-hidden rounded-[2px] shadow-soft">
              <img src={item.photo} alt={item.title} className="aspect-[4/3] w-full object-cover" loading="lazy" />
            </figure>
          </Reveal>
        )}
        <p className={`mt-4 max-w-md text-pretty text-base leading-relaxed text-ink-soft ${isLeft ? 'md:ml-auto' : ''}`}>
          {item.description}
        </p>
      </Reveal>
    </li>
  );
}

export function OurStory() {
  const { story } = siteContent;
  return (
    <section id="journey" aria-labelledby="journey-title" className="relative py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading id="journey-title" number="01" eyebrow="Hành trình" title={story.title} intro={story.intro} />
        <RelationshipCounter />
        <div className="relative mt-16 md:mt-24">
          <svg className="journey-ribbon pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
            <path className="journey-ribbon-base" d="M500 0 C500 110 270 100 270 250 S730 390 730 500 S270 610 270 750 S500 880 500 1000" />
            <path className="journey-ribbon-glow" d="M500 0 C500 110 270 100 270 250 S730 390 730 500 S270 610 270 750 S500 880 500 1000" />
          </svg>
          <ol className="relative flex flex-col gap-14 md:gap-24">
            {story.items.map((item, i) => <TimelineItem key={item.id} item={item} index={i} />)}
          </ol>
        </div>
      </div>
    </section>
  );
}
