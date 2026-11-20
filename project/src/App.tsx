import { FloatingNav } from '@/components/FloatingNav';
import { MusicPlayer } from '@/components/MusicPlayer';
import { Footer } from '@/components/Footer';
import { Hero } from '@/sections/Hero';
import { OurStory } from '@/sections/OurStory';
import { MemoryGallery } from '@/sections/MemoryGallery';
import { LittleThings } from '@/sections/LittleThings';
import { PhotoDiary } from '@/sections/PhotoDiary';
import { Letter } from '@/sections/Letter';
import { NextChapter } from '@/sections/NextChapter';
import { siteContent } from '@/lib/content';

function App() {
  return (
    <div className="min-h-screen bg-paper-warm">
      <FloatingNav />
      <main>
        <Hero />
        <OurStory />
        <MemoryGallery />
        <LittleThings />
        <PhotoDiary />
        <Letter />
        <NextChapter />
      </main>
      <Footer content={siteContent.nextChapter} />
      <MusicPlayer />
    </div>
  );
}

export default App;
