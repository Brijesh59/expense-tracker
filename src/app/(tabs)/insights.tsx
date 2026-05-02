import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  Easing,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Spacing, Fonts } from '@/constants/theme';
import { H2, H3, BodyMedium, Caption } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { MonthSelector } from '@/components/ui/MonthSelector';
import { DonutChart } from '@/components/charts/DonutChart';
import { DailyBarChart } from '@/components/charts/DailyBarChart';
import { useMonthStore } from '@/store/monthStore';
import { useInsights } from '@/hooks/useInsights';
import { useCategories } from '@/hooks/useCategories';
import { formatAmount } from '@/utils/currency';
import { emptyStates } from '@/constants/copy';
import type { InsightCard } from '@/hooks/useInsights';

const INSIGHT_BG: Record<string, string> = {
  good: `${Colors.green}18`,
  neutral: `${Colors.primary}18`,
  warning: `${Colors.yellow}18`,
};

const INSIGHT_DOT: Record<string, string> = {
  good: Colors.green,
  neutral: Colors.primary,
  warning: Colors.yellow,
};

function InsightCardItem({ card, index }: { card: InsightCard; index: number }) {
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);

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
          backgroundColor: INSIGHT_BG[card.type] ?? Colors.surface2,
          borderRadius: 12,
          paddingVertical: 14,
          paddingHorizontal: Spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          borderWidth: 1,
          borderColor: `${INSIGHT_DOT[card.type] ?? Colors.primary}30`,
        }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: INSIGHT_DOT[card.type] ?? Colors.primary,
          }}
        />
        <Text
          style={{
            fontFamily: Fonts.medium,
            fontSize: 14,
            color: Colors.textPrimary,
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
  const { month, year } = useMonthStore();
  const {
    totalSpent,
    prevTotalSpent,
    percentChange,
    spendByCategory,
    last7DaysSpend,
    insightCards,
  } = useInsights({ month, year });
  const categories = useCategories();

  const isEmpty = totalSpent === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            paddingHorizontal: Spacing.md,
            paddingTop: Spacing.md,
            paddingBottom: Spacing.sm,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <H2>Insights</H2>
          <MonthSelector />
        </View>

        {isEmpty ? (
          <EmptyState
            headline={emptyStates.insights.headline}
            subtext={emptyStates.insights.subtext}
          />
        ) : (
          <View style={{ paddingHorizontal: Spacing.md }}>
            {/* Summary */}
            <Card style={{ marginBottom: Spacing.md, flexDirection: 'row', alignItems: 'center' }}>
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
                      color: percentChange > 0 ? Colors.red : Colors.green,
                      marginTop: 4,
                    }}
                  >
                    {percentChange > 0 ? '+' : ''}{percentChange}%
                  </Text>
                </View>
              )}
            </Card>

            {/* Donut Chart */}
            {spendByCategory.length > 0 && (
              <Card style={{ marginBottom: Spacing.md, paddingTop: Spacing.lg }}>
                <BodyMedium style={{ marginBottom: Spacing.md, color: Colors.textSecondary }}>
                  By category
                </BodyMedium>
                <DonutChart
                  data={spendByCategory}
                  categories={categories}
                  totalSpent={totalSpent}
                />
              </Card>
            )}

            {/* Daily Bar Chart */}
            {last7DaysSpend.length > 0 && (
              <Card style={{ marginBottom: Spacing.md }}>
                <BodyMedium style={{ marginBottom: Spacing.sm, color: Colors.textSecondary }}>
                  Last 7 days
                </BodyMedium>
                <DailyBarChart data={last7DaysSpend} width={320} />
              </Card>
            )}

            {/* Insight Cards */}
            {insightCards.length > 0 && (
              <View style={{ marginBottom: Spacing.md }}>
                <BodyMedium style={{ marginBottom: 12, color: Colors.textSecondary }}>
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
    </SafeAreaView>
  );
}
