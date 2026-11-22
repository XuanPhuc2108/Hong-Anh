import { Reveal } from '@/components/Reveal';
import { siteContent } from '@/lib/content';

/** Quiet closing epilogue — no longer a navigation chapter. */
export function NextChapter() {
  const { nextChapter } = siteContent;
  return (
    <section aria-labelledby="next-title" className="relative pb-24 pt-8 md:pb-32">
      <Reveal className="mx-auto grid max-w-6xl gap-6 px-5 sm:px-8 md:grid-cols-12">
        <p className="eyebrow md:col-span-3 md:pt-3">Chương tiếp theo</p>
        <div className="md:col-span-8">
          <h2 id="next-title" className="display text-balance text-4xl italic text-ink sm:text-5xl">
            {nextChapter.title}
          </h2>
          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-ink-soft">{nextChapter.body}</p>
          <a href="#hero" className="btn-tactile link-underline mt-6 inline-block py-2 text-sm font-medium text-fuchsia-700">
            Về lại trang đầu
          </a>
        </div>
      </Reveal>
    </section>
  );
}
