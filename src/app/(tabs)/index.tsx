import React, { useCallback, useRef, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Fonts, Radius } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { EmptyState } from '@/components/ui/EmptyState';
import { MonthPickerModal } from '@/components/ui/MonthPickerModal';
import { BudgetBarChart } from '@/components/overview/BudgetBarChart';
import { TransactionRow } from '@/components/ui/TransactionRow';
import { AddExpenseSheet, AddExpenseSheetRef } from '@/components/sheets/AddExpenseSheet';
import { WorkspaceSheet, WorkspaceSheetRef } from '@/components/sheets/WorkspaceSheet';
import { useMonthStore } from '@/store/monthStore';
import { useBudgets } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { useLumaStore } from '@/db/store';
import { formatAmount } from '@/utils/currency';
import { getMonthLabel } from '@/utils/dates';
import { haptic } from '@/utils/haptics';
import { emptyStates } from '@/constants/copy';
import { useAddExpense } from './_layout';

export default function OverviewScreen() {
  const { colors } = useTheme();
  const { month, year, setMonth } = useMonthStore();
  const { budgetsWithSpend, totalBudget, totalSpent } = useBudgets({ month, year });
  const categories = useCategories();
  const { sections } = useTransactions({ month, year });
  const allBudgets = useLumaStore(s => s.budgets);
  const workspaces = useLumaStore(s => s.workspaces);
  const currentWorkspaceId = useLumaStore(s => s.currentWorkspaceId);
  const { open: openAddExpense } = useAddExpense();
  const [pickerVisible, setPickerVisible] = useState(false);
  const editSheetRef = useRef<AddExpenseSheetRef>(null);
  const workspaceSheetRef = useRef<WorkspaceSheetRef>(null);

  const currentWorkspace = workspaces.find(w => w.id === currentWorkspaceId);

  const getCategoryById = useCallback(
    (id: string) => categories.find(c => c.id === id),
    [categories]
  );

  // True if user has set up any budgets at all (any month)
  const hasAnyBudgets = allBudgets.length > 0;
  // True if this specific month has spending against budgets (for bar chart)
  const hasSpendThisMonth = budgetsWithSpend.some(b => b.spent > 0);
  const remaining = totalBudget - totalSpent;

  const handleMonthSelect = (m: number, y: number) => {
    haptic.light();
    setMonth(m, y);
  };

  const TransactionList = () => (
    <View style={{ marginTop: Spacing.xl }}>
      {sections.map((section) => {
        const sectionTotal = section.data.reduce((s, t) => s + t.amount, 0);
        return (
          <View key={section.title}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: Spacing.md,
                paddingTop: 14,
                paddingBottom: 6,
              }}
            >
              <Text style={{ fontFamily: Fonts.medium, fontSize: 13, color: colors.textSecondary }}>
                {section.title}
              </Text>
              <Text style={{ fontFamily: Fonts.medium, fontSize: 13, color: colors.textSecondary }}>
                {formatAmount(sectionTotal)}
              </Text>
            </View>
            {section.data.map((txn, txnIdx) => (
              <TransactionRow
                key={txn.id}
                transaction={txn}
                category={getCategoryById(txn.categoryId)}
                index={txnIdx}
                onPress={() => { haptic.light(); editSheetRef.current?.presentEdit(txn); }}
              />
            ))}
          </View>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            paddingHorizontal: Spacing.md,
            paddingTop: Spacing.sm,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Workspace pill */}
          <Pressable
            onPress={() => { haptic.light(); workspaceSheetRef.current?.present(); }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              backgroundColor: colors.surface2,
              borderRadius: Radius.full,
              paddingHorizontal: 12,
              paddingVertical: 5,
            }}
          >
            <Text style={{ fontFamily: Fonts.medium, fontSize: 13, color: colors.textPrimary }}>
              {currentWorkspace?.name ?? 'Personal'}
            </Text>
            <Ionicons name="chevron-down" size={11} color={colors.textSecondary} />
          </Pressable>

          {/* Right icons */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* Budget icon with circular progress ring */}
          {(() => {
            const RING = 44;
            const CENTER = 22;
            const RADIUS = 19;
            const STROKE = 2.5;
            const circumference = 2 * Math.PI * RADIUS;
            const progress = totalBudget > 0 ? Math.min(totalSpent / totalBudget, 1) : 0;
            const dashOffset = circumference * (1 - progress);
            const ringColor = totalSpent >= totalBudget ? colors.red : colors.primary;
            return (
              <View style={{ width: RING, height: RING }}>
                <Svg width={RING} height={RING} style={{ position: 'absolute' }}>
                  {totalBudget > 0 && (
                    <Circle
                      cx={CENTER} cy={CENTER} r={RADIUS}
                      fill="none"
                      stroke={colors.border}
                      strokeWidth={STROKE}
                    />
                  )}
                  {totalBudget > 0 && progress > 0 && (
                    <Circle
                      cx={CENTER} cy={CENTER} r={RADIUS}
                      fill="none"
                      stroke={ringColor}
                      strokeWidth={STROKE}
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                      rotation={-90}
                      origin={`${CENTER}, ${CENTER}`}
                    />
                  )}
                </Svg>
                <Pressable
                  onPress={() => { haptic.light(); router.push('/budgets'); }}
                  style={{
                    position: 'absolute',
                    top: 4, left: 4,
                    width: 36, height: 36,
                    borderRadius: 18,
                    backgroundColor: colors.surface,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="wallet-outline" size={18} color={colors.textSecondary} />
                </Pressable>
              </View>
            );
          })()}

          {/* Settings — same 44×44 container, invisible ring to match budget button size */}
          {[
            { icon: 'settings-outline', route: '/settings' },
          ].map(({ icon, route }) => (
            <View key={route} style={{ width: 44, height: 44 }}>
              <Svg width={44} height={44} style={{ position: 'absolute' }}>
                <Circle
                  cx={22} cy={22} r={19}
                  fill="none"
                  stroke={colors.background}
                  strokeWidth={2.5}
                />
              </Svg>
              <Pressable
                onPress={() => { haptic.light(); router.push(route as any); }}
                style={{
                  position: 'absolute',
                  top: 4, left: 4,
                  width: 36, height: 36,
                  borderRadius: 18,
                  backgroundColor: colors.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={icon as any} size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
          ))}
          </View>
        </View>

        {/* Big spent total — ₹ before the number */}
        <View style={{ paddingHorizontal: Spacing.md, marginTop: Spacing.xs }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Text
              style={{
                fontSize: 28,
                fontFamily: Fonts.medium,
                color: colors.textSecondary,
                marginTop: 14,
                marginRight: 3,
              }}
            >
              ₹
            </Text>
            <Text
              style={{
                fontSize: 72,
                fontFamily: Fonts.bold,
                color: colors.textPrimary,
                lineHeight: 80,
                letterSpacing: -2,
              }}
            >
              {totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </Text>
          </View>

          {/* Month pill + remaining */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 }}>
            <Pressable
              onPress={() => setPickerVisible(true)}
              style={{
                backgroundColor: colors.surface2,
                borderRadius: Radius.full,
                paddingHorizontal: 12,
                paddingVertical: 5,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Text
                style={{ fontFamily: Fonts.medium, fontSize: 13, color: colors.textPrimary }}
              >
                {getMonthLabel(month, year)}
              </Text>
              <Ionicons name="chevron-down" size={11} color={colors.textSecondary} />
            </Pressable>

            {totalBudget > 0 && (
              <Text
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: 13,
                  color: remaining >= 0 ? colors.textSecondary : colors.red,
                }}
              >
                {remaining >= 0
                  ? `₹${remaining.toLocaleString('en-IN', { maximumFractionDigits: 0 })} left`
                  : `Over by ₹${Math.abs(remaining).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
              </Text>
            )}
          </View>
        </View>

        {hasAnyBudgets ? (
          <>
            {hasSpendThisMonth && (
              <BudgetBarChart
                budgets={budgetsWithSpend}
                categories={categories}
                onBarPress={(id) => router.push(`/budget/${id}`)}
              />
            )}
            {sections.length > 0 ? (
              <TransactionList />
            ) : (
              <EmptyState
                headline="No expenses this month"
                subtext="Tap + to log your first expense"
                ctaLabel="Log expense"
                onCTA={() => openAddExpense()}
              />
            )}
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

      <MonthPickerModal
        visible={pickerVisible}
        month={month}
        year={year}
        onSelect={handleMonthSelect}
        onClose={() => setPickerVisible(false)}
      />
      <AddExpenseSheet ref={editSheetRef} />
      <WorkspaceSheet ref={workspaceSheetRef} />
    </SafeAreaView>
  );
}
