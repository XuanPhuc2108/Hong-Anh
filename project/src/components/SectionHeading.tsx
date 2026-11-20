import { Reveal } from './Reveal';

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  intro?: string;
  align?: 'left' | 'center';
};

export function SectionHeading({ eyebrow, title, intro, align = 'left' }: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'items-center text-center mx-auto' : 'items-start text-left';
  return (
    <Reveal className={`flex max-w-2xl flex-col gap-4 ${alignClass}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="text-pretty text-3xl font-semibold leading-tight text-ink sm:text-4xl md:text-[2.75rem]">
        {title}
      </h2>
      {intro && <p className="text-pretty text-base leading-relaxed text-ink-soft sm:text-lg">{intro}</p>}
    </Reveal>
  );
}
