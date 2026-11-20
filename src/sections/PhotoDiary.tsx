import { Reveal } from '@/components/Reveal';
import { SectionHeading } from '@/components/SectionHeading';
import { siteContent } from '@/lib/content';

// Scrapbook layout: each entry is a "polaroid" with a slight rotation and caption underneath.
function DiaryCard({ entry, index }: { entry: { id: string; date: string; caption: string; photo: string }; index: number }) {
  const rotate = index % 2 === 0 ? '-rotate-2' : 'rotate-2';
  return (
    <Reveal
      as="figure"
      delay={((index % 3) + 1) as 1 | 2 | 3}
      className={`paper-grain relative bg-white p-3 pb-4 shadow-soft-lg ${rotate} hover:rotate-0 transition-transform duration-500`}
    >
      <span className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 rounded-sm bg-fuchsia-200/70 shadow-sm backdrop-blur-sm" />
      <div className="relative aspect-square overflow-hidden bg-fuchsia-100">
        <img src={entry.photo} alt={entry.caption} loading="lazy" className="h-full w-full object-cover" />
      </div>
      <figcaption className="mt-3 px-1">
        <p className="font-hand text-lg text-ink">{entry.caption}</p>
        <p className="mt-1 text-xs tracking-wide text-ink-soft">{entry.date}</p>
      </figcaption>
    </Reveal>
  );
}

function EmptyDiary() {
  return (
    <Reveal className="glass glass-specular mt-12 rounded-3xl p-10 text-center shadow-glass">
      <p className="font-serif text-xl text-ink">Trang nhật ký đang đợi những bức ảnh đầu tiên</p>
      <p className="mx-auto mt-3 max-w-md text-sm text-ink-soft">
        Sau khi đăng nhập trang quản lý, bạn có thể thêm từng trang — ảnh, chú thích và ngày tháng.
      </p>
    </Reveal>
  );
}

export function PhotoDiary() {
  const { diary } = siteContent;
  return (
    <section id="diary" className="paper-texture relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow={diary.eyebrow} title={diary.title} intro={diary.intro} />

        {diary.entries.length > 0 ? (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
            {diary.entries.map((entry, i) => (
              <DiaryCard key={entry.id} entry={entry} index={i} />
            ))}
          </div>
        ) : (
          <EmptyDiary />
        )}
      </div>
    </section>
  );
}
