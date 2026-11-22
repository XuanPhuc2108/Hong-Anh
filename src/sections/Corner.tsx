import { Letter } from '@/sections/Letter';
import { PersonalNotes } from '@/sections/PersonalNotes';
import { Wishlist } from '@/sections/Wishlist';
import { getLetterSettings, type NoteRecord, type StoryRecord } from '@/lib/journalData';

export function Corner({
  notes,
  stories,
  settings,
}: {
  notes: NoteRecord[];
  stories: StoryRecord[];
  settings: Record<string, string>;
}) {
  const letter = getLetterSettings(settings);

  return (
    <section id="corner" aria-labelledby="corner-title" className="corner-section section-anchor">
      <div className="corner-wrap">
        <div className="section-lead">
          <span className="section-kicker">Góc nhỏ</span>
          <h2 id="corner-title">Mấy điều muốn cất lại</h2>
          <p>Ghi chú, điều muốn làm cùng nhau và một chỗ để viết thư.</p>
        </div>
        <div className="corner-grid">
          <Wishlist />
          <PersonalNotes notes={notes} stories={stories} />
        </div>
        <Letter initialLetter={letter} />
      </div>
    </section>
  );
}
