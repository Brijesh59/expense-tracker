import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { H1, Body, Caption } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { BudgetRing } from '@/components/ui/BudgetRing';
import { useSettings } from '@/hooks/useSettings';
import { useBudgets } from '@/hooks/useBudgets';
import { useMonthStore } from '@/store/monthStore';
import { formatAmount } from '@/utils/currency';
import { haptic } from '@/utils/haptics';
import { springs } from '@/constants/animations';

const NUDGE_COLORS: Record<string, string> = {
  good: Colors.green,
  caution: Colors.yellow,
  warning: Colors.yellow,
  over: Colors.red,
  neutral: Colors.textSecondary,
};

export default function InsightRevealScreen() {
  const { nudgeText, nudgeType } = useLocalSearchParams<{ nudgeText: string; nudgeType: string }>();
  const { setSetting } = useSettings();
  const { month, year } = useMonthStore();
  const { overallRatio, totalSpent, totalBudget } = useBudgets({ month, year });

  const cardY = useSharedValue(80);
  const cardOpacity = useSharedValue(0);
  const dashboardY = useSharedValue(40);
  const dashboardOpacity = useSharedValue(0);

  useEffect(() => {
    haptic.success();
    cardY.value = withSpring(0, springs.bouncy);
    cardOpacity.value = withTiming(1, { duration: 400 });

    dashboardY.value = withDelay(600, withSpring(0, springs.smooth));
    dashboardOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardY.value }],
    opacity: cardOpacity.value,
  }));

  const dashboardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dashboardY.value }],
    opacity: dashboardOpacity.value,
  }));

  const handleContinue = async () => {
    await setSetting('onboarding_complete', 'true');
    router.replace('/(tabs)');
  };

  const accentColor = NUDGE_COLORS[nudgeType ?? 'neutral'] ?? Colors.primary;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg }}>
        <H1 style={{ marginBottom: Spacing.xl }}>You're off to a good start 👍</H1>

        {/* Nudge card */}
        <Animated.View style={cardStyle}>
          <View
            style={{
              backgroundColor: Colors.surface2,
              borderRadius: Radius.lg,
              padding: Spacing.md,
              borderWidth: 1,
              borderColor: `${accentColor}40`,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              marginBottom: Spacing.xl,
            }}
          >
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: accentColor }} />
            <Text
              style={{ fontFamily: Fonts.medium, fontSize: 15, color: Colors.textPrimary, flex: 1 }}
            >
              {nudgeText}
            </Text>
          </View>
        </Animated.View>

        {/* Dashboard preview */}
        <Animated.View style={[dashboardStyle, { alignItems: 'center', gap: Spacing.md }]}>
          <Caption color={Colors.textSecondary}>Here's your month so far</Caption>
          <BudgetRing
            ratio={overallRatio}
            size={160}
            centerLabel={`${Math.round(overallRatio * 100)}%`}
            subLabel={totalBudget > 0 ? `${formatAmount(totalSpent)} / ${formatAmount(totalBudget)}` : undefined}
          />
        </Animated.View>
      </View>

      <View style={{ paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl }}>
        <Button onPress={handleContinue} fullWidth size="lg">
          See my dashboard →
        </Button>
      </View>
    </SafeAreaView>
  );
}
