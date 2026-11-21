import { useState } from 'react';
import { Reveal } from '@/components/Reveal';
import { siteContent } from '@/lib/content';
import { playLetterSound } from '@/lib/audio';

export function Letter() {
  const { letter } = siteContent;
  const [open, setOpen] = useState(false);

  const openLetter = () => {
    if (open) return;
    playLetterSound();
    setOpen(true);
  };

  return (
    <Reveal as="article" className="sheet relative min-h-72 overflow-hidden rounded-[2px] px-7 py-10 shadow-soft-lg sm:px-12 sm:py-14">
      <div className="flex items-baseline justify-between gap-4">
        <span className="eyebrow">Một bức thư</span>
        <span className="meta">Tr. cuối</span>
      </div>
      <h3 className="display mt-6 text-5xl italic text-ink sm:text-6xl">{letter.title}</h3>
      {!open ? (
        <div className="mt-7 flex flex-col items-start gap-5">
          <p className="max-w-md font-serif text-lg italic text-ink-soft">Một lá thư nhỏ đang chờ được mở.</p>
          <button type="button" onClick={openLetter} aria-expanded={open} className="btn-tactile lg rounded-full px-6 py-3 text-sm font-medium text-fuchsia-800">Mở lá thư</button>
        </div>
      ) : (
        <div className="animate-fade-in">
          <div className="rule mt-8 w-16" />
          <p className="mt-8 max-w-prose text-pretty font-serif text-lg leading-[1.9] text-ink sm:text-xl">{letter.body}</p>
          <p className="mt-10 text-right font-hand text-3xl text-fuchsia-700">{letter.signature}</p>
        </div>
      )}
    </Reveal>
  );
}
