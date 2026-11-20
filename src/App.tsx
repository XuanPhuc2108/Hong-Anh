import { useCallback, useState } from 'react';
import { FloatingNav } from '@/components/FloatingNav';
import { Footer } from '@/components/Footer';
import { AmbientLight } from '@/components/AmbientLight';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ScrollProgress } from '@/components/ScrollProgress';
import { Hero } from '@/sections/Hero';
import { OurStory } from '@/sections/OurStory';
import { MemoryGallery } from '@/sections/MemoryGallery';
import { LittleThings } from '@/sections/LittleThings';
import { PhotoDiary } from '@/sections/PhotoDiary';
import { Letter } from '@/sections/Letter';
import { NextChapter } from '@/sections/NextChapter';
import { siteContent } from '@/lib/content';

function App() {
  const [booted, setBooted] = useState(false);
  const handleDone = useCallback(() => setBooted(true), []);

  return (
    <div className="relative min-h-screen">
      <AmbientLight />
      <LoadingScreen onDone={handleDone} />
      <ScrollProgress />
      <FloatingNav />
      <main className="relative z-10">
        <Hero />
        <OurStory />
        <MemoryGallery />
        <LittleThings />
        <PhotoDiary />
        <Letter />
        <NextChapter />
      </main>
      <Footer content={siteContent.nextChapter} />
    </div>
  );
}

export default App;
