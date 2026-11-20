import { Reveal } from '@/components/Reveal';
import { SectionHeading } from '@/components/SectionHeading';
import { siteContent, type StoryItem } from '@/lib/content';

/**
 * Continuous vertical timeline: one unbroken line runs through the
 * whole section, and items alternate left / right (left first) at
 * every viewport size. Nodes sit exactly on the line; a soft connector
 * joins each card to its node so entries read as one flowing story.
 */
function TimelineItem({ item, index }: { item: StoryItem; index: number }) {
  const isLeft = index % 2 === 0;

  return (
    <Reveal
      as="li"
      className="relative flex w-full items-center md:gap-10"
    >
      {/* Card half — alternates sides. On mobile the card stays near the
          line but with a fixed gutter so nothing overlaps. */}
      <div className={`flex w-1/2 ${isLeft ? 'justify-end pr-5 md:pr-0' : 'justify-start pl-5 md:pl-0'} md:w-auto md:flex-1`}>
        <article
          className={`glass glass-specular glass-refraction w-full max-w-md rounded-3xl p-5 shadow-glass md:p-7 ${
            isLeft ? 'md:mr-auto' : 'md:ml-auto'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="eyebrow">{item.date}</span>
          </div>
          <h3 className="mt-3 font-serif text-xl font-semibold text-ink sm:text-2xl">{item.title}</h3>
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

      {/* Node on the line + connector stub reaching toward the card */}
      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <span className="relative grid h-4 w-4 place-items-center rounded-full gradient-fuchsia shadow-soft">
          <span className="absolute inset-0 rounded-full gradient-fuchsia animate-pulse-ring" />
        </span>
      </div>
      <span
        aria-hidden
        className={`absolute top-1/2 h-px w-5 -translate-y-1/2 bg-fuchsia-300 md:w-10 ${
          isLeft ? 'right-1/2 mr-2 md:mr-3' : 'left-1/2 ml-2 md:ml-3'
        }`}
      />

      {/* Empty half keeps the alternation honest on desktop */}
      <div className="hidden md:block md:flex-1" />
    </Reveal>
  );
}

export function OurStory() {
  const { story } = siteContent;
  return (
    <section id="story" className="paper-texture relative py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <SectionHeading eyebrow={story.eyebrow} title={story.title} intro={story.intro} />

        <ol className="relative mt-16 md:mt-20">
          {/* the continuous line — one unbroken stroke through every node */}
          <div
            aria-hidden
            className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-fuchsia-200 to-transparent"
          />
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
