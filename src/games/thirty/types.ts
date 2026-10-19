import type { TeamSetup } from '@/ui/teams';

export type PoolId = 'algemeen' | 'personen' | 'nederland';

export interface TermPool {
  id: PoolId;
  name: string;
  terms: string[];
}

export type { TeamSetup };

export interface ThirtySettings {
  teams: TeamSetup[];
  /** Points needed to win. */
  target: number;
  /** Seconds per turn. */
  seconds: number;
  pools: PoolId[];
}

export interface GameTeam {
  name: string;
  players: string[];
  score: number;
  turnsPlayed: number;
}

export interface TurnRecord {
  team: number;
  describer: string | null;
  terms: string[];
  guessed: boolean[];
  points: number;
}

export interface Game {
  teams: GameTeam[];
  target: number;
  seconds: number;
  pools: PoolId[];
  /** Index of the team whose turn it is. */
  current: number;
  /** 1-based round number; a round = every team has had one turn. */
  round: number;
  /** The 5 terms of the turn in progress; null between turns. */
  card: string[] | null;
  lastTurn: TurnRecord | null;
  /** Set when the game is over. */
  winner: number | null;
  /** True when the target was reached but the top teams are tied. */
  tiebreak: boolean;
}
