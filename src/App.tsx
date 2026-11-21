import { useCallback, useState } from 'react';
import { FloatingNav } from '@/components/FloatingNav';
import { Footer } from '@/components/Footer';
import { AmbientLight } from '@/components/AmbientLight';
import { GlassFilters } from '@/components/GlassFilters';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ScrollProgress } from '@/components/ScrollProgress';
import { Hero } from '@/sections/Hero';
import { OurStory } from '@/sections/OurStory';
import { Library } from '@/sections/Library';
import { Corner } from '@/sections/Corner';
import { NextChapter } from '@/sections/NextChapter';
import { OurSoundtrack } from '@/sections/OurSoundtrack';
import { siteContent } from '@/lib/content';

function App() {
  const [booted, setBooted] = useState(false);
  const handleDone = useCallback(() => setBooted(true), []);

  return (
    <div className="relative min-h-screen" data-booted={booted}>
      <GlassFilters />
      <AmbientLight />
      <LoadingScreen onDone={handleDone} criticalImages={siteContent.gallery.images.slice(0, 1).map((image) => image.src)} />
      <ScrollProgress />
      <FloatingNav />
      <main className="relative z-10">
        <Hero />
        <OurStory />
        <Library />
        <OurSoundtrack />
        <Corner />
        <NextChapter />
      </main>
      <Footer content={siteContent.nextChapter} />
    </div>
  );
}

export default App;
