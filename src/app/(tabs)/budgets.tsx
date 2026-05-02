import React, { useRef, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { H2, Caption } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { MonthPickerModal } from '@/components/ui/MonthPickerModal';
import { CategoryBudgetCard } from '@/components/overview/CategoryBudgetCard';
import { BudgetFormSheet, BudgetFormSheetRef } from '@/components/sheets/BudgetFormSheet';
import { useMonthStore } from '@/store/monthStore';
import { getMonthLabel } from '@/utils/dates';
import { haptic } from '@/utils/haptics';
import { useBudgets } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { emptyStates } from '@/constants/copy';

export default function BudgetsScreen() {
  const { colors, isDark } = useTheme();
  const { month, year, setMonth } = useMonthStore();
  const [pickerVisible, setPickerVisible] = useState(false);
  const { budgetsWithSpend } = useBudgets({ month, year });
  const categories = useCategories();
  const budgetSheetRef = useRef<BudgetFormSheetRef>(null);

  const existingCategoryIds = budgetsWithSpend.map(b => b.categoryId);
  const hasBudgets = budgetsWithSpend.length > 0;
  const pillStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    alignSelf: 'flex-start' as const,
    backgroundColor: isDark ? colors.surface2 : '#F2F6F9',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 5,
    borderWidth: 1,
    borderColor: isDark ? colors.border : 'rgba(60,110,145,0.12)',
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Large header */}
        <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.lg }}>
          <Text style={{ fontSize: 34, fontFamily: Fonts.bold, color: colors.textPrimary, marginBottom: Spacing.md }}>
            Budgets
          </Text>
          <Pressable
            onPress={() => { haptic.light(); setPickerVisible(true); }}
            style={pillStyle}
          >
            <Text style={{ fontFamily: Fonts.medium, fontSize: 13, color: colors.textPrimary }}>
              {getMonthLabel(month, year)}
            </Text>
            <Ionicons name="chevron-down" size={11} color={colors.textSecondary} />
          </Pressable>
        </View>

        {hasBudgets ? (
          <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.sm }}>
            {budgetsWithSpend.map((item, index) => (
              <CategoryBudgetCard
                key={item.budget.id}
                item={item}
                category={categories.find(c => c.id === item.categoryId)}
                index={index}
                onPress={() => router.push(`/budget/${item.budget.id}`)}
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

      <MonthPickerModal
        visible={pickerVisible}
        month={month}
        year={year}
        onSelect={(m, y) => { haptic.light(); setMonth(m, y); setPickerVisible(false); }}
        onClose={() => setPickerVisible(false)}
      />
      <BudgetFormSheet
        ref={budgetSheetRef}
        month={month}
        year={year}
        existingCategoryIds={existingCategoryIds}
      />
    </SafeAreaView>
  );
}
