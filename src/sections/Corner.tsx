import { Letter } from '@/sections/Letter';
import { PersonalNotes } from '@/sections/PersonalNotes';
import { Wishlist } from '@/sections/Wishlist';
import type { NoteRecord, StoryRecord } from '@/lib/journalData';
import type { CoupleIdentity } from '@/lib/photoLetterRepository';

export function Corner({
  identity,
  notes,
  stories,
}: {
  identity: CoupleIdentity;
  notes: NoteRecord[];
  stories: StoryRecord[];
}) {
  return (
    <section id="corner" aria-labelledby="corner-title" className="corner-section section-anchor">
      <div className="corner-wrap">
        <div className="section-lead">
          <span className="section-kicker">Góc riêng</span>
          <h2 id="corner-title">Những điều muốn giữ lại</h2>
          <p>Ghi chú, việc muốn làm cùng nhau và những lá thư dành riêng cho nhau.</p>
        </div>
        <div className="corner-grid">
          <Wishlist />
          <PersonalNotes notes={notes} stories={stories} />
        </div>
        <Letter identity={identity} />
      </div>
    </section>
  );
}
