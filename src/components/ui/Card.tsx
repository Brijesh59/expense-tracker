import React from 'react';
import { View, ViewStyle, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { springs } from '@/constants/animations';
import { haptic } from '@/utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevated?: boolean;
  padding?: number;
}

export function Card({ children, style, onPress, elevated = false, padding = Spacing.md }: CardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const cardStyle: ViewStyle = {
    backgroundColor: elevated ? Colors.surface2 : Colors.surface,
    borderRadius: Radius.lg,
    padding,
    borderWidth: 1,
    borderColor: Colors.border,
  };

  if (onPress) {
    return (
      <AnimatedPressable
        onPressIn={() => {
          scale.value = withSpring(0.98, springs.snappy);
          haptic.light();
        }}
        onPressOut={() => {
          scale.value = withSpring(1, springs.snappy);
        }}
        onPress={onPress}
        style={[animatedStyle, cardStyle, style]}
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
