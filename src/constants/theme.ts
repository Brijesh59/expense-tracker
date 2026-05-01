export const Colors = {
  primary: '#F8E71C',                    // CRED signature yellow
  primaryShadow: '#C4B800',             // neoPOP hard shadow for yellow buttons
  accent: '#F8E71C',
  background: '#0D0D0D',                // Near-pure black
  surface: '#1A1A1A',                   // Card surfaces
  surface2: '#242424',                  // Inputs, elevated surfaces
  border: 'rgba(255,255,255,0.1)',      // Subtle white rim
  textPrimary: '#FFFFFF',
  textSecondary: '#999999',
  textMuted: '#555555',
  green: '#00C853',                     // CRED green
  yellow: '#F8E71C',
  red: '#FF4444',
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
  none: 0,    // neoPOP buttons — square corners
  sm: 4,      // inputs
  md: 8,      // cards
  lg: 12,     // sheets, modals
  xl: 20,
  full: 9999, // chips, pills
} as const;

export type ColorKey = keyof typeof Colors;
