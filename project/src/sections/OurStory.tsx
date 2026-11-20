import { Reveal } from '@/components/Reveal';
import { SectionHeading } from '@/components/SectionHeading';
import { siteContent, type StoryItem } from '@/lib/content';

function TimelineItem({ item, index }: { item: StoryItem; index: number }) {
  const isLeft = index % 2 === 0;
  return (
    <Reveal
      as="li"
      className={`relative flex flex-col gap-6 md:flex-row md:items-center ${
        isLeft ? '' : 'md:flex-row-reverse'
      }`}
    >
      {/* Node on the center line */}
      <div className="absolute left-4 top-2 z-10 hidden md:left-1/2 md:block md:-translate-x-1/2">
        <span className="relative grid h-4 w-4 place-items-center rounded-full gradient-fuchsia shadow-soft">
          <span className="absolute inset-0 rounded-full gradient-fuchsia animate-pulse-ring" />
        </span>
      </div>
      <span className="absolute left-4 top-2 z-10 grid h-3 w-3 -translate-x-[3px] place-items-center rounded-full gradient-fuchsia md:hidden" />

      {/* Card */}
      <div className={`md:w-1/2 ${isLeft ? 'md:pr-12' : 'md:pl-12'} pl-12 md:pl-0`}>
        <article className="glass glass-specular rounded-3xl p-5 shadow-glass md:p-7">
          <div className="flex items-center gap-3">
            <span className="eyebrow">{item.date}</span>
          </div>
          <h3 className="mt-3 font-serif text-2xl font-semibold text-ink">{item.title}</h3>
          {item.photo && (
            <figure className="mt-4 overflow-hidden rounded-2xl">
              <img src={item.photo} alt={item.title} className="img-lift w-full object-cover" loading="lazy" />
            </figure>
          )}
          <p className="mt-4 text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">
            {item.description}
          </p>
        </article>
      </div>
      <div className="hidden md:block md:w-1/2" />
    </Reveal>
  );
}

export function OurStory() {
  const { story } = siteContent;
  return (
    <section id="story" className="paper-texture relative bg-paper-warm py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <SectionHeading eyebrow={story.eyebrow} title={story.title} intro={story.intro} />

        <ol className="relative mt-16 md:mt-20">
          {/* center line */}
          <div className="absolute left-[1.15rem] top-0 h-full w-px bg-fuchsia-200 md:left-1/2 md:-translate-x-1/2" />
          <div className="flex flex-col gap-10 md:gap-16">
            {story.items.map((item, i) => (
              <TimelineItem key={item.id} item={item} index={i} />
            ))}
          </div>
        </ol>
      </div>
    </section>
  );
}
