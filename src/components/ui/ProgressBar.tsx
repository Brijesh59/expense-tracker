import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
  interpolateColor,
  useDerivedValue,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

interface ProgressBarProps {
  ratio: number;
  delay?: number;
  height?: number;
  style?: ViewStyle;
  trackColor?: string;
}

export function ProgressBar({ ratio, delay = 0, height = 6, style, trackColor }: ProgressBarProps) {
  const { colors } = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(Math.min(ratio, 1), { duration: 600, easing: Easing.out(Easing.cubic) }));
  }, [ratio, delay]);

  const green = colors.green;
  const primary = colors.primary;
  const red = colors.red;

  const fillColor = useDerivedValue(() =>
    interpolateColor(
      progress.value,
      [0, 0.7, 0.85, 1],
      [green, green, primary, red]
    )
  );

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
    backgroundColor: fillColor.value,
  }));

  return (
    <View
      style={[
        {
          height,
          borderRadius: 999,
          backgroundColor: trackColor ?? colors.border,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          { height: '100%', borderRadius: 999 },
          barStyle,
        ]}
      />
    </View>
  );
}
