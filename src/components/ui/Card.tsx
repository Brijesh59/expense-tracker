import React from 'react';
import { View, ViewStyle, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { haptic } from '@/utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevated?: boolean;
  padding?: number;
  accent?: boolean;
}

export function Card({ children, style, onPress, elevated = false, padding = Spacing.md, accent = false }: CardProps) {
  const scale = useSharedValue(1);

  const cardStyle: ViewStyle = {
    backgroundColor: elevated ? Colors.surface2 : Colors.surface,
    borderRadius: Radius.md,
    padding,
    borderWidth: 1,
    borderColor: accent
      ? `${Colors.primary}40`
      : Colors.border,
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (onPress) {
    return (
      <AnimatedPressable
        onPressIn={() => {
          scale.value = withTiming(0.98, { duration: 80 });
          haptic.light();
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 120 });
        }}
        onPress={onPress}
        style={[animStyle, cardStyle, style]}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );
}
