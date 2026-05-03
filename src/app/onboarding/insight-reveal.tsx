import { BudgetRing } from '@/components/ui/BudgetRing';
import { Button } from '@/components/ui/Button';
import { Caption, H1 } from '@/components/ui/Typography';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Storage } from '@/db/storage';
import { useBudgets } from '@/hooks/useBudgets';
import { useSettings } from '@/hooks/useSettings';
import { useMonthStore } from '@/store/monthStore';
import { formatAmount } from '@/utils/currency';
import { haptic } from '@/utils/haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function InsightRevealScreen() {
  const { colors } = useTheme();

  const NUDGE_COLORS: Record<string, string> = {
    good: colors.green,
    caution: colors.yellow,
    warning: colors.yellow,
    over: colors.red,
    neutral: colors.textSecondary,
  };

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
    cardY.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) });
    cardOpacity.value = withTiming(1, { duration: 400 });

    dashboardY.value = withDelay(600, withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) }));
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
    await Storage.markLaunched();
    router.replace('/(tabs)');
  };

  const accentColor = NUDGE_COLORS[nudgeType ?? 'neutral'] ?? colors.primary;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg }}>
        <H1 style={{ marginBottom: Spacing.xl }}>You're off to a good start</H1>

        {/* Nudge card */}
        <Animated.View style={cardStyle}>
          <View
            style={{
              backgroundColor: colors.surface2,
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
              style={{ fontFamily: Fonts.medium, fontSize: 15, color: colors.textPrimary, flex: 1 }}
            >
              {nudgeText}
            </Text>
          </View>
        </Animated.View>

        {/* Dashboard preview */}
        <Animated.View style={[dashboardStyle, { alignItems: 'center', gap: Spacing.md }]}>
          <Caption color={colors.textSecondary}>Here's your month so far</Caption>
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
