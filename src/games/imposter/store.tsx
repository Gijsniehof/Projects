import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { CATEGORIES_NL } from './data/words.nl';
import { createRound, wordKey } from './logic';
import type { Category, ImposterSettings, Round } from './types';

const STORAGE_KEY = 'imposter/v1';
/** How many recent words to remember so they don't come back too soon. */
const RECENT_LIMIT = 60;

export const DEFAULT_SETTINGS: ImposterSettings = {
  mode: 'hint',
  imposterCount: 1,
  categoryIds: CATEGORIES_NL.map((c) => c.id),
  showCategory: false,
  timerSeconds: 180,
};

interface Persisted {
  players: string[];
  settings: ImposterSettings;
  recent: string[];
}

interface ImposterStore {
  ready: boolean;
  categories: Category[];
  players: string[];
  settings: ImposterSettings;
  round: Round | null;
  setPlayers: (players: string[]) => void;
  updateSettings: (patch: Partial<ImposterSettings>) => void;
  /** Starts a new round with the current players/settings. Returns false if not possible. */
  startRound: () => boolean;
}

const Ctx = createContext<ImposterStore | null>(null);

export function ImposterProvider({ children }: { children: ReactNode }) {
  const categories = CATEGORIES_NL;
  const [ready, setReady] = useState(false);
  const [players, setPlayersState] = useState<string[]>(['', '', '']);
  const [settings, setSettings] = useState<ImposterSettings>(DEFAULT_SETTINGS);
  const [round, setRound] = useState<Round | null>(null);
  const recent = useRef<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as Partial<Persisted>;
          if (saved.players?.length) setPlayersState(saved.players);
          if (saved.settings) {
            const validIds = new Set(categories.map((c) => c.id));
            const ids = (saved.settings.categoryIds ?? []).filter((id) => validIds.has(id));
            setSettings({ ...DEFAULT_SETTINGS, ...saved.settings, categoryIds: ids.length ? ids : DEFAULT_SETTINGS.categoryIds });
          }
          recent.current = saved.recent ?? [];
        }
      } catch {
        // Corrupt or unavailable storage: start with defaults.
      } finally {
        setReady(true);
      }
    })();
  }, [categories]);

  useEffect(() => {
    if (!ready) return;
    const data: Persisted = { players, settings, recent: recent.current };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [ready, players, settings, round]);

  const setPlayers = useCallback((next: string[]) => {
    // Don't clamp imposterCount here: while someone retypes a name the player
    // count dips briefly and the chosen count would be lost. The setup screen
    // and createRound clamp it at use time instead.
    setPlayersState(next);
  }, []);

  const updateSettings = useCallback((patch: Partial<ImposterSettings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  const startRound = useCallback(() => {
    const named = players.map((p) => p.trim()).filter(Boolean);
    try {
      const next = createRound(named, settings, categories, new Set(recent.current));
      recent.current = [wordKey(next.categoryId, next.secretWord), ...recent.current].slice(0, RECENT_LIMIT);
      setRound(next);
      return true;
    } catch {
      return false;
    }
  }, [players, settings, categories]);

  const value = useMemo<ImposterStore>(
    () => ({ ready, categories, players, settings, round, setPlayers, updateSettings, startRound }),
    [ready, categories, players, settings, round, setPlayers, updateSettings, startRound],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useImposter(): ImposterStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useImposter must be used inside <ImposterProvider>');
  return ctx;
}
