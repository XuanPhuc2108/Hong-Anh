import { Headphones, ArrowUpRight } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { Reveal } from '@/components/Reveal';
import { playlists } from '@/lib/content';

function PlaylistCard({ title, owner, songs, index }: { title: string; owner: string; songs: typeof playlists.anh; index: number }) {
  return (
    <Reveal className={`playlist-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8 ${index === 0 ? 'playlist-card-anh' : 'playlist-card-phuc'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Playlist của {owner}</p>
          <h3 className="display mt-3 text-3xl text-ink sm:text-4xl">{title}</h3>
        </div>
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white/55 text-fuchsia-700 shadow-[inset_0_1px_0_white]">
          <Headphones aria-hidden size={20} />
        </span>
      </div>
      {songs.length ? (
        <ol className="mt-8 divide-y divide-ink/10">
          {songs.map((song, i) => (
            <li key={song.id} className="flex items-center gap-4 py-4">
              <span className="meta w-6 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              {song.artwork ? <img src={song.artwork} alt="" className="size-12 rounded-xl object-cover" loading="lazy" /> : <span className="size-12 rounded-xl bg-white/50" aria-hidden />}
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-lg text-ink">{song.title}</p>
                <p className="meta truncate">{song.artist}{song.note ? ` · ${song.note}` : ''}</p>
              </div>
              {song.url && <a href={song.url} target="_blank" rel="noreferrer" aria-label={`Mở ${song.title} của ${song.artist}`} className="grid size-10 place-items-center rounded-full bg-white/50 text-fuchsia-700"><ArrowUpRight size={17} aria-hidden /></a>}
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-rose-300/70 bg-white/35 p-5">
          <p className="font-serif text-xl italic text-ink">Chỗ này để dành cho những bài hát thương.</p>
          <p className="meta mt-2">Thêm bài hát và đường dẫn trong <code>src/lib/content.ts</code>. Nhạc chỉ mở khi mình chủ động bấm.</p>
        </div>
      )}
    </Reveal>
  );
}

export function OurSoundtrack() {
  return (
    <section id="soundtrack" aria-labelledby="soundtrack-title" className="relative py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading id="soundtrack-title" number="04" eyebrow="Our Soundtrack" title="Những bài hát của tụi mình" intro="Hai playlist riêng, để mỗi người tự chọn bài muốn nghe. Không có nhạc tự phát đâu nè." />
        <div className="mt-12 grid gap-5 lg:grid-cols-2 lg:gap-7">
          <PlaylistCard title="Playlist của Ánh" owner="Ánh" songs={playlists.anh} index={0} />
          <PlaylistCard title="Playlist của Phúc" owner="Phúc" songs={playlists.phuc} index={1} />
        </div>
      </div>
    </section>
  );
}
