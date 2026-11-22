import { createContext, useContext } from 'react';

export type SoundPreferences = { enabled: boolean; keyboardEnabled: boolean; volume: number };
export type SoundKind = 'open' | 'menu' | 'letter' | 'key';
type SoundContextValue = {
  preferences: SoundPreferences;
  persistenceError: string;
  updatePreferences: (patch: Partial<SoundPreferences>) => void;
  primeAudio: () => void;
  playSound: (kind: SoundKind) => void;
};

export const DEFAULT_PREFERENCES: SoundPreferences = { enabled: true, keyboardEnabled: true, volume: 0.2 };
export const SoundContext = createContext<SoundContextValue | null>(null);

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) throw new Error('useSound phải được dùng bên trong SoundProvider.');
  return context;
}
