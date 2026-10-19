/** Team setup shared by the team games (pure logic, no UI). */
export interface TeamSetup {
  name: string;
  /** Optional. When filled, the active player rotates through these. */
  players: string[];
}

export const MIN_TEAMS = 2;
export const MAX_TEAMS = 6;

export function cleanTeams(teams: TeamSetup[]): TeamSetup[] {
  return teams.map((t) => ({ name: t.name.trim(), players: t.players.map((p) => p.trim()).filter(Boolean) }));
}

/** Returns an error message (Dutch, shown in the UI) or null when the teams are valid. */
export function validateTeams(input: TeamSetup[]): string | null {
  const teams = cleanTeams(input);
  if (teams.length < MIN_TEAMS) return `Minimaal ${MIN_TEAMS} teams nodig`;
  if (teams.some((t) => !t.name)) return 'Elk team heeft een naam nodig';
  const names = teams.map((t) => t.name.toLowerCase());
  if (new Set(names).size !== names.length) return 'Teamnamen moeten verschillend zijn';
  for (const t of teams) {
    const lower = t.players.map((p) => p.toLowerCase());
    if (new Set(lower).size !== lower.length) return `Dubbele spelersnaam in ${t.name}`;
  }
  return null;
}
