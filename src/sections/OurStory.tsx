import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { Share2 } from 'lucide-react';
import { formatDateOnly } from '@/lib/dates';
import { relationshipDates } from '@/lib/my-love-config';
import { useGlassPointer } from '@/lib/hooks';
import type { MemoryRecord } from '@/lib/journalData';
import { BotanicalAccent } from '@/components/BotanicalAccent';

type JourneyMoment = {
  id: string;
  date: string;
  title: string;
  description: string;
  photo?: string;
};

function buildMoments(memories: MemoryRecord[]): JourneyMoment[] {
  const confirmed: JourneyMoment[] = [
    {
      id: 'first-conversation',
      date: relationshipDates.firstConversation,
      title: 'Ngày bắt đầu trò chuyện',
      description: 'Ngày Ánh bắt đầu trò chuyện với Phúc.',
    },
    {
      id: 'relationship-start',
      date: relationshipDates.relationshipStart,
      title: 'Chính thức bên nhau',
      description: 'Ngày Phúc và Ánh chính thức trở thành một đôi.',
    },
  ];
  const saved = memories
    .filter((memory) => memory.title.trim())
    .map((memory) => ({
      id: memory.id,
      date: memory.date?.trim() || '',
      title: memory.title,
      description: memory.description?.trim() || '',
      photo: memory.photo_url || undefined,
    }))
    .filter(
      (memory) =>
        !confirmed.some(
          (moment) =>
            moment.date === memory.date &&
            moment.title.trim().toLocaleLowerCase('vi') === memory.title.trim().toLocaleLowerCase('vi')
        )
    );

  return [...confirmed, ...saved].sort((a, b) => {
    const dateA = /^\d{4}-\d{2}-\d{2}$/.test(a.date) ? a.date : '';
    const dateB = /^\d{4}-\d{2}-\d{2}$/.test(b.date) ? b.date : '';
    if (dateA && dateB) return dateA.localeCompare(dateB);
    if (dateA) return -1;
    if (dateB) return 1;
    return 0;
  });
}

type TimelineGeometry = {
  width: number;
  height: number;
  path: string;
  firstMarkerY: number;
  lastMarkerY: number;
};

function MomentCard({
  moment,
  index,
  left,
  glassRef,
}: {
  moment: JourneyMoment;
  index: number;
  left: boolean;
  glassRef?: RefObject<HTMLElement>;
}) {
  const [shareStatus, setShareStatus] = useState('');
  const share = async () => {
    const url = new URL(`#memory-${encodeURIComponent(moment.id)}`, window.location.href).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title: moment.title, text: moment.description, url });
        setShareStatus('Đã mở bảng chia sẻ.');
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setShareStatus('Đã sao chép liên kết.');
      } else {
        window.prompt('Sao chép liên kết kỷ niệm:', url);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.error('Không thể chia sẻ ghi chép.', error);
      setShareStatus('Không thể chia sẻ lúc này. Hãy thử lại.');
    }
  };

  return (
    <li className={`journey-row ${left ? 'journey-row--left' : 'journey-row--right'}`}>
      <span className="journey-bead" aria-hidden>
        <span />
      </span>
      <article
        id={`memory-${moment.id}`}
        ref={glassRef}
        className={`journey-card${glassRef ? ' lg' : ''}`}
      >
        <div className="journey-card__date">
          <span>{String(index + 1).padStart(2, '0')}</span>
          {moment.date && (
            <time dateTime={/^\d{4}-\d{2}-\d{2}$/.test(moment.date) ? moment.date : undefined}>
              {/^\d{4}-\d{2}-\d{2}$/.test(moment.date) ? formatDateOnly(moment.date) : moment.date}
            </time>
          )}
        </div>
        <h3>{moment.title}</h3>
        {moment.description && <p>{moment.description}</p>}
        {moment.photo && (
          <figure className="journey-photo photo-hover">
            <img src={moment.photo} alt={moment.title} loading="lazy" decoding="async" />
          </figure>
        )}
        <button type="button" className="journey-share" onClick={share} aria-label={`Chia sẻ ghi chép: ${moment.title}`}>
          <Share2 size={15} aria-hidden />
          <span>Chia sẻ</span>
        </button>
        {shareStatus && <span className="journey-share-status" role="status">{shareStatus}</span>}
      </article>
    </li>
  );
}

