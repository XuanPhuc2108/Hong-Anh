import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Music } from 'lucide-react';

/**
 * Nhạc nền — không tự phát, người dùng bấm Play mới bật.
 * Nút điều khiển sống trong menu mở rộng (FloatingNav), không còn
 * thanh riêng cố định dưới màn hình.
 */
export function MusicControls() {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(
      'https://cdn.pixabay.com/audio/2022/10/30/audio_347111d654.mp3'
    );
    audio.loop = true;
    audio.volume = 0.0;
    audio.preload = 'none';
    audio.addEventListener('canplay', () => setReady(true));
    audio.addEventListener('error', () => setReady(false));
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (playing) {
        audio.pause();
        setPlaying(false);
      } else {
        await audio.play();
        setPlaying(true);
        if (!muted) fadeTo(audio, 0.4);
      }
    } catch {
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = !muted;
    setMuted(next);
    fadeTo(audio, next ? 0 : 0.4);
  };

  return (
    <div className="glass flex items-center gap-2 rounded-full p-1.5 pl-3 shadow-glass">
      <div className="flex items-center gap-2 pr-1">
        <Music
          size={15}
          className={`transition-colors ${playing && !muted ? 'text-fuchsia-600' : 'text-ink-soft'}`}
        />
        <span className="text-xs font-medium text-ink-soft">
          {playing ? (muted ? 'Đang tắt tiếng' : 'Đang phát') : 'Nhạc nền'}
        </span>
      </div>

      <button
        onClick={togglePlay}
        className="btn-tactile grid h-9 w-9 place-items-center rounded-full gradient-fuchsia text-white shadow-soft"
        aria-label={playing ? 'Tạm dừng nhạc' : 'Phát nhạc'}
        disabled={!ready && playing === false}
      >
        {playing ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
      </button>

      <button
        onClick={toggleMute}
        className="btn-tactile grid h-9 w-9 place-items-center rounded-full text-fuchsia-700 hover:bg-fuchsia-50"
        aria-label={muted ? 'Bật tiếng' : 'Tắt tiếng'}
      >
        {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
      </button>
    </div>
  );
}

function fadeTo(audio: HTMLAudioElement, target: number, duration = 400) {
  const start = audio.volume;
  const startTime = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - startTime) / duration);
    audio.volume = start + (target - start) * t;
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
