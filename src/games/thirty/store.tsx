import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { TERM_POOLS } from './data/terms.nl';
import { applyTurn, drawCard, newGame, validateSettings } from './logic';
import type { Game, ThirtySettings } from './types';

const STORAGE_KEY = 'thirty/v1';

export const DEFAULT_THIRTY_SETTINGS: ThirtySettings = {
  teams: [
    { name: 'Team 1', players: ['', ''] },
    { name: 'Team 2', players: ['', ''] },
  ],
  target: 30,
  seconds: 30,
  pools: ['algemeen', 'personen', 'nederland'],
};

interface Persisted {
  settings: ThirtySettings;
  game: Game | null;
  used: string[];
}

interface ThirtyStore {
  ready: boolean;
  settings: ThirtySettings;
  game: Game | null;
  updateSettings: (patch: Partial<ThirtySettings>) => void;
  /** Starts a fresh game from the settings. Returns false if the settings are invalid. */
  startGame: () => boolean;
  /** Draws the card for the current turn (no-op if one is already drawn). */
  startTurn: () => void;
  submitTurn: (guessed: boolean[]) => void;
  endGame: () => void;
}

const Ctx = createContext<ThirtyStore | null>(null);

export function ThirtyProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<ThirtySettings>(DEFAULT_THIRTY_SETTINGS);
  const [game, setGame] = useState<Game | null>(null);
  const [used, setUsed] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as Partial<Persisted>;
          if (saved.settings) setSettings({ ...DEFAULT_THIRTY_SETTINGS, ...saved.settings });
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

  // Persist everything, including a game in progress, so a closed app can resume.
  useEffect(() => {
    if (!ready) return;
    const data: Persisted = { settings, game, used };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [ready, settings, game, used]);

  const updateSettings = useCallback((patch: Partial<ThirtySettings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  const startGame = useCallback(() => {
    if (validateSettings(settings)) return false;
    setGame(newGame(settings));
    return true;
  }, [settings]);

  const startTurn = useCallback(() => {
    if (!game || game.card || game.winner !== null) return;
    const drawn = drawCard(TERM_POOLS, game.pools, used);
    setUsed(drawn.used);
    setGame({ ...game, card: drawn.card });
  }, [game, used]);

  const submitTurn = useCallback((guessed: boolean[]) => {
    setGame((g) => (g ? applyTurn(g, guessed) : g));
  }, []);

  const endGame = useCallback(() => setGame(null), []);

  const value = useMemo<ThirtyStore>(
    () => ({ ready, settings, game, updateSettings, startGame, startTurn, submitTurn, endGame }),
    [ready, settings, game, updateSettings, startGame, startTurn, submitTurn, endGame],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useThirty(): ThirtyStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useThirty must be used inside <ThirtyProvider>');
  return ctx;
}
