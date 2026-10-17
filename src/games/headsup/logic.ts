import type { HeadsUpPool } from './data';

export type Rng = () => number;

function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Builds a shuffled deck from the selected pools: duplicates across pools removed
 * (case-insensitive), recently used words skipped. When too few fresh words remain,
 * the used list is cleared so play can go on.
 */
export function buildDeck(
  pools: HeadsUpPool[],
  selected: string[],
  used: readonly string[],
  rng: Rng = Math.random,
  minSize = 40,
): { deck: string[]; resetUsed: boolean } {
  const active = pools.filter((p) => selected.includes(p.id));
  const seen = new Set<string>();
  const all: string[] = [];
  for (const p of active.length ? active : pools) {
    for (const t of p.terms) {
      const k = t.toLowerCase();
      if (!seen.has(k)) {
        seen.add(k);
        all.push(t);
      }
    }
  }
  const usedSet = new Set(used.map((u) => u.toLowerCase()));
  const fresh = all.filter((t) => !usedSet.has(t.toLowerCase()));
  if (fresh.length >= Math.min(minSize, all.length)) return { deck: shuffle(fresh, rng), resetUsed: false };
  return { deck: shuffle(all, rng), resetUsed: true };
}

// ---------------------------------------------------------------------------
// Tilt detection.
//
// Android accelerometer values (expo-sensors, in g) for a phone held in landscape
// against the forehead, screen facing the group:
//   neutral (upright)        → |x| ≈ 1, z ≈ 0
//   tilt forward / down      → screen faces the floor   → z → −1   = GOED (guessed)
//   tilt backward / up       → screen faces the ceiling → z → +1   = PAS
// After each answer the phone must come back to neutral before the next one counts.

export type TiltAnswer = 'correct' | 'pass';

export interface TiltOptions {
  /** |z| above this counts as a tilt. */
  trigger: number;
  /** |z| below this counts as upright again. */
  neutral: number;
  /** How long (ms) the phone must be upright before a new tilt counts. */
  settleMs: number;
  /** Low-pass smoothing factor, 0..1 (higher = follows the sensor faster). */
  smoothing: number;
}

export const DEFAULT_TILT: TiltOptions = { trigger: 0.62, neutral: 0.35, settleMs: 180, smoothing: 0.5 };

export interface Sample {
  x: number;
  y: number;
  z: number;
  /** Timestamp in ms. */
  t: number;
}

export function createTiltDetector(options: Partial<TiltOptions> = {}) {
  const o = { ...DEFAULT_TILT, ...options };
  let z: number | null = null;
  let armed = false;
  let neutralSince: number | null = null;

  return {
    /** Feed one accelerometer sample; returns an answer when a tilt is detected. */
    update(s: Sample): TiltAnswer | null {
      z = z === null ? s.z : z + o.smoothing * (s.z - z);
      if (Math.abs(z) < o.neutral) {
        neutralSince ??= s.t;
        if (s.t - neutralSince >= o.settleMs) armed = true;
        return null;
      }
      neutralSince = null;
      if (!armed || Math.abs(z) < o.trigger) return null;
      armed = false;
      return z < 0 ? 'correct' : 'pass';
    },
    /** Require the phone to be upright again before the next answer (e.g. after a tap). */
    disarm() {
      armed = false;
      neutralSince = null;
    },
    get armed() {
      return armed;
    },
  };
}

/** Whether the phone is held sideways (landscape) and roughly upright, i.e. on a forehead. */
export function isOnForehead(s: Pick<Sample, 'x' | 'z'>): boolean {
  return Math.abs(s.x) > 0.75 && Math.abs(s.z) < 0.45;
}

/**
 * How to rotate the (portrait-locked) screen content so it reads upright for the group.
 * Left edge down (x > 0) → rotate 90° clockwise; right edge down (x < 0) → 90° counter-clockwise.
 */
export function rotationFor(x: number, previous: 90 | -90): 90 | -90 {
  if (x > 0.35) return 90;
  if (x < -0.35) return -90;
  return previous;
}

export interface HeadsUpResult {
  words: { word: string; answer: TiltAnswer }[];
  seconds: number;
}

export const scoreOf = (r: HeadsUpResult) => r.words.filter((w) => w.answer === 'correct').length;
