export type ThemeColors = {
  primary: string;
  primaryShadow: string;
  accent: string;
  onPrimary: string;
  background: string;
  surface: string;
  surface2: string;
  input: string;
  inputBorder: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  green: string;
  yellow: string;
  red: string;
};

export const darkColors: ThemeColors = {
  primary: '#F8E71C',
  primaryShadow: '#C4B800',
  accent: '#F8E71C',
  onPrimary: '#0D0D0D',
  background: '#0D0D0D',
  surface: '#1A1A1A',
  surface2: '#242424',
  input: '#242424',
  inputBorder: 'rgba(255,255,255,0.1)',
  border: 'rgba(255,255,255,0.1)',
  textPrimary: '#FFFFFF',
  textSecondary: '#999999',
  textMuted: '#555555',
  green: '#00C853',
  yellow: '#F8E71C',
  red: '#FF4444',
};

export const lightColors: ThemeColors = {
  primary: '#D7B80F',
  primaryShadow: '#A58900',
  accent: '#D7B80F',
  onPrimary: '#212121',
  background: '#F4F7FA',
  surface: '#FEFCF7',
  surface2: '#EEF2F5',
  input: '#F7F9FB',
  inputBorder: 'rgba(33,33,33,0.08)',
  border: 'rgba(33,33,33,0.1)',
  textPrimary: '#212121',
  textSecondary: '#4F5B62',
  textMuted: '#7A8288',
  green: '#2E9D63',
  yellow: '#B99A00',
  red: '#D6453D',
};

export const Colors = darkColors;

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
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 20,
  full: 9999,
} as const;

export type ColorKey = keyof ThemeColors;
