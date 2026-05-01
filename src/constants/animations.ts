import type { WithSpringConfig } from 'react-native-reanimated';

export const springs: Record<string, WithSpringConfig> = {
  snappy: { damping: 20, stiffness: 400 },
  bouncy: { damping: 14, stiffness: 300 },
  smooth: { damping: 28, stiffness: 200 },
  slow: { damping: 35, stiffness: 150 },
};

export const durations = {
  micro: 200,
  normal: 350,
  page: 500,
  celebration: 800,
} as const;

export const stagger = 30; // ms per list item
