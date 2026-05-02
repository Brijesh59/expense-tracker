import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import type { NudgeResult } from '@/utils/nudgeEngine';

interface NudgeCardProps {
  nudge: NudgeResult | null;
  onDismiss: () => void;
}

export function NudgeCard({ nudge, onDismiss }: NudgeCardProps) {
  const { colors } = useTheme();
  const translateY = useSharedValue(120);
  const opacity = useSharedValue(0);

  const nudgeColors: Record<string, string> = {
    good: colors.green,
    caution: colors.yellow,
    warning: colors.yellow,
    over: colors.red,
    neutral: colors.textSecondary,
  };

  useEffect(() => {
    if (!nudge) return;

    translateY.value = withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) });
    opacity.value = withTiming(1, { duration: 200 });

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

  const accentColor = nudgeColors[nudge.type] ?? colors.primary;

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
          backgroundColor: colors.surface2,
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
            color: colors.textPrimary,
            flex: 1,
          }}
        >
          {nudge.text}
        </Text>
      </View>
    </Animated.View>
  );
}
