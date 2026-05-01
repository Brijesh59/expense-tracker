import React from 'react';
import { Pressable, Text, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { springs } from '@/constants/animations';
import { haptic } from '@/utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bgColor: Record<typeof variant, string> = {
    primary: Colors.primary,
    secondary: Colors.surface2,
    ghost: 'transparent',
    danger: '#3D1515',
  };

  const textColor: Record<typeof variant, string> = {
    primary: '#FFFFFF',
    secondary: Colors.textPrimary,
    ghost: Colors.textSecondary,
    danger: Colors.red,
  };

  const paddingY: Record<typeof size, number> = { sm: 10, md: 14, lg: 18 };
  const fontSize: Record<typeof size, number> = { sm: 13, md: 15, lg: 16 };

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.96, springs.snappy);
        haptic.light();
      }}
      onPressOut={() => {
        scale.value = withSpring(1, springs.snappy);
      }}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        animatedStyle,
        {
          backgroundColor: bgColor[variant],
          paddingVertical: paddingY[size],
          paddingHorizontal: 20,
          borderRadius: Radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          opacity: disabled ? 0.4 : 1,
          ...(fullWidth ? { width: '100%' } : {}),
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor[variant]} size="small" />
      ) : (
        <Text
          style={[
            {
              fontFamily: Fonts.semibold,
              fontSize: fontSize[size],
              color: textColor[variant],
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </AnimatedPressable>
  );
}
