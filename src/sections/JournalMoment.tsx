import { useEffect, useRef, useState } from 'react';

export function JournalMoment() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (typeof IntersectionObserver === 'undefined') {
      setActive(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: '120px 0px' }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="journal-moment"
      className="journal-moment section-anchor"
      data-moment="letters-assemble"
      data-moment-opts='{"spread":1}'
      aria-labelledby="journal-moment-title"
    >
      <div className="journal-moment__wrap">
        <svg className="journal-moment__flower journal-moment__flower--left" viewBox="0 0 120 160" aria-hidden="true">
          <path d="M18 146C46 113 64 78 79 15M47 105c-24 0-34-12-34-30 20 1 32 10 34 30Zm19-36c23-3 33-15 30-32-20 4-31 14-30 32Zm-31 49c-20-2-29-12-28-27 17 2 27 11 28 27Z" />
          <path className="journal-moment__blossom" d="M79 15c-10-10-8-17 0-18 8 1 10 8 0 18Zm0 0c10-10 17-8 18 0-1 8-8 10-18 0Zm0 0c10 10 8 17 0 18-8-1-10-8 0-18Zm0 0c-10 10-17 8-18 0 1-8 8-10 18 0Z" />
          <circle cx="79" cy="15" r="2.4" />
        </svg>
        <svg className="journal-moment__flower journal-moment__flower--right" viewBox="0 0 120 160" aria-hidden="true">
          <path d="M18 146C46 113 64 78 79 15M47 105c-24 0-34-12-34-30 20 1 32 10 34 30Zm19-36c23-3 33-15 30-32-20 4-31 14-30 32Zm-31 49c-20-2-29-12-28-27 17 2 27 11 28 27Z" />
          <path className="journal-moment__blossom" d="M79 15c-10-10-8-17 0-18 8 1 10 8 0 18Zm0 0c10-10 17-8 18 0-1 8-8 10-18 0Zm0 0c10 10 8 17 0 18-8-1-10-8 0-18Zm0 0c-10 10-17 8-18 0 1-8 8-10 18 0Z" />
          <circle cx="79" cy="15" r="2.4" />
        </svg>
        <div className={`journal-flight${active ? ' is-active' : ''}`} aria-hidden="true">
          <svg className="journal-flight__route" viewBox="0 0 200 70">
            <path d="M12 45C32 8 88 12 100 35S170 66 188 28 140 0 100 30 20 80 12 45Z" />
          </svg>
          <span className="journal-flight__butterfly">
            <svg viewBox="0 0 32 24">
              <g className="journal-flight__wings">
                <path d="M15 11C11 1 3 2 4 9c1 4 6 5 11 4Zm2 0c4-10 12-9 11-2-1 4-6 5-11 4Z" />
                <path d="M15 13c-5 1-8 6-5 8 3 1 5-3 6-7Zm2 0c5 1 8 6 5 8-3 1-5-3-6-7Z" />
              </g>
              <path className="journal-flight__body" d="M16 8v11m0-10-3-4m3 4 3-4" />
            </svg>
          </span>
          <i className="journal-flight__petal journal-flight__petal--one" />
          <i className="journal-flight__petal journal-flight__petal--two" />
        </div>
        <h2 id="journal-moment-title" className="mo-la__type">Mỗi trang, một kỷ niệm</h2>
        <p className="mo-la__sub">Mốc thời gian, ảnh và ghi chú đã được cất trong cuốn nhật ký.</p>
      </div>
    </section>
  );
}
