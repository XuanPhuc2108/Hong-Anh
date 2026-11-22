import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Music2 } from 'lucide-react';
import { playlists } from '@/lib/my-love-config';

const PREVIEW_TRACK_COUNT = 2;

function PlaylistCard({ playlist }: { playlist: (typeof playlists)[number] }) {
  const [expanded, setExpanded] = useState(false);
  const owner = playlist.id === 'anh' ? 'Ánh' : 'Phúc';
  const tracks = expanded ? playlist.tracks : playlist.tracks.slice(0, PREVIEW_TRACK_COUNT);
  const itemLabel = playlist.platform === 'YouTube' ? 'video' : 'bài';
  const trackListId = `playlist-tracks-${playlist.id}`;

  return (
    <section className={`playlist playlist--${playlist.id}`} aria-labelledby={`playlist-${playlist.id}`}>
      <a
        className="playlist__art"
        href={playlist.url}
        target="_blank"
        rel="noreferrer"
        aria-label={`Mở ${playlist.title} trên ${playlist.platform}`}
      >
        <img
          className="playlist__cover"
          src={playlist.artwork}
          alt={`Ảnh bìa ${playlist.title}`}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
        <span className="playlist__center" aria-hidden="true">
          <ExternalLink size={18} />
        </span>
      </a>
      <div className="playlist__body">
        <span className="playlist__owner">Góc nghe của {owner}</span>
        <h3 id={`playlist-${playlist.id}`}>{playlist.title}</h3>
        <p>{playlist.description}</p>
        <a className="playlist__link" href={playlist.url} target="_blank" rel="noreferrer">
          <Music2 size={16} aria-hidden="true" />
          Mở trên {playlist.platform}
          <ExternalLink size={14} aria-hidden="true" />
        </a>
        {playlist.tracks.length > 0 ? (
          <>
            <ol id={trackListId} className="playlist__tracks">
              {tracks.map((track) => (
                <li key={`${track.title}-${track.artist ?? track.byline}`}>
                  <div className="playlist__track-art">
                    {track.artwork ? <img src={track.artwork} alt="" loading="lazy" /> : <Music2 size={16} aria-hidden />}
                  </div>
                  <div className="playlist__track-copy">
                    <strong>{track.title}</strong>
                    <span>{track.artist ?? track.byline}</span>
                    {track.note && <small>{track.note}</small>}
                  </div>
                  {track.url && (
                    <a href={track.url} target="_blank" rel="noreferrer" aria-label={`Mở ${track.title}`}>
                      <ExternalLink size={16} aria-hidden />
                    </a>
                  )}
                </li>
              ))}
            </ol>
            {playlist.tracks.length > PREVIEW_TRACK_COUNT && (
              <button
                type="button"
                className="playlist__toggle"
                aria-expanded={expanded}
                aria-controls={trackListId}
                aria-label={expanded ? `Thu gọn danh sách của ${owner}` : `Xem tất cả ${playlist.tracks.length} ${itemLabel} của ${owner}`}
                onClick={() => setExpanded((isExpanded) => !isExpanded)}
              >
                {expanded ? (
                  <>
                    Thu gọn danh sách <ChevronUp size={16} aria-hidden />
                  </>
                ) : (
                  <>
                    Xem tất cả {playlist.tracks.length} {itemLabel} <ChevronDown size={16} aria-hidden />
                  </>
                )}
              </button>
            )}
          </>
        ) : (
          <div className="playlist__empty">
            <span>Playlist chưa có bài nào nè.</span>
          </div>
        )}
      </div>
    </section>
  );
}

export function OurSoundtrack() {
  return (
    <section id="soundtrack" aria-labelledby="soundtrack-title" className="soundtrack-section section-anchor">
      <div className="soundtrack-wrap">
        <div className="section-lead">
          <span className="section-kicker">Nhạc của tụi mình</span>
          <h2 id="soundtrack-title">Playlist nghe cùng nhau</h2>
          <p>Bấm vào ảnh bìa để mở playlist của Ánh hoặc Phúc nè.</p>
        </div>
        <div className="playlist-pair">
          {playlists.map((playlist) => <PlaylistCard key={playlist.id} playlist={playlist} />)}
        </div>
      </div>
    </section>
  );
}
