type SoundPreferences = {
  enabled: boolean;
  keyboardEnabled: boolean;
  volume: number;
};

const STORAGE_KEY = 'my-love-sound-preferences';
const defaults: SoundPreferences = { enabled: true, keyboardEnabled: true, volume: 0.35 };
let context: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;

export function readSoundPreferences(): SoundPreferences {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaults;
    const value = JSON.parse(saved) as Partial<SoundPreferences>;
    return {
      enabled: typeof value.enabled === 'boolean' ? value.enabled : defaults.enabled,
      keyboardEnabled: typeof value.keyboardEnabled === 'boolean' ? value.keyboardEnabled : defaults.keyboardEnabled,
      volume: typeof value.volume === 'number' ? Math.max(0, Math.min(1, value.volume)) : defaults.volume,
    };
  } catch {
    return defaults;
  }
}

export function saveSoundPreferences(preferences: SoundPreferences) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Storage can be unavailable in private browsing; sound still works for this visit.
  }
}

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextConstructor) return null;
  context ??= new AudioContextConstructor();
  if (!noiseBuffer) {
    noiseBuffer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.05), context.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
  }
  return context;
}

export function unlockSound() {
  const audio = getAudioContext();
  if (audio?.state === 'suspended') void audio.resume();
}

function playClick(kind: 'key' | 'soft' | 'open') {
  const preferences = readSoundPreferences();
  if (!preferences.enabled || (kind === 'key' && !preferences.keyboardEnabled)) return;
  const audio = getAudioContext();
  if (!audio) return;
  if (audio.state === 'suspended') {
    void audio.resume().then(() => playClick(kind));
    return;
  }
  const now = audio.currentTime;
  const master = audio.createGain();
  master.gain.value = preferences.volume * (kind === 'key' ? 0.24 : 0.4);
  master.connect(audio.destination);

  const noise = audio.createBufferSource();
  const filter = audio.createBiquadFilter();
  const envelope = audio.createGain();
  noise.buffer = noiseBuffer;
  filter.type = kind === 'key' ? 'highpass' : 'lowpass';
  filter.frequency.value = kind === 'key' ? 1700 + Math.random() * 900 : 900;
  envelope.gain.setValueAtTime(kind === 'key' ? 0.65 : 0.5, now);
  envelope.gain.exponentialRampToValueAtTime(0.001, now + (kind === 'key' ? 0.025 : 0.09));
  noise.connect(filter);
  filter.connect(envelope);
  envelope.connect(master);
  noise.start(now);
  noise.stop(now + 0.1);

  if (kind === 'key') {
    const body = audio.createOscillator();
    const bodyGain = audio.createGain();
    body.type = 'triangle';
    body.frequency.value = 105 + Math.random() * 70;
    bodyGain.gain.setValueAtTime(0.16, now + 0.012);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
    body.connect(bodyGain);
    bodyGain.connect(master);
    body.start(now + 0.012);
    body.stop(now + 0.06);
  }
  window.setTimeout(() => master.disconnect(), 180);
}

export const playMechanicalKey = () => playClick('key');
export const playMenuSound = () => playClick('soft');
export const playLetterSound = () => playClick('open');
export const playOpeningSound = () => playClick('open');
