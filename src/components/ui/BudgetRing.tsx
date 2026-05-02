import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
  useDerivedValue,
  useAnimatedProps,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { H1, Caption } from './Typography';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface BudgetRingProps {
  ratio: number;
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  subLabel?: string;
}

export function BudgetRing({
  ratio,
  size = 200,
  strokeWidth = 16,
  centerLabel,
  subLabel,
}: BudgetRingProps) {
  const { colors } = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(300, withTiming(Math.min(ratio, 1), { duration: 700, easing: Easing.out(Easing.cubic) }));
  }, [ratio]);

  const strokeDashoffset = useDerivedValue(
    () => circumference * (1 - progress.value)
  );

  const green = colors.green;
  const primary = colors.primary;
  const red = colors.red;

  const strokeColor = useDerivedValue(() =>
    interpolateColor(
      progress.value,
      [0, 0.7, 0.85, 1],
      [green, green, primary, red]
    )
  );

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeDashoffset.value,
    stroke: strokeColor.value,
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
          animatedProps={animatedProps}
        />
      </Svg>
      <View style={{ alignItems: 'center' }}>
        {centerLabel && (
          <H1 style={{ fontSize: 36, letterSpacing: -2, fontVariant: ['tabular-nums'] }}>
            {centerLabel}
          </H1>
        )}
        {subLabel && (
          <Caption style={{ marginTop: 2, textAlign: 'center' }}>
            {subLabel}
          </Caption>
        )}
      </View>
    </View>
  );
}
