import { Reveal } from './Reveal';

type SectionHeadingProps = {
  number: string;
  eyebrow: string;
  title: string;
  intro?: string;
  id?: string;
};

/**
 * Editorial chapter opener: oversized folio number and title on the left,
 * a short standfirst on the right separated by a hairline rule.
 */
export function SectionHeading({ number, eyebrow, title, intro, id }: SectionHeadingProps) {
  return (
    <header className="grid gap-8 md:grid-cols-12 md:items-end md:gap-10">
      <Reveal className="md:col-span-7">
        <div className="flex items-baseline gap-4">
          <span aria-hidden className="display text-5xl text-fuchsia-300 sm:text-6xl">
            {number}
          </span>
          <span className="eyebrow">{eyebrow}</span>
        </div>
        <h2
          id={id}
          className="display mt-5 text-balance text-[2.6rem] text-ink sm:text-6xl lg:text-[4.75rem]"
        >
          {title}
        </h2>
      </Reveal>
      {intro && (
        <Reveal delay={2} className="md:col-span-5 md:pb-3">
          <div className="rule mb-5 w-16" />
          <p className="max-w-md text-pretty text-base leading-relaxed text-ink-soft sm:text-[1.05rem]">
            {intro}
          </p>
        </Reveal>
      )}
    </header>
  );
}
