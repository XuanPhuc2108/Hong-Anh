import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

/**
 * Nhạc nền — không tự phát, người dùng bấm Play mới bật.
 * Nút điều khiển sống trong bảng mở rộng của FloatingNav.
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

  const status = playing ? (muted ? 'Đang tắt tiếng' : 'Đang phát') : 'Nhạc nền';

  return (
    <div className="flex items-center gap-2 rounded-full bg-white/55 p-1.5 shadow-[inset_0_1px_0_white,inset_0_0_0_1px_rgba(255,255,255,0.6)]">
      <button
        onClick={togglePlay}
        className="btn-tactile grid h-10 w-10 shrink-0 place-items-center rounded-full bg-fuchsia-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_6px_16px_-6px_rgba(184,50,95,0.7)]"
        aria-label={playing ? 'Tạm dừng nhạc' : 'Phát nhạc'}
        disabled={!ready && playing === false}
      >
        {playing ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-2" aria-live="polite">
        <span aria-hidden className="flex h-4 items-end gap-[3px]">
          {[0.55, 1, 0.7].map((h, i) => (
            <span
              key={i}
              className="w-[2px] rounded-full bg-fuchsia-500 transition-[height] duration-500"
              style={{ height: playing && !muted ? `${h * 100}%` : '25%' }}
            />
          ))}
        </span>
        <span className="truncate text-xs font-medium text-ink-soft">{status}</span>
      </div>

      <button
        onClick={toggleMute}
        className="btn-tactile grid h-10 w-10 shrink-0 place-items-center rounded-full text-fuchsia-700 hover:bg-white/60"
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
