import { Reveal } from '@/components/Reveal';
import { Sparkles } from 'lucide-react';
import { siteContent } from '@/lib/content';

export function NextChapter() {
  const { nextChapter } = siteContent;
  return (
    <section id="next" className="paper-texture relative overflow-hidden bg-paper-warm py-28 md:py-36">
      {/* atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full gradient-fuchsia opacity-10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
        <Reveal className="flex flex-col items-center gap-6">
          <span className="grid h-12 w-12 place-items-center rounded-full glass glass-specular text-fuchsia-600 shadow-glass">
            <Sparkles size={20} />
          </span>
          <span className="eyebrow">{nextChapter.eyebrow}</span>
          <h2 className="text-balance font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            {nextChapter.title}
          </h2>
          <p className="max-w-xl text-pretty text-base leading-relaxed text-ink-soft sm:text-lg">
            {nextChapter.body}
          </p>
          <div className="divider mt-2" />
          <a
            href="#hero"
            className="btn-tactile glass glass-specular mt-2 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-fuchsia-700"
          >
            Về lại trang đầu
          </a>
        </Reveal>
      </div>
    </section>
  );
}
