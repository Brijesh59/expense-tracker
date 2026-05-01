import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { springs } from '@/constants/animations';
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
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => { scale.value = withSpring(0.93, springs.snappy); haptic.light(); }}
      onPressOut={() => { scale.value = withSpring(1, springs.snappy); }}
      onPress={onPress}
      style={[
        animatedStyle,
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: size === 'sm' ? 10 : 14,
          paddingVertical: size === 'sm' ? 6 : 10,
          borderRadius: Radius.full,
          borderWidth: 1.5,
          borderColor: selected ? color : Colors.border,
          backgroundColor: selected ? `${color}20` : Colors.surface,
          marginRight: 8,
        },
      ]}
    >
      <Text style={{ fontSize: size === 'sm' ? 14 : 18 }}>{icon}</Text>
      <Text
        style={{
          fontFamily: selected ? Fonts.semibold : Fonts.regular,
          fontSize: size === 'sm' ? 12 : 14,
          color: selected ? color : Colors.textSecondary,
        }}
      >
        {name}
      </Text>
    </AnimatedPressable>
  );
}
