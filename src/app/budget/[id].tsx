import React, { useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Fonts, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { H1, H3, BodyMedium, Caption } from '@/components/ui/Typography';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { DailyBarChart } from '@/components/charts/DailyBarChart';
import { AddExpenseSheet, AddExpenseSheetRef } from '@/components/sheets/AddExpenseSheet';
import { BudgetFormSheet, BudgetFormSheetRef } from '@/components/sheets/BudgetFormSheet';
import { useLumaStore } from '@/db/store';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { getLast7DaysSpend } from '@/utils/analytics';
import { useCurrency } from '@/hooks/useCurrency';
import { formatDateLabel } from '@/utils/dates';
import { haptic } from '@/utils/haptics';
import type { Transaction } from '@/db/types';

export default function BudgetDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const budgets = useLumaStore(s => s.budgets);
  const { format, formatFull } = useCurrency();
  const categories = useCategories();
  const editSheetRef = useRef<AddExpenseSheetRef>(null);
  const budgetSheetRef = useRef<BudgetFormSheetRef>(null);

  const budget = budgets.find(b => b.id === id);
  const category = categories.find(c => c.id === budget?.categoryId);

  const { transactions, sections, total } = useTransactions({
    month: budget?.month ?? new Date().getMonth() + 1,
    year: budget?.year ?? new Date().getFullYear(),
    categoryId: budget?.categoryId,
  });

  const dailySpend = useMemo(() => getLast7DaysSpend(transactions), [transactions]);

  if (!budget || !category) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Caption>Budget not found</Caption>
      </SafeAreaView>
    );
  }

  const ratio = budget.amount > 0 ? Math.min(total / budget.amount, 1) : 0;
  const remaining = budget.amount - total;
  const isOver = remaining < 0;
  const pctUsed = Math.round((total / budget.amount) * 100);

  const accentColor = ratio >= 1
    ? colors.red
    : ratio >= 0.85
    ? colors.primary
    : colors.green;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: Spacing.md,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Pressable
          onPress={() => { haptic.light(); router.back(); }}
          style={{ padding: 4 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textSecondary} />
        </Pressable>

        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Text style={{ fontSize: 22 }}>{category.icon}</Text>
          <H3>{category.name}</H3>
        </View>

        <Pressable
          onPress={() => { haptic.light(); budgetSheetRef.current?.present(budget); }}
          style={{ padding: 4 }}
        >
          <Ionicons name="create-outline" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Budget summary card */}
        <View
          style={{
            margin: Spacing.md,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: Radius.md,
            padding: Spacing.md,
          }}
        >
          {/* Amounts */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Caption style={{ marginBottom: 4 }}>Spent</Caption>
              <Text
                style={{
                  fontFamily: Fonts.bold,
                  fontSize: 36,
                  color: colors.textPrimary,
                  letterSpacing: -1,
                  fontVariant: ['tabular-nums'],
                }}
              >
                {formatFull(total)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', paddingBottom: 4 }}>
              <Caption>of {formatFull(budget.amount)}</Caption>
            </View>
          </View>

          {/* Progress bar */}
          <ProgressBar ratio={ratio} height={8} style={{ marginBottom: 12 }} />

          {/* Stats row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Caption>{pctUsed}% used</Caption>
            <Text
              style={{
                fontFamily: Fonts.semibold,
                fontSize: 13,
                color: accentColor,
                fontVariant: ['tabular-nums'],
              }}
            >
              {isOver
                ? `${format(Math.abs(remaining))} over`
                : `${format(remaining)} left`}
            </Text>
          </View>
        </View>

        {/* Spending history */}
        {dailySpend.some(d => d.total > 0) && (
          <View
            style={{
              marginHorizontal: Spacing.md,
              marginBottom: Spacing.md,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: Radius.md,
              padding: Spacing.md,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.semibold,
                fontSize: 11,
                color: colors.textMuted,
                letterSpacing: 1,
                marginBottom: Spacing.md,
                textTransform: 'uppercase',
              }}
            >
              Spending History
            </Text>
            <DailyBarChart data={dailySpend} width={320} barColor={category.color} />
          </View>
        )}

        {/* Recent transactions */}
        {sections.length > 0 && (
          <View style={{ marginHorizontal: Spacing.md }}>
            <Text
              style={{
                fontFamily: Fonts.semibold,
                fontSize: 11,
                color: colors.textMuted,
                letterSpacing: 1,
                marginBottom: Spacing.sm,
                textTransform: 'uppercase',
              }}
            >
              Recent Transactions
            </Text>
            <View
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: Radius.md,
                overflow: 'hidden',
              }}
            >
              {sections.flatMap(section =>
                section.data.map((tx, i, arr) => (
                  <TransactionRow
                    key={tx.id}
                    transaction={tx}
                    category={category}
                    isLast={i === arr.length - 1 && section === sections[sections.length - 1]}
                    onPress={() => { haptic.light(); editSheetRef.current?.presentEdit(tx); }}
                  />
                ))
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <AddExpenseSheet ref={editSheetRef} />
      <BudgetFormSheet
        ref={budgetSheetRef}
        month={budget.month}
        year={budget.year}
      />
    </SafeAreaView>
  );
}

function TransactionRow({
  transaction,
  category,
  isLast,
  onPress,
}: {
  transaction: Transaction;
  category: { icon: string; name: string; color: string };
  isLast: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const { format } = useCurrency();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: Spacing.md,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: Radius.sm,
          backgroundColor: `${category.color}20`,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Text style={{ fontSize: 18 }}>{category.icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <BodyMedium numberOfLines={1}>
          {transaction.merchant || category.name}
        </BodyMedium>
        <Caption>{formatDateLabel(transaction.date)}{transaction.notes ? ` · ${transaction.notes}` : ''}</Caption>
      </View>
      <Text
        style={{
          fontFamily: Fonts.semibold,
          fontSize: 15,
          color: colors.textPrimary,
          fontVariant: ['tabular-nums'],
        }}
      >
        -{format(transaction.amount)}
      </Text>
    </Pressable>
  );
}
