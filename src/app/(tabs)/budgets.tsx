import React, { useRef } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';
import { H2, Caption } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { MonthSelector } from '@/components/ui/MonthSelector';
import { CategoryBudgetCard } from '@/components/overview/CategoryBudgetCard';
import { BudgetFormSheet, BudgetFormSheetRef } from '@/components/sheets/BudgetFormSheet';
import { useMonthStore } from '@/store/monthStore';
import { useBudgets } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { emptyStates } from '@/constants/copy';

export default function BudgetsScreen() {
  const { month, year } = useMonthStore();
  const { budgetsWithSpend } = useBudgets({ month, year });
  const categories = useCategories();
  const budgetSheetRef = useRef<BudgetFormSheetRef>(null);

  const existingCategoryIds = budgetsWithSpend.map(b => b.categoryId);
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
          <H2>Budgets</H2>
          <MonthSelector />
        </View>

        {hasBudgets ? (
          <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.sm }}>
            {budgetsWithSpend.map((item, index) => (
              <CategoryBudgetCard
                key={item.budget.id}
                item={item}
                category={categories.find(c => c.id === item.categoryId)}
                index={index}
                onPress={() => budgetSheetRef.current?.present(item.budget)}
              />
            ))}
            <Button
              onPress={() => budgetSheetRef.current?.present()}
              variant="secondary"
              fullWidth
              style={{ marginTop: Spacing.sm }}
            >
              + Add budget
            </Button>
          </View>
        ) : (
          <EmptyState
            headline={emptyStates.budgets.headline}
            subtext={emptyStates.budgets.subtext}
            ctaLabel={emptyStates.budgets.cta}
            onCTA={() => budgetSheetRef.current?.present()}
          />
        )}
      </ScrollView>

      <BudgetFormSheet
        ref={budgetSheetRef}
        month={month}
        year={year}
        existingCategoryIds={existingCategoryIds}
      />
    </SafeAreaView>
  );
}
