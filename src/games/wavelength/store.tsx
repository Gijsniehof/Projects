import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { SCALES_NL } from './data/scales.nl';
import { applyWaveTurn, newWaveGame, pickScale, randomTarget, validateWaveSettings, type Side, type WaveGame, type WaveSettings } from './logic';

const STORAGE_KEY = 'wavelength/v1';

export const DEFAULT_WAVE_SETTINGS: WaveSettings = {
  teams: [
    { name: 'Team 1', players: ['', ''] },
    { name: 'Team 2', players: ['', ''] },
  ],
  target: 10,
};

interface Persisted {
  settings: WaveSettings;
  game: WaveGame | null;
  used: string[];
}

interface WaveStore {
  ready: boolean;
  settings: WaveSettings;
  game: WaveGame | null;
  updateSettings: (patch: Partial<WaveSettings>) => void;
  startGame: () => boolean;
  /** Draws a scale and hides a target for the current turn (no-op if one is in progress). */
  startTurn: () => void;
  /** Swaps the scale of the current turn for another one (target stays). */
  newScale: () => void;
  submitTurn: (guess: number, bonusGuess: Side | null) => void;
  endGame: () => void;
}

const Ctx = createContext<WaveStore | null>(null);

export function WaveProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<WaveSettings>(DEFAULT_WAVE_SETTINGS);
  const [game, setGame] = useState<WaveGame | null>(null);
  const [used, setUsed] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as Partial<Persisted>;
          if (saved.settings) setSettings({ ...DEFAULT_WAVE_SETTINGS, ...saved.settings });
          if (saved.game) setGame(saved.game);
          if (saved.used) setUsed(saved.used);
        }
      } catch {
        // Unreadable storage: start fresh.
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const data: Persisted = { settings, game, used };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [ready, settings, game, used]);

  const updateSettings = useCallback((patch: Partial<WaveSettings>) => setSettings((s) => ({ ...s, ...patch })), []);

  const startGame = useCallback(() => {
    if (validateWaveSettings(settings)) return false;
    setGame(newWaveGame(settings));
    return true;
  }, [settings]);

  const startTurn = useCallback(() => {
    if (!game || game.turn || game.winner !== null) return;
    const picked = pickScale(SCALES_NL, used);
    setUsed(picked.used);
    setGame({ ...game, turn: { scale: picked.scale, target: randomTarget() } });
  }, [game, used]);

  const newScale = useCallback(() => {
    if (!game?.turn) return;
    const picked = pickScale(SCALES_NL, used);
    setUsed(picked.used);
    setGame({ ...game, turn: { ...game.turn, scale: picked.scale } });
  }, [game, used]);

  const submitTurn = useCallback((guess: number, bonusGuess: Side | null) => {
    setGame((g) => (g ? applyWaveTurn(g, guess, bonusGuess) : g));
  }, []);

  const endGame = useCallback(() => setGame(null), []);

  const value = useMemo<WaveStore>(
    () => ({ ready, settings, game, updateSettings, startGame, startTurn, newScale, submitTurn, endGame }),
    [ready, settings, game, updateSettings, startGame, startTurn, newScale, submitTurn, endGame],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWave(): WaveStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useWave must be used inside <WaveProvider>');
  return ctx;
}
