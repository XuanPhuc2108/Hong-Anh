import { Reveal } from '@/components/Reveal';
import { siteContent, type DiaryEntry } from '@/lib/content';

function DiaryPage({ entry, index }: { entry: DiaryEntry; index: number }) {
  const feature = index % 3 === 0;
  return (
    <Reveal as="article" delay={((index % 3) + 1) as 1 | 2 | 3} className={feature ? 'sm:col-span-2' : ''}>
      <div className={`grid gap-5 ${feature ? 'sm:grid-cols-[1.4fr_1fr] sm:items-end' : ''}`}>
        <figure className="photo-hover overflow-hidden rounded-[2px] shadow-soft">
          <img
            src={entry.photo}
            alt={entry.caption}
            loading="lazy"
            className={`w-full object-cover ${feature ? 'aspect-[4/3]' : 'aspect-[4/5]'}`}
          />
        </figure>
        <div>
          <time className="eyebrow">{entry.date}</time>
          <p className="mt-2 font-serif text-xl leading-snug text-ink">{entry.caption}</p>
        </div>
      </div>
    </Reveal>
  );
}

function EmptyDiary() {
  return (
    <Reveal className="sheet grid gap-8 rounded-[2px] p-8 shadow-soft sm:grid-cols-[1fr_1.2fr] sm:p-12">
      <div className="frame-empty relative aspect-[4/5] rounded-[2px]" aria-hidden />
      <div className="flex flex-col justify-center">
        <span className="eyebrow">Trang trống</span>
        <p className="display mt-4 text-3xl text-ink sm:text-4xl">Trang nhật ký đang đợi những bức ảnh đầu tiên</p>
        <p className="mt-4 max-w-sm text-pretty text-base leading-relaxed text-ink-soft">
          Sau khi đăng nhập trang quản lý, bạn có thể thêm từng trang — ảnh, chú thích và ngày tháng.
        </p>
      </div>
    </Reveal>
  );
}

export function PhotoDiary() {
  const { diary } = siteContent;
  return diary.entries.length > 0 ? (
    <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2">
      {diary.entries.map((entry, i) => (
        <DiaryPage key={entry.id} entry={entry} index={i} />
      ))}
    </div>
  ) : (
    <EmptyDiary />
  );
}
