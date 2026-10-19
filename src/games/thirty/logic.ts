import { cleanTeams as cleanTeamList, validateTeams } from '@/ui/teams';
import type { Game, PoolId, TermPool, ThirtySettings } from './types';

export type Rng = () => number;

export const CARD_SIZE = 5;
export const MIN_TEAMS = 2;
export const MAX_TEAMS = 6;

const randomInt = (max: number, rng: Rng) => Math.floor(rng() * max);

function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(i + 1, rng);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Draws a card of 5 terms, mixing the selected pools like the original game:
 * the pools are shuffled and the 5 slots cycle through them, so with 3 pools a
 * card has a 2/2/1 split. Terms in `used` are skipped; when a pool runs dry its
 * terms are released from `used` again.
 *
 * Returns the card and the updated `used` list.
 */
export function drawCard(
  pools: TermPool[],
  selected: PoolId[],
  used: readonly string[],
  rng: Rng = Math.random,
): { card: string[]; used: string[] } {
  const active = pools.filter((p) => selected.includes(p.id));
  const source = active.length ? active : pools;
  let usedSet = new Set(used);
  const card: string[] = [];
  const order = shuffle(source, rng);

  for (let slot = 0; slot < CARD_SIZE; slot++) {
    const pool = order[slot % order.length];
    let available = pool.terms.filter((t) => !usedSet.has(t) && !card.includes(t));
    if (!available.length) {
      // Pool exhausted: release its terms (except those already on this card).
      const poolTerms = new Set(pool.terms);
      usedSet = new Set([...usedSet].filter((t) => !poolTerms.has(t)));
      available = pool.terms.filter((t) => !card.includes(t));
    }
    if (!available.length) continue; // pool smaller than a card; skip slot
    const term = available[randomInt(available.length, rng)];
    card.push(term);
    usedSet.add(term);
  }
  return { card: shuffle(card, rng), used: [...usedSet] };
}

export function cleanTeams(settings: ThirtySettings) {
  return cleanTeamList(settings.teams);
}

/** Returns an error message (Dutch, shown in the UI) or null when the setup is valid. */
export function validateSettings(settings: ThirtySettings): string | null {
  const teamError = validateTeams(settings.teams);
  if (teamError) return teamError;
  if (!settings.pools.length) return 'Kies minimaal één soort begrippen';
  return null;
}

export function newGame(settings: ThirtySettings): Game {
  return {
    teams: cleanTeams(settings).map((t) => ({ ...t, score: 0, turnsPlayed: 0 })),
    target: settings.target,
    seconds: settings.seconds,
    pools: [...settings.pools],
    current: 0,
    round: 1,
    card: null,
    lastTurn: null,
    winner: null,
    tiebreak: false,
  };
}

/** Who describes for the current team, or null when the team has no player names. */
export function currentDescriber(game: Game): string | null {
  const team = game.teams[game.current];
  if (!team.players.length) return null;
  return team.players[team.turnsPlayed % team.players.length];
}

/**
 * Applies the result of a turn. The game only ends at the end of a full round,
 * so every team gets the same number of turns. If the leaders are tied at or
 * above the target, play continues round by round until one team leads.
 */
export function applyTurn(game: Game, guessed: boolean[]): Game {
  if (!game.card || game.winner !== null) return game;
  const points = guessed.filter(Boolean).length;
  const describer = currentDescriber(game);
  const teams = game.teams.map((t, i) =>
    i === game.current ? { ...t, score: t.score + points, turnsPlayed: t.turnsPlayed + 1 } : t,
  );

  const endOfRound = game.current === teams.length - 1;
  let winner: number | null = null;
  let tiebreak = false;
  if (endOfRound) {
    const top = Math.max(...teams.map((t) => t.score));
    if (top >= game.target) {
      const leaders = teams.map((t, i) => (t.score === top ? i : -1)).filter((i) => i >= 0);
      if (leaders.length === 1) winner = leaders[0];
      else tiebreak = true;
    }
  }

  return {
    ...game,
    teams,
    card: null,
    lastTurn: { team: game.current, describer, terms: game.card, guessed, points },
    winner,
    tiebreak: winner === null && (tiebreak || game.tiebreak),
    current: endOfRound ? 0 : game.current + 1,
    round: endOfRound ? game.round + 1 : game.round,
  };
}

/** Teams that have reached the target but must finish the round. */
export function finalRoundNotice(game: Game): string | null {
  if (game.winner !== null) return null;
  if (game.tiebreak) return 'Gelijkspel aan kop. Nog een ronde!';
  const reached = game.teams.filter((t) => t.score >= game.target);
  if (!reached.length) return null;
  return `${reached.map((t) => t.name).join(' en ')} ${reached.length > 1 ? 'hebben' : 'heeft'} ${game.target} punten. De ronde wordt afgemaakt.`;
}

// ---------------------------------------------------------------------------
// Evening statistics: points per describer across all games of one evening.

export interface DescriberStat {
  name: string;
  points: number;
  turns: number;
}

export interface EveningStats {
  /** Last time a turn was recorded (ms). */
  lastAt: number;
  /** Keyed by lower-cased name so "gijs" and "Gijs" count as one person. */
  describers: Record<string, DescriberStat>;
}

/** A pause longer than this starts a new evening. */
export const EVENING_GAP_MS = 8 * 60 * 60 * 1000;

export const emptyStats = (): EveningStats => ({ lastAt: 0, describers: {} });

/** Returns the stats to use now: the stored ones, or a fresh evening after a long pause. */
export function currentEvening(stats: EveningStats, now: number): EveningStats {
  return stats.lastAt && now - stats.lastAt > EVENING_GAP_MS ? emptyStats() : stats;
}

export function recordDescriberTurn(stats: EveningStats, describer: string | null, points: number, now: number): EveningStats {
  if (!describer) return stats;
  const base = currentEvening(stats, now);
  const key = describer.trim().toLowerCase();
  const prev = base.describers[key] ?? { name: describer.trim(), points: 0, turns: 0 };
  return {
    lastAt: now,
    describers: { ...base.describers, [key]: { name: describer.trim(), points: prev.points + points, turns: prev.turns + 1 } },
  };
}

/** Best explainer first: highest average per turn, then most points, then most turns. */
export function rankDescribers(stats: EveningStats): (DescriberStat & { average: number })[] {
  return Object.values(stats.describers)
    .filter((d) => d.turns > 0)
    .map((d) => ({ ...d, average: d.points / d.turns }))
    .sort((a, b) => b.average - a.average || b.points - a.points || b.turns - a.turns || a.name.localeCompare(b.name));
}
