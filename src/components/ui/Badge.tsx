import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

interface BadgeProps {
  label: string;
  color?: string;
  style?: ViewStyle;
}

export function Badge({ label, color = Colors.primary, style }: BadgeProps) {
  return (
    <View
      style={[
        {
          backgroundColor: `${color}22`,
          borderRadius: Radius.full,
          paddingHorizontal: Spacing.sm,
          paddingVertical: 3,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text style={{ fontFamily: Fonts.medium, fontSize: 12, color }}>
        {label}
      </Text>
    </View>
  );
}
