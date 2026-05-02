import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface BadgeProps {
  label: string;
  color?: string;
  style?: ViewStyle;
}

export function Badge({ label, color, style }: BadgeProps) {
  const { colors } = useTheme();
  const badgeColor = color ?? colors.primary;
  return (
    <View
      style={[
        {
          backgroundColor: `${badgeColor}22`,
          borderRadius: Radius.full,
          paddingHorizontal: Spacing.sm,
          paddingVertical: 3,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text style={{ fontFamily: Fonts.medium, fontSize: 12, color: badgeColor }}>
        {label}
      </Text>
    </View>
  );
}
