import React from 'react';
import { Pressable, Text, View, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { springs } from '@/constants/animations';
import { haptic } from '@/utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

const SHADOW_OFFSET = 4;

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
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const shadowOpacity = useSharedValue(1);

  const bgColor: Record<typeof variant, string> = {
    primary: Colors.primary,
    secondary: 'transparent',
    ghost: 'transparent',
    danger: '#1A0808',
  };

  const textColor: Record<typeof variant, string> = {
    primary: '#000000',  // Black on yellow for high contrast
    secondary: Colors.textPrimary,
    ghost: Colors.textSecondary,
    danger: Colors.red,
  };

  const shadowColor: Record<typeof variant, string> = {
    primary: Colors.primaryShadow,
    secondary: 'rgba(255,255,255,0.5)',
    ghost: 'transparent',
    danger: '#550000',
  };

  const borderStyle: Record<typeof variant, object> = {
    primary: {},
    secondary: { borderWidth: 1.5, borderColor: Colors.textPrimary },
    ghost: {},
    danger: { borderWidth: 1, borderColor: Colors.red },
  };

  const paddingY: Record<typeof size, number> = { sm: 10, md: 14, lg: 18 };
  const fontSize: Record<typeof size, number> = { sm: 13, md: 15, lg: 16 };

  const hasShadow = variant === 'primary' || variant === 'secondary';

  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const shadowAnimStyle = useAnimatedStyle(() => ({
    opacity: shadowOpacity.value,
  }));

  const handlePressIn = () => {
    if (hasShadow) {
      translateX.value = withSpring(SHADOW_OFFSET, springs.snappy);
      translateY.value = withSpring(SHADOW_OFFSET, springs.snappy);
      shadowOpacity.value = withSpring(0, springs.snappy);
    }
    haptic.light();
  };

  const handlePressOut = () => {
    if (hasShadow) {
      translateX.value = withTiming(0, { duration: 120 });
      translateY.value = withTiming(0, { duration: 120 });
      shadowOpacity.value = withTiming(1, { duration: 120 });
    }
  };

  const wrapperStyle: ViewStyle = {
    ...(fullWidth ? { alignSelf: 'stretch' } : { alignSelf: 'flex-start' }),
    ...(hasShadow ? { paddingRight: SHADOW_OFFSET, paddingBottom: SHADOW_OFFSET } : {}),
    opacity: disabled ? 0.4 : 1,
  };

  return (
    <View style={[wrapperStyle, style]}>
      {hasShadow && (
        <AnimatedView
          style={[
            shadowAnimStyle,
            {
              position: 'absolute',
              top: SHADOW_OFFSET,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: shadowColor[variant],
            },
          ]}
        />
      )}
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={disabled || loading}
        style={[
          buttonAnimStyle,
          {
            backgroundColor: bgColor[variant],
            paddingVertical: paddingY[size],
            paddingHorizontal: 20,
            borderRadius: Radius.none,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            ...borderStyle[variant],
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={textColor[variant]} size="small" />
        ) : (
          <Text
            style={[
              {
                fontFamily: Fonts.bold,
                fontSize: fontSize[size],
                color: textColor[variant],
                letterSpacing: 0.5,
              },
              textStyle,
            ]}
          >
            {children}
          </Text>
        )}
      </AnimatedPressable>
    </View>
  );
}
