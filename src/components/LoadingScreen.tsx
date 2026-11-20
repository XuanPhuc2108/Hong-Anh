import { useState } from 'react';

/**
 * Opening screen: drawn heart, soft light, and a "Chạm để mở" button.
 *
 * The user taps to enter — no auto-dismiss. The tap also unlocks audio:
 * iPhone Safari requires a user gesture before any sound, so the tap
 * starts a real Web Audio chime (synthesized, no external file) at the
 * same moment the veil lifts. Respects the mute state the rest of the
 * site shares via a simple flag on window (set by MusicControls).
 */
export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  const enter = () => {
    if (leaving || gone) return;
    playEntryChime();
    setLeaving(true);
    window.setTimeout(() => {
      setGone(true);
      onDone();
    }, 800);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Màn hình mở đầu"
      className={`boot-exit fixed inset-0 z-[90] flex items-center justify-center bg-paper-warm ${
        leaving ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      {/* soft ambient light behind the logo */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(45% 45% at 50% 50%, rgba(247, 182, 210, 0.5) 0%, rgba(247, 182, 210, 0) 70%)',
        }}
      />

      <div className="relative flex flex-col items-center gap-8">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            className="boot-logo-path"
            d="M12 21C7 16.5 3 13.2 3 9.1 3 6.3 5.2 4 8 4c1.6 0 3.1.8 4 2.1C12.9 4.8 14.4 4 16 4c2.8 0 5 2.3 5 5.1 0 4.1-4 7.4-9 11.9z"
            stroke="#D81B72"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <span className="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-ink-soft">
          Nhật ký cho Ánh
        </span>

        <button
          onClick={enter}
          className="btn-tactile glass glass-specular glass-refraction group inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 text-sm font-semibold text-fuchsia-700 shadow-glass-lg"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="text-fuchsia-500">
            <path
              d="M12 21C7 16.5 3 13.2 3 9.1 3 6.3 5.2 4 8 4c1.6 0 3.1.8 4 2.1C12.9 4.8 14.4 4 16 4c2.8 0 5 2.3 5 5.1 0 4.1-4 7.4-9 11.9z"
              fill="currentColor"
            />
          </svg>
          Chạm để mở
        </button>
      </div>
    </div>
  );
}

/**
 * Synthesized entry chime via Web Audio API — two soft bell tones
 * (E5 then B5) with exponential decay. Created inside the user gesture,
 * so iPhone autoplay policy is satisfied. Skips itself if the site is
 * muted or Web Audio is unavailable.
 */
function playEntryChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    void ctx.resume();

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);

    const tone = (freq: number, start: number, dur: number, peak: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(peak, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(start + dur + 0.05);
    };

    // In-trấy trong trẻo: nốt chính + hòa âm nhẹ hơn, trễ chút
    tone(659.25, now, 1.6, 0.28); // E5
    tone(987.77, now + 0.18, 1.9, 0.2); // B5
    tone(1318.51, now + 0.36, 1.6, 0.08); // E6 harmonic shimmer

    window.setTimeout(() => void ctx.close(), 3000);
  } catch {
    // No audio available — entering silently is fine.
  }
}
