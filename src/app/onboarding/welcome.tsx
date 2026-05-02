import React, { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { H1, Body, Caption } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { onboarding } from '@/constants/copy';

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const mascotY = useSharedValue(30);
  const mascotOpacity = useSharedValue(0);
  const headlineY = useSharedValue(20);
  const headlineOpacity = useSharedValue(0);
  const subtextY = useSharedValue(20);
  const subtextOpacity = useSharedValue(0);
  const ctaY = useSharedValue(20);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    mascotY.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) });
    mascotOpacity.value = withTiming(1, { duration: 600 });

    headlineY.value = withDelay(150, withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) }));
    headlineOpacity.value = withDelay(150, withTiming(1, { duration: 500 }));

    subtextY.value = withDelay(300, withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) }));
    subtextOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));

    ctaY.value = withDelay(500, withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) }));
    ctaOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
  }, []);

  const mascotStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: mascotY.value }],
    opacity: mascotOpacity.value,
  }));

  const headlineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headlineY.value }],
    opacity: headlineOpacity.value,
  }));

  const subtextStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: subtextY.value }],
    opacity: subtextOpacity.value,
  }));

  const ctaStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: ctaY.value }],
    opacity: ctaOpacity.value,
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flex: 1,
          paddingHorizontal: Spacing.lg,
          justifyContent: 'center',
          alignItems: 'center',
          gap: Spacing.lg,
        }}
      >
        {/* Cat mascot placeholder (Lottie would go here) */}
        <Animated.View
          style={[
            mascotStyle,
            {
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: `${colors.primary}20`,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: `${colors.primary}40`,
            },
          ]}
        >
          <Body style={{ fontSize: 64 }}>🐱</Body>
        </Animated.View>

        <View style={{ alignItems: 'center', gap: Spacing.sm }}>
          <Animated.View style={headlineStyle}>
            <H1 style={{ textAlign: 'center', fontSize: 30, lineHeight: 38 }}>
              {onboarding.welcome.headline}
            </H1>
          </Animated.View>

          <Animated.View style={subtextStyle}>
            <Body
              color={colors.textSecondary}
              style={{ textAlign: 'center', fontSize: 17 }}
            >
              {onboarding.welcome.subtext}
            </Body>
          </Animated.View>
        </View>
      </View>

      <Animated.View
        style={[
          ctaStyle,
          { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
        ]}
      >
        <Button
          onPress={() => router.push('/onboarding/intent')}
          fullWidth
          size="lg"
        >
          {onboarding.welcome.cta}
        </Button>
      </Animated.View>
    </SafeAreaView>
  );
}
