import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  Easing,
  withTiming,
} from 'react-native-reanimated';
import { Spacing, Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { H3, BodyMedium, Caption } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { MonthPickerModal } from '@/components/ui/MonthPickerModal';
import { DonutChart } from '@/components/charts/DonutChart';
import { DailyBarChart } from '@/components/charts/DailyBarChart';
import { useMonthStore } from '@/store/monthStore';
import { getMonthLabel } from '@/utils/dates';
import { haptic } from '@/utils/haptics';
import { useInsights } from '@/hooks/useInsights';
import { useCategories } from '@/hooks/useCategories';
import { formatAmount } from '@/utils/currency';
import { emptyStates } from '@/constants/copy';
import type { InsightCard } from '@/hooks/useInsights';

function InsightCardItem({ card, index }: { card: InsightCard; index: number }) {
  const { colors, isDark } = useTheme();
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);

  const insightBg: Record<string, string> = {
    good: isDark ? `${colors.green}18` : '#F1F8F4',
    neutral: isDark ? `${colors.primary}18` : '#F2F6F9',
    warning: isDark ? `${colors.yellow}18` : '#FFF9E6',
  };

  const insightDot: Record<string, string> = {
    good: colors.green,
    neutral: colors.primary,
    warning: colors.yellow,
  };

  React.useEffect(() => {
    translateY.value = withDelay(index * 100, withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) }));
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 300 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[style, { marginBottom: 10 }]}>
      <View
        style={{
          backgroundColor: insightBg[card.type] ?? colors.surface2,
          borderRadius: 12,
          paddingVertical: 14,
          paddingHorizontal: Spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          borderWidth: 1,
          borderColor: isDark ? `${insightDot[card.type] ?? colors.primary}30` : 'rgba(60,110,145,0.12)',
        }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: insightDot[card.type] ?? colors.primary,
          }}
        />
        <Text
          style={{
            fontFamily: Fonts.medium,
            fontSize: 14,
            color: colors.textPrimary,
            flex: 1,
          }}
        >
          {card.text}
        </Text>
      </View>
    </Animated.View>
  );
}

export default function InsightsScreen() {
  const { colors, isDark } = useTheme();
  const { month, year, setMonth } = useMonthStore();
  const [pickerVisible, setPickerVisible] = useState(false);
  const {
    totalSpent,
    prevTotalSpent,
    percentChange,
    spendByCategory,
    last7DaysSpend,
    insightCards,
  } = useInsights({ month, year });
  const categories = useCategories();

  const pill = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: isDark ? colors.surface2 : '#F2F6F9',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 5,
    borderWidth: 1,
    borderColor: isDark ? colors.border : 'rgba(60,110,145,0.12)',
  };
  const insightCardStyle = {
    backgroundColor: isDark ? colors.surface : '#FBFDFE',
    borderColor: isDark ? colors.border : 'rgba(60,110,145,0.12)',
  };

  const isEmpty = totalSpent === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.lg }}>
          <Text style={{ fontSize: 34, fontFamily: Fonts.bold, color: colors.textPrimary, marginBottom: Spacing.md }}>
            Insights
          </Text>
          <Pressable onPress={() => { haptic.light(); setPickerVisible(true); }} style={[pill, { alignSelf: 'flex-start' }]}>
            <Text style={{ fontFamily: Fonts.medium, fontSize: 13, color: colors.textPrimary }}>
              {getMonthLabel(month, year)}
            </Text>
            <Ionicons name="chevron-down" size={11} color={colors.textSecondary} />
          </Pressable>
        </View>

        {isEmpty ? (
          <EmptyState
            headline={emptyStates.insights.headline}
            subtext={emptyStates.insights.subtext}
          />
        ) : (
          <View style={{ paddingHorizontal: Spacing.md }}>
            <Card style={{ ...insightCardStyle, marginBottom: Spacing.md, flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Caption style={{ marginBottom: 4 }}>Total spent</Caption>
                <H3 style={{ fontSize: 26 }}>{formatAmount(totalSpent)}</H3>
              </View>
              {prevTotalSpent > 0 && (
                <View style={{ alignItems: 'flex-end' }}>
                  <Caption>vs last month</Caption>
                  <Text
                    style={{
                      fontFamily: Fonts.semibold,
                      fontSize: 16,
                      color: percentChange > 0 ? colors.red : colors.green,
                      marginTop: 4,
                    }}
                  >
                    {percentChange > 0 ? '+' : ''}{percentChange}%
                  </Text>
                </View>
              )}
            </Card>

            {spendByCategory.length > 0 && (
              <Card style={{ ...insightCardStyle, marginBottom: Spacing.md, paddingTop: Spacing.lg }}>
                <BodyMedium style={{ marginBottom: Spacing.md, color: colors.textSecondary }}>
                  By category
                </BodyMedium>
                <DonutChart
                  data={spendByCategory}
                  categories={categories}
                  totalSpent={totalSpent}
                />
              </Card>
            )}

            {last7DaysSpend.length > 0 && (
              <Card style={{ ...insightCardStyle, marginBottom: Spacing.md }}>
                <BodyMedium style={{ marginBottom: Spacing.sm, color: colors.textSecondary }}>
                  Last 7 days
                </BodyMedium>
                <DailyBarChart data={last7DaysSpend} width={320} />
              </Card>
            )}

            {insightCards.length > 0 && (
              <View style={{ marginBottom: Spacing.md }}>
                <BodyMedium style={{ marginBottom: 12, color: colors.textSecondary }}>
                  Observations
                </BodyMedium>
                {insightCards.map((card, index) => (
                  <InsightCardItem key={card.id} card={card} index={index} />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
      <MonthPickerModal
        visible={pickerVisible}
        month={month}
        year={year}
        onSelect={(m, y) => { haptic.light(); setMonth(m, y); setPickerVisible(false); }}
        onClose={() => setPickerVisible(false)}
      />
    </SafeAreaView>
  );
}
