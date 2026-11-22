import { Reveal } from '@/components/Reveal';
import { siteContent, type NoteItem } from '@/lib/content';

// Different visual weights: a lead note, then quieter marginal notes.
function Note({ note, index }: { note: NoteItem; index: number }) {
  const number = String(index + 1).padStart(2, '0');
  if (index === 0) {
    return (
      <Reveal as="article" className="sm:col-span-2">
        <span className="meta tabular-nums">{number}</span>
        <h3 className="display mt-3 text-3xl text-ink sm:text-[2.6rem]">{note.title}</h3>
        <p className="mt-4 max-w-lg text-pretty font-serif text-lg italic leading-relaxed text-ink-soft">{note.body}</p>
      </Reveal>
    );
  }
  return (
    <Reveal as="article" delay={((index % 3) + 1) as 1 | 2 | 3} className="border-t border-ink/10 pt-5">
      <div className="flex items-baseline gap-3">
        <span className="meta tabular-nums">{number}</span>
        <h3 className="font-serif text-xl text-ink">{note.title}</h3>
      </div>
      <p className="mt-3 text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">{note.body}</p>
    </Reveal>
  );
}

export function LittleThings() {
  const { littleThings } = siteContent;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="eyebrow">{littleThings.title}</h3>
        <span className="shrink-0 whitespace-nowrap font-hand text-xl text-fuchsia-600">ghi vội</span>
      </div>
      <div className="mt-8 grid gap-x-10 gap-y-10 sm:grid-cols-2">
        {littleThings.notes.map((note, i) => (
          <Note key={note.id} note={note} index={i} />
        ))}
      </div>
    </div>
  );
}
