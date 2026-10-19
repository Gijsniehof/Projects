import { cleanTeams, validateTeams, type TeamSetup } from '@/ui/teams';

import type { Scale } from './data/scales.nl';

export type Rng = () => number;
export type Side = 'left' | 'right';

/** Positions on the dial run from 0 (left end) to 100 (right end). */
export const DIAL_MIN = 0;
export const DIAL_MAX = 100;

/**
 * Scoring bands around the hidden target (half-widths on the 0–100 dial):
 * |guess − target| ≤ 2.5 → 4, ≤ 7.5 → 3, ≤ 12.5 → 2, otherwise 0.
 * So the whole target is 25 wide: a 5-wide bullseye with two 5-wide bands on each side.
 */
export const BANDS: { halfWidth: number; points: number }[] = [
  { halfWidth: 2.5, points: 4 },
  { halfWidth: 7.5, points: 3 },
  { halfWidth: 12.5, points: 2 },
];
export const TARGET_HALF_WIDTH = BANDS[BANDS.length - 1].halfWidth;

export function scoreGuess(target: number, guess: number): number {
  const d = Math.abs(guess - target);
  for (const b of BANDS) if (d <= b.halfWidth) return b.points;
  return 0;
}

/** Where the real target lies relative to the dial: the answer to the bonus guess. */
export function sideOf(target: number, guess: number): Side | null {
  if (target < guess) return 'left';
  if (target > guess) return 'right';
  return null;
}

/** Bonus guess: 1 point when right, but not when the active team hit the bullseye. */
export function scoreBonus(target: number, guess: number, bonusGuess: Side | null): number {
  if (!bonusGuess || scoreGuess(target, guess) === 4) return 0;
  return sideOf(target, guess) === bonusGuess ? 1 : 0;
}

/** Random target position, kept away from the very edges so the whole target fits on the dial. */
export function randomTarget(rng: Rng = Math.random): number {
  const lo = DIAL_MIN + 4;
  const hi = DIAL_MAX - 4;
  return Math.round((lo + rng() * (hi - lo)) * 10) / 10;
}

export function clampDial(v: number): number {
  return Math.min(DIAL_MAX, Math.max(DIAL_MIN, v));
}

/** Picks a scale not used recently; resets when all have been used. */
export function pickScale(scales: Scale[], used: readonly string[], rng: Rng = Math.random): { scale: Scale; used: string[] } {
  const key = (s: Scale) => `${s.left}|${s.right}`;
  let usedSet = new Set(used);
  let fresh = scales.filter((s) => !usedSet.has(key(s)));
  if (!fresh.length) {
    usedSet = new Set();
    fresh = scales;
  }
  const scale = fresh[Math.floor(rng() * fresh.length)];
  return { scale, used: [...usedSet, key(scale)] };
}

// ---------------------------------------------------------------------------
// Game state

export interface WaveSettings {
  teams: TeamSetup[];
  /** Points needed to win. */
  target: number;
}

export interface WaveTeam {
  name: string;
  players: string[];
  score: number;
  turnsPlayed: number;
}

export interface WaveTurnResult {
  team: number;
  clueGiver: string | null;
  scale: Scale;
  target: number;
  guess: number;
  points: number;
  bonusTeam: number;
  bonusGuess: Side | null;
  bonusPoints: number;
}

export interface WaveGame {
  teams: WaveTeam[];
  goal: number;
  current: number;
  round: number;
  /** The turn in progress: scale + hidden target. */
  turn: { scale: Scale; target: number } | null;
  lastTurn: WaveTurnResult | null;
  winner: number | null;
  tiebreak: boolean;
}

export function validateWaveSettings(s: WaveSettings): string | null {
  return validateTeams(s.teams);
}

export function newWaveGame(s: WaveSettings): WaveGame {
  return {
    teams: cleanTeams(s.teams).map((t) => ({ ...t, score: 0, turnsPlayed: 0 })),
    goal: s.target,
    current: 0,
    round: 1,
    turn: null,
    lastTurn: null,
    winner: null,
    tiebreak: false,
  };
}

export function clueGiverOf(game: WaveGame): string | null {
  const t = game.teams[game.current];
  return t.players.length ? t.players[t.turnsPlayed % t.players.length] : null;
}

/** The team that makes the left/right bonus guess: the next team in turn order. */
export function bonusTeamOf(game: WaveGame): number {
  return (game.current + 1) % game.teams.length;
}

/**
 * Applies a finished turn. As in 30 Seconds the game only ends after a full round,
 * so every team gets the same number of turns; a tie at the top plays another round.
 */
export function applyWaveTurn(game: WaveGame, guess: number, bonusGuess: Side | null): WaveGame {
  if (!game.turn || game.winner !== null) return game;
  const { scale, target } = game.turn;
  const points = scoreGuess(target, guess);
  const bonusTeam = bonusTeamOf(game);
  const bonusPoints = scoreBonus(target, guess, bonusGuess);
  const clueGiver = clueGiverOf(game);

  const teams = game.teams.map((t, i) => {
    let score = t.score;
    if (i === game.current) score += points;
    if (i === bonusTeam) score += bonusPoints;
    return i === game.current ? { ...t, score, turnsPlayed: t.turnsPlayed + 1 } : { ...t, score };
  });

  const endOfRound = game.current === teams.length - 1;
  let winner: number | null = null;
  let tiebreak = game.tiebreak;
  if (endOfRound) {
    const top = Math.max(...teams.map((t) => t.score));
    if (top >= game.goal) {
      const leaders = teams.flatMap((t, i) => (t.score === top ? [i] : []));
      if (leaders.length === 1) winner = leaders[0];
      else tiebreak = true;
    }
  }

  return {
    ...game,
    teams,
    turn: null,
    lastTurn: { team: game.current, clueGiver, scale, target, guess, points, bonusTeam, bonusGuess, bonusPoints },
    winner,
    tiebreak: winner === null && tiebreak,
    current: endOfRound ? 0 : game.current + 1,
    round: endOfRound ? game.round + 1 : game.round,
  };
}

/** Shown on the scoreboard when someone has reached the goal but the round isn't finished. */
export function waveNotice(game: WaveGame): string | null {
  if (game.winner !== null) return null;
  if (game.tiebreak) return 'Gelijkspel aan kop. Nog een ronde!';
  const reached = game.teams.filter((t) => t.score >= game.goal);
  if (!reached.length) return null;
  return `${reached.map((t) => t.name).join(' en ')} ${reached.length > 1 ? 'hebben' : 'heeft'} ${game.goal} punten. De ronde wordt afgemaakt.`;
}

// ---------------------------------------------------------------------------
// Dial geometry: a half circle, 0 = far left (180°), 100 = far right (0°).

/** Angle in radians (standard math orientation, 0 = right, π = left) for a dial value. */
export function valueToAngle(v: number): number {
  return Math.PI * (1 - clampDial(v) / DIAL_MAX);
}

/** Dial value for a touch point relative to the dial's centre (y grows downwards, as on screen). */
export function pointToValue(dx: number, dy: number): number {
  // Below the centre line counts as the nearest end.
  const angle = Math.atan2(-dy, dx); // −π..π, 0 = right, π/2 = up
  const a = angle < -Math.PI / 2 ? Math.PI : angle < 0 ? 0 : angle;
  return clampDial(DIAL_MAX * (1 - a / Math.PI));
}
