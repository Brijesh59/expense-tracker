import React, { useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import type { NudgeResult } from '@/utils/nudgeEngine';

const NUDGE_COLORS: Record<string, string> = {
  good: Colors.green,
  caution: Colors.yellow,
  warning: Colors.yellow,
  over: Colors.red,
  neutral: Colors.textSecondary,
};

interface NudgeCardProps {
  nudge: NudgeResult | null;
  onDismiss: () => void;
}

export function NudgeCard({ nudge, onDismiss }: NudgeCardProps) {
  const translateY = useSharedValue(120);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!nudge) return;

    translateY.value = withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) });
    opacity.value = withTiming(1, { duration: 200 });

    // Auto dismiss after 2.5s
    const t = setTimeout(() => {
      translateY.value = withTiming(120, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 }, (finished) => {
        if (finished) runOnJS(onDismiss)();
      });
    }, 2500);

    return () => clearTimeout(t);
  }, [nudge]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!nudge) return null;

  const accentColor = NUDGE_COLORS[nudge.type] ?? Colors.primary;

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: 'absolute',
          bottom: 90,
          left: Spacing.md,
          right: Spacing.md,
          zIndex: 100,
        },
      ]}
    >
      <View
        style={{
          backgroundColor: Colors.surface2,
          borderRadius: Radius.lg,
          borderWidth: 1,
          borderColor: `${accentColor}40`,
          paddingVertical: 14,
          paddingHorizontal: Spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: accentColor,
          }}
        />
        <Text
          style={{
            fontFamily: Fonts.medium,
            fontSize: 14,
            color: Colors.textPrimary,
            flex: 1,
          }}
        >
          {nudge.text}
        </Text>
      </View>
    </Animated.View>
  );
}
