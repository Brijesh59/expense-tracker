import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  withDelay,
  withSpring,
  useDerivedValue,
  useAnimatedProps,
  interpolateColor,
} from 'react-native-reanimated';
import { springs } from '@/constants/animations';
import { Colors } from '@/constants/theme';
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
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(300, withSpring(Math.min(ratio, 1), springs.slow));
  }, [ratio]);

  const strokeDashoffset = useDerivedValue(
    () => circumference * (1 - progress.value)
  );

  const strokeColor = useDerivedValue(() =>
    interpolateColor(
      progress.value,
      [0, 0.7, 0.85, 1],
      [Colors.green, Colors.green, Colors.primary, Colors.red]
    )
  );

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeDashoffset.value,
    stroke: strokeColor.value,
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
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
      {/* Center content */}
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
