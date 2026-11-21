import { useEffect, useState } from 'react';
import { Keyboard, Volume2, VolumeX } from 'lucide-react';
import { readSoundPreferences, saveSoundPreferences } from '@/lib/audio';

type Preferences = ReturnType<typeof readSoundPreferences>;

/** Sound is opt-in by interaction; there is intentionally no background music. */
export function MusicControls() {
  const [preferences, setPreferences] = useState<Preferences>({ enabled: true, keyboardEnabled: true, volume: 0.35 });

  useEffect(() => setPreferences(readSoundPreferences()), []);

  const update = (change: Partial<Preferences>) => {
    setPreferences((current) => {
      const next = { ...current, ...change };
      saveSoundPreferences(next);
      return next;
    });
  };

  return (
    <div className="grid gap-3 rounded-2xl bg-white/50 p-4 shadow-[inset_0_1px_0_white]">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium text-ink"><Volume2 size={16} aria-hidden />Âm thanh</span>
        <button type="button" onClick={() => update({ enabled: !preferences.enabled })} className="btn-tactile rounded-full px-3 py-2 text-xs font-medium text-fuchsia-700" aria-pressed={preferences.enabled}>
          {preferences.enabled ? 'Đang bật' : 'Đang tắt'}
        </button>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-xs text-ink-soft"><Keyboard size={15} aria-hidden />Tiếng gõ phím</span>
        <button type="button" onClick={() => update({ keyboardEnabled: !preferences.keyboardEnabled })} className="btn-tactile rounded-full px-3 py-2 text-xs font-medium text-fuchsia-700" aria-pressed={preferences.keyboardEnabled}>
          {preferences.keyboardEnabled ? 'Bật' : 'Tắt'}
        </button>
      </div>
      <label className="flex items-center gap-3 text-xs text-ink-soft">
        {preferences.enabled ? <Volume2 size={15} aria-hidden /> : <VolumeX size={15} aria-hidden />}
        <span className="sr-only">Âm lượng hiệu ứng</span>
        <input type="range" min="0" max="1" step="0.05" value={preferences.volume} onChange={(event) => update({ volume: Number(event.target.value) })} className="w-full accent-fuchsia-700" aria-label="Âm lượng hiệu ứng" />
        <span className="w-9 text-right tabular-nums">{Math.round(preferences.volume * 100)}%</span>
      </label>
    </div>
  );
}
