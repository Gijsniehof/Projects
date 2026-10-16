/** Shared design tokens for every game in the app. Clean, light, minimal. */
export const colors = {
  bg: '#F7F7F5',
  surface: '#FFFFFF',
  text: '#18181B',
  muted: '#71717A',
  border: '#E4E4E0',
  accent: '#18181B',
  accentText: '#FFFFFF',
  imposter: '#D1343A',
  imposterSoft: '#FCEBEC',
  soft: '#EFEFEC',
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 8, md: 12, lg: 20, pill: 999 } as const;

export const type = {
  display: { fontSize: 40, fontWeight: '700' as const, letterSpacing: -0.8, color: colors.text },
  title: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.4, color: colors.text },
  heading: { fontSize: 17, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 16, color: colors.text, lineHeight: 22 },
  small: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  label: { fontSize: 12, fontWeight: '600' as const, color: colors.muted, letterSpacing: 0.8, textTransform: 'uppercase' as const },
};

/** Distinct, muted colors to tell teams apart (used as small dots and bars). */
export const teamColors = ['#2563EB', '#DB2777', '#059669', '#D97706', '#7C3AED', '#0891B2'] as const;
export const teamColor = (i: number) => teamColors[i % teamColors.length];
