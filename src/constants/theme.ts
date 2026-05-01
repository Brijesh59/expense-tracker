export const Colors = {
  primary: '#7C6AF7',
  accent: '#F59E6B',
  background: '#0F0F14',
  surface: '#1A1A24',
  surface2: '#242433',
  border: '#2E2E42',
  textPrimary: '#F0F0F8',
  textSecondary: '#8888A8',
  textMuted: '#55556A',
  green: '#4ECDC4',
  yellow: '#F7DC6F',
  red: '#FF6B6B',
} as const;

export const Fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export type ColorKey = keyof typeof Colors;
