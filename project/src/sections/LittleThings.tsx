import { Reveal } from '@/components/Reveal';
import { SectionHeading } from '@/components/SectionHeading';
import { siteContent, type NoteItem } from '@/lib/content';

// Intentionally varied card treatments — some paper cards, some glass, asymmetric sizes.
const treatment = ['paper', 'glass', 'paper', 'glass', 'paper', 'glass'] as const;

function NoteCard({ note, index }: { note: NoteItem; index: number }) {
  const style = treatment[index % treatment.length];
  const rotate = index % 2 === 0 ? '-rotate-1' : 'rotate-1';
  if (style === 'paper') {
    return (
      <Reveal
        as="article"
        delay={((index % 3) + 1) as 1 | 2 | 3}
        className={`paper-grain relative rounded-3xl bg-paper-pale p-6 shadow-soft ${rotate} hover:rotate-0 transition-transform duration-500`}
      >
        {/* tape detail */}
        <span className="absolute -top-2 left-1/2 h-5 w-16 -translate-x-1/2 rounded-sm bg-fuchsia-200/70 backdrop-blur-sm shadow-sm" />
        <h3 className="font-hand text-2xl text-fuchsia-700">{note.title}</h3>
        <p className="mt-3 text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">{note.body}</p>
      </Reveal>
    );
  }
  return (
    <Reveal
      as="article"
      delay={((index % 3) + 1) as 1 | 2 | 3}
      className={`glass glass-specular rounded-3xl p-6 shadow-glass ${rotate} hover:rotate-0 transition-transform duration-500`}
    >
      <h3 className="font-serif text-xl font-semibold text-ink">{note.title}</h3>
      <p className="mt-3 text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">{note.body}</p>
    </Reveal>
  );
}

export function LittleThings() {
  const { littleThings } = siteContent;
  return (
    <section id="things" className="paper-texture relative bg-paper-warm py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow={littleThings.eyebrow} title={littleThings.title} intro={littleThings.intro} />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
          {littleThings.notes.map((note, i) => (
            <NoteCard key={note.id} note={note} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
