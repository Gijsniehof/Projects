import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { HEADSUP_POOLS, type HeadsUpPool } from './data';
import { buildDeck, type HeadsUpResult } from './logic';

const STORAGE_KEY = 'headsup/v1';
const USED_LIMIT = 400;

export interface HeadsUpSettings {
  pools: string[];
  seconds: number;
  /** false = tap mode (left half pass, right half correct). */
  tilt: boolean;
}

export const DEFAULT_HEADSUP_SETTINGS: HeadsUpSettings = {
  pools: ['algemeen', 'personen', 'nederland'],
  seconds: 60,
  tilt: true,
};

interface Persisted {
  settings: HeadsUpSettings;
  used: string[];
}

interface HeadsUpStore {
  ready: boolean;
  pools: HeadsUpPool[];
  settings: HeadsUpSettings;
  updateSettings: (patch: Partial<HeadsUpSettings>) => void;
  /** Deck for the round in progress. */
  deck: string[];
  startRound: () => void;
  result: HeadsUpResult | null;
  finishRound: (result: HeadsUpResult) => void;
}

const Ctx = createContext<HeadsUpStore | null>(null);

export function HeadsUpProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<HeadsUpSettings>(DEFAULT_HEADSUP_SETTINGS);
  const [used, setUsed] = useState<string[]>([]);
  const [deck, setDeck] = useState<string[]>([]);
  const [result, setResult] = useState<HeadsUpResult | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as Partial<Persisted>;
          if (saved.settings) {
            const valid = new Set(HEADSUP_POOLS.map((p) => p.id));
            const pools = (saved.settings.pools ?? []).filter((p) => valid.has(p));
            setSettings({ ...DEFAULT_HEADSUP_SETTINGS, ...saved.settings, pools: pools.length ? pools : DEFAULT_HEADSUP_SETTINGS.pools });
          }
          if (saved.used) setUsed(saved.used);
        }
      } catch {
        // Unreadable storage: defaults.
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const data: Persisted = { settings, used };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [ready, settings, used]);

  const updateSettings = useCallback((patch: Partial<HeadsUpSettings>) => setSettings((s) => ({ ...s, ...patch })), []);

  const startRound = useCallback(() => {
    const { deck: d, resetUsed } = buildDeck(HEADSUP_POOLS, settings.pools, used);
    if (resetUsed) setUsed([]);
    setDeck(d);
    setResult(null);
  }, [settings.pools, used]);

  const finishRound = useCallback((r: HeadsUpResult) => {
    setResult(r);
    setUsed((u) => [...r.words.map((w) => w.word), ...u].slice(0, USED_LIMIT));
  }, []);

  const value = useMemo<HeadsUpStore>(
    () => ({ ready, pools: HEADSUP_POOLS, settings, updateSettings, deck, startRound, result, finishRound }),
    [ready, settings, updateSettings, deck, startRound, result, finishRound],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useHeadsUp(): HeadsUpStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useHeadsUp must be used inside <HeadsUpProvider>');
  return ctx;
}
