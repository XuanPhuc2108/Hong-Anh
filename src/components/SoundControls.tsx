import { useSound } from '@/components/SoundContext';

export function SoundControls() {
  const { preferences, persistenceError, updatePreferences } = useSound();

  return (
    <fieldset className="sound-controls">
      <legend>Âm thanh nho nhỏ</legend>
      <label className="sound-choice">
        <input
          type="checkbox"
          checked={preferences.enabled}
          onChange={(event) => updatePreferences({ enabled: event.target.checked })}
        />
        <span>Âm thanh giao diện</span>
      </label>
      <label className="sound-choice">
        <input
          type="checkbox"
          checked={preferences.keyboardEnabled}
          disabled={!preferences.enabled}
          onChange={(event) => updatePreferences({ keyboardEnabled: event.target.checked })}
        />
        <span>Tiếng gõ phím</span>
      </label>
      <label className="sound-volume">
        <span>Âm lượng hiệu ứng</span>
        <input
          type="range"
          min="0"
          max="0.5"
          step="0.01"
          value={preferences.volume}
          aria-label="Âm lượng âm thanh giao diện"
          onChange={(event) => updatePreferences({ volume: Number(event.target.value) })}
        />
      </label>
      <p className="sound-caption" aria-live="polite">
        {persistenceError || 'Không có nhạc tự phát đâu nha.'}
      </p>
    </fieldset>
  );
}
