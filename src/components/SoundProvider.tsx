import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { DEFAULT_PREFERENCES, SoundContext, type SoundKind, type SoundPreferences } from '@/components/SoundContext';

const STORAGE_KEY = 'my-love:sound-preferences:v1';

function readPreferences(): SoundPreferences {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_PREFERENCES;
    const parsed: Partial<SoundPreferences> = JSON.parse(stored);
    return {
      enabled: parsed.enabled ?? DEFAULT_PREFERENCES.enabled,
      keyboardEnabled: parsed.keyboardEnabled ?? DEFAULT_PREFERENCES.keyboardEnabled,
      volume: typeof parsed.volume === 'number' ? Math.min(1, Math.max(0, parsed.volume)) : DEFAULT_PREFERENCES.volume,
    };
  } catch (error) {
    console.warn('Không thể đọc cài đặt âm thanh đã lưu.', error);
    return DEFAULT_PREFERENCES;
  }
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(readPreferences);
  const [persistenceError, setPersistenceError] = useState('');
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);

  const getAudioContext = useCallback(() => {
    if (audioContextRef.current) return audioContextRef.current;
    const AudioContextConstructor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return null;
    try {
      audioContextRef.current = new AudioContextConstructor();
    } catch (error) {
      console.warn('Âm thanh giao diện không khả dụng trên thiết bị này.', error);
      return null;
    }
    return audioContextRef.current;
  }, []);

  const primeAudio = useCallback(() => {
    const context = getAudioContext();
    if (context?.state === 'suspended') {
      void context.resume().catch((error: unknown) => console.warn('Không thể khởi động âm thanh giao diện.', error));
    }
  }, [getAudioContext]);

  const playSound = useCallback(
    (kind: SoundKind) => {
      if (!preferences.enabled || preferences.volume <= 0 || (kind === 'key' && !preferences.keyboardEnabled)) return;
      const context = getAudioContext();
      if (!context) return;
      if (context.state === 'suspended') {
        void context.resume().catch((error: unknown) => console.warn('Không thể khởi động âm thanh giao diện.', error));
      }

      const now = context.currentTime;
      const master = context.createGain();
      master.gain.value = preferences.volume;
      master.connect(context.destination);

      if (kind === 'key' || kind === 'letter') {
        if (!noiseBufferRef.current) {
          const length = Math.ceil(context.sampleRate * 0.025);
          const buffer = context.createBuffer(1, length, context.sampleRate);
          const channel = buffer.getChannelData(0);
          for (let i = 0; i < length; i += 1) channel[i] = Math.random() * 2 - 1;
          noiseBufferRef.current = buffer;
        }
        const noise = context.createBufferSource();
        const filter = context.createBiquadFilter();
        const envelope = context.createGain();
        noise.buffer = noiseBufferRef.current;
        filter.type = 'highpass';
        filter.frequency.value = kind === 'key' ? 1900 + Math.random() * 900 : 900;
        envelope.gain.setValueAtTime(0.001, now);
        envelope.gain.exponentialRampToValueAtTime(kind === 'key' ? 0.42 : 0.16, now + 0.0015);
        envelope.gain.exponentialRampToValueAtTime(0.001, now + (kind === 'key' ? 0.018 : 0.11));
        noise.connect(filter);
        filter.connect(envelope);
        envelope.connect(master);
        noise.start(now);
        noise.stop(now + (kind === 'key' ? 0.02 : 0.12));

        if (kind === 'key') {
          const bottomOut = context.createOscillator();
          const bottomEnvelope = context.createGain();
          bottomOut.type = 'triangle';
          bottomOut.frequency.value = 520 + Math.random() * 280;
          bottomEnvelope.gain.setValueAtTime(0.001, now);
          bottomEnvelope.gain.exponentialRampToValueAtTime(0.11, now + 0.001);
          bottomEnvelope.gain.exponentialRampToValueAtTime(0.001, now + 0.026);
          bottomOut.connect(bottomEnvelope);
          bottomEnvelope.connect(master);
          bottomOut.start(now);
          bottomOut.stop(now + 0.03);
        }
        return;
      }

      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = kind === 'open' ? 523.25 : kind === 'menu' ? 784 : 392;
      envelope.gain.setValueAtTime(0.001, now);
      envelope.gain.exponentialRampToValueAtTime(kind === 'open' ? 0.2 : 0.09, now + 0.018);
      envelope.gain.exponentialRampToValueAtTime(0.001, now + (kind === 'open' ? 0.42 : 0.15));
      oscillator.connect(envelope);
      envelope.connect(master);
      oscillator.start(now);
      oscillator.stop(now + (kind === 'open' ? 0.45 : 0.18));
    },
    [getAudioContext, preferences.enabled, preferences.keyboardEnabled, preferences.volume]
  );

  const updatePreferences = useCallback((patch: Partial<SoundPreferences>) => {
    setPreferences((current) => ({ ...current, ...patch }));
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      setPersistenceError('');
    } catch (error) {
      console.error('Không lưu được cài đặt âm thanh trên thiết bị này.', error);
      setPersistenceError('Thiết bị chưa lưu được cài đặt âm thanh.');
    }
  }, [preferences]);

  useEffect(
    () => () => {
      if (audioContextRef.current) void audioContextRef.current.close();
    },
    []
  );

  const value = useMemo(
    () => ({ preferences, persistenceError, updatePreferences, primeAudio, playSound }),
    [preferences, persistenceError, updatePreferences, primeAudio, playSound]
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}
