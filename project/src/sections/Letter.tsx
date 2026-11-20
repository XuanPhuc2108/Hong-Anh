import { Reveal } from '@/components/Reveal';
import { siteContent } from '@/lib/content';

export function Letter() {
  const { letter } = siteContent;
  return (
    <section id="letter" className="paper-texture relative bg-paper-warm py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal className="relative">
          {/* decorative paper stack */}
          <div className="absolute -inset-x-2 -inset-y-2 -z-10 rotate-[-1.5deg] rounded-3xl bg-fuchsia-100/60" />
          <div className="absolute -inset-x-1 -inset-y-1 -z-10 rotate-[1deg] rounded-3xl bg-fuchsia-200/50" />

          <article className="paper-grain rounded-3xl bg-paper-pale p-8 shadow-soft-lg sm:p-12 md:p-16">
            <span className="eyebrow">{letter.eyebrow}</span>
            <h2 className="mt-4 font-serif text-4xl font-semibold italic text-ink sm:text-5xl">
              {letter.title}
            </h2>
            <div className="mt-8 space-y-6 text-pretty text-base leading-[1.85] text-ink sm:text-lg">
              <p>{letter.body}</p>
            </div>
            <p className="mt-10 font-hand text-2xl text-fuchsia-700">{letter.signature}</p>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
