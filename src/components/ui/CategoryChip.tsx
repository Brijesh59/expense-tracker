import React from 'react';
import { Pressable, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Fonts, Radius } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { haptic } from '@/utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CategoryChipProps {
  icon: string;
  name: string;
  color: string;
  selected?: boolean;
  onPress: () => void;
  size?: 'sm' | 'md';
}

export function CategoryChip({ icon, name, color, selected = false, onPress, size = 'md' }: CategoryChipProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => { scale.value = withTiming(0.93, { duration: 80 }); haptic.light(); }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 120 }); }}
      onPress={onPress}
      style={[
        animatedStyle,
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: size === 'sm' ? 10 : 14,
          paddingVertical: size === 'sm' ? 6 : 10,
          borderRadius: Radius.none,
          borderWidth: 1.5,
          borderColor: selected ? color : colors.border,
          backgroundColor: selected ? `${color}18` : colors.surface,
          marginRight: 8,
        },
      ]}
    >
      <Text style={{ fontSize: size === 'sm' ? 14 : 18 }}>{icon}</Text>
      <Text
        style={{
          fontFamily: selected ? Fonts.semibold : Fonts.regular,
          fontSize: size === 'sm' ? 12 : 14,
          color: selected ? color : colors.textSecondary,
        }}
      >
        {name}
      </Text>
    </AnimatedPressable>
  );
}
