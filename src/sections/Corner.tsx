import { SectionHeading } from '@/components/SectionHeading';
import { LittleThings } from '@/sections/LittleThings';
import { Letter } from '@/sections/Letter';
import { siteContent } from '@/lib/content';

/** Góc riêng — little notes beside the letter, on one spread. */
export function Corner() {
  const { littleThings } = siteContent;
  return (
    <section id="corner" aria-labelledby="corner-title" className="relative py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          id="corner-title"
          number="03"
          eyebrow="Góc riêng"
          title="Điều nhỏ và bức thư"
          intro={littleThings.intro}
        />
        <div className="mt-14 grid gap-16 md:mt-20 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <LittleThings />
          </div>
          <div className="lg:col-span-7">
            <Letter />
          </div>
        </div>
      </div>
    </section>
  );
}
