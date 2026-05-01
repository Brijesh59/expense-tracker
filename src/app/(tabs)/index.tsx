import React, { useCallback } from 'react';
import { ScrollView, View, Text, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Spacing, Fonts } from '@/constants/theme';
import { H2, H3, Body, Caption, BodyMedium } from '@/components/ui/Typography';
import { BudgetRing } from '@/components/ui/BudgetRing';
import { EmptyState } from '@/components/ui/EmptyState';
import { MonthSelector } from '@/components/ui/MonthSelector';
import { CategoryBudgetCard } from '@/components/overview/CategoryBudgetCard';
import { useMonthStore } from '@/store/monthStore';
import { useBudgets } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { formatAmount, formatAmountFull } from '@/utils/currency';
import { getGreeting } from '@/utils/dates';
import { emptyStates } from '@/constants/copy';
import { useAddExpense } from './_layout';

export default function OverviewScreen() {
  const { month, year } = useMonthStore();
  const { budgetsWithSpend, totalBudget, totalSpent, overallRatio } = useBudgets({ month, year });
  const categories = useCategories();
  const { open: openAddExpense } = useAddExpense();

  const getCategoryById = useCallback(
    (id: string) => categories.find(c => c.id === id),
    [categories]
  );

  const hasBudgets = budgetsWithSpend.length > 0;

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
          <View>
            <Caption>{getGreeting()}</Caption>
            <H2>Overview</H2>
          </View>
          <MonthSelector />
        </View>

        {hasBudgets ? (
          <>
            {/* Budget Ring */}
            <View style={{ alignItems: 'center', paddingVertical: Spacing.lg }}>
              <BudgetRing
                ratio={overallRatio}
                size={180}
                centerLabel={`${Math.round(overallRatio * 100)}%`}
                subLabel={`${formatAmount(totalSpent)} / ${formatAmount(totalBudget)}`}
              />
              <View style={{ alignItems: 'center', marginTop: 12 }}>
                <Caption color={Colors.textSecondary}>
                  {totalBudget - totalSpent >= 0
                    ? `${formatAmount(totalBudget - totalSpent)} remaining`
                    : `Over budget by ${formatAmount(Math.abs(totalBudget - totalSpent))}`}
                </Caption>
              </View>
            </View>

            {/* Category List */}
            <View style={{ paddingHorizontal: Spacing.md }}>
              <BodyMedium style={{ marginBottom: 12, color: Colors.textSecondary }}>
                Budgets
              </BodyMedium>
              {budgetsWithSpend.map((item, index) => (
                <CategoryBudgetCard
                  key={item.budget.id}
                  item={item}
                  category={getCategoryById(item.categoryId)}
                  index={index}
                  onPress={() => router.push(`/budget/${item.budget.id}`)}
                />
              ))}
            </View>
          </>
        ) : (
          <EmptyState
            headline={emptyStates.overview.headline}
            subtext={emptyStates.overview.subtext}
            ctaLabel={emptyStates.overview.cta}
            onCTA={() => {}}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
