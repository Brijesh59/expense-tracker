import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  interpolateColor,
  useDerivedValue,
} from 'react-native-reanimated';
import { springs } from '@/constants/animations';
import { Colors } from '@/constants/theme';

interface ProgressBarProps {
  ratio: number;
  delay?: number;
  height?: number;
  style?: ViewStyle;
  trackColor?: string;
}

export function ProgressBar({ ratio, delay = 0, height = 6, style, trackColor }: ProgressBarProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withSpring(Math.min(ratio, 1), springs.smooth));
  }, [ratio, delay]);

  const fillColor = useDerivedValue(() =>
    interpolateColor(
      progress.value,
      [0, 0.7, 0.85, 1],
      [Colors.green, Colors.green, Colors.yellow, Colors.red]
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
          backgroundColor: trackColor ?? Colors.border,
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