export function OurStory({ memories }: { memories: MemoryRecord[] }) {
  const moments = useMemo(() => buildMoments(memories), [memories]);
  const trackRef = useRef<HTMLDivElement>(null);
  const featuredGlassRef = useGlassPointer<HTMLElement>();
  const [geometry, setGeometry] = useState<TimelineGeometry>({
    width: 0,
    height: 0,
    path: '',
    firstMarkerY: 0,
    lastMarkerY: 0,
  });

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      const bounds = track.getBoundingClientRect();
      const width = track.clientWidth;
      const height = track.clientHeight;
      const points = Array.from(track.querySelectorAll<HTMLElement>('.journey-bead')).map((bead) => {
        const rect = bead.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2 - bounds.left,
          y: rect.top + rect.height / 2 - bounds.top,
        };
      });

      const path = points.slice(1).reduce((result, point, index) => {
        const previous = points[index];
        const distance = point.y - previous.y;
        return `${result} C ${previous.x} ${previous.y + distance * 0.42}, ${point.x} ${point.y - distance * 0.42}, ${point.x} ${point.y}`;
      }, points.length > 0 ? `M ${points[0].x} ${points[0].y}` : '');
      const firstMarkerY = points[0]?.y ?? 0;
      const lastMarkerY = points[points.length - 1]?.y ?? firstMarkerY;

      setGeometry((current) =>
        current.width === width &&
        current.height === height &&
        current.path === path &&
        current.firstMarkerY === firstMarkerY &&
        current.lastMarkerY === lastMarkerY
          ? current
          : { width, height, path, firstMarkerY, lastMarkerY }
      );
    };

    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(track);
    track.querySelectorAll('.journey-row').forEach((row) => observer?.observe(row));
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [moments.length]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const path = track?.querySelector<SVGPathElement>('.journey-track__svg path');
    if (!track || !path || !geometry.path) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const updatePath = () => {
      raf = 0;
      const bounds = track.getBoundingClientRect();
      const firstMarkerY = bounds.top + geometry.firstMarkerY;
      const lastMarkerY = bounds.top + geometry.lastMarkerY;
      const start = window.innerHeight * 0.78;
      const finish = window.innerHeight * 0.68;
      const markerDistance = Math.max(0, lastMarkerY - firstMarkerY);
      const progress = reducedMotion
        ? 1
        : Math.max(0, Math.min(1, (start - firstMarkerY) / (markerDistance + start - finish)));
      path.style.strokeDashoffset = String(1 - progress);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(updatePath);
    };
    updatePath();
    if (!reducedMotion) {
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [geometry.firstMarkerY, geometry.lastMarkerY, geometry.path]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    track.dataset.revealReady = 'true';
    const rows = Array.from(track.querySelectorAll<HTMLElement>('.journey-row'));
    if (typeof IntersectionObserver === 'undefined') {
      rows.forEach((row) => row.classList.add('is-in-view'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in-view');
        observer.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    rows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, [moments.length]);

  return (
    <section id="journey" aria-labelledby="journey-title" className="journey-section section-anchor">
      <div className="journey-wrap">
        <div className="section-lead">
          <h2 id="journey-title">Hai dấu mốc của tụi mình</h2>
          <p>Hai ngày quan trọng đã được xác nhận, cùng những kỷ niệm đang có trong kho.</p>
          <BotanicalAccent kind="flower" className="journey-flower" />
        </div>
        <div ref={trackRef} className="journey-track">
          <svg
            className="journey-track__svg"
            viewBox={`0 0 ${geometry.width} ${geometry.height}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d={geometry.path} pathLength="1" />
          </svg>
          <ol className="journey-list">
            {moments.map((moment, index) => (
              <MomentCard
                key={moment.id}
                moment={moment}
                index={index}
                left={index % 2 === 0}
                glassRef={index === 0 ? featuredGlassRef : undefined}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
