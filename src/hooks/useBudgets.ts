import { useMemo } from 'react';
import { useLumaStore } from '@/db/store';
import { startOfMonth, endOfMonth } from '@/utils/dates';
import { getBudgetUsageRatio, getBudgetColor } from '@/utils/analytics';
import type { Budget } from '@/db/types';

interface UseBudgetsOptions {
  month: number;
  year: number;
}

export interface BudgetWithSpend {
  budget: Budget;
  spent: number;
  ratio: number;
  remaining: number;
  color: string;
  categoryId: string;
}

export function useBudgets({ month, year }: UseBudgetsOptions) {
  const allTransactions = useLumaStore(s => s.transactions);
  const getEffectiveBudgets = useLumaStore(s => s.getEffectiveBudgets);

  const start = startOfMonth(month, year);
  const end = endOfMonth(month, year);

  const budgets = useMemo(
    () => getEffectiveBudgets(month, year),
    [getEffectiveBudgets, month, year]
  );

  const transactions = useMemo(
    () => allTransactions.filter(t => t.date >= start && t.date <= end),
    [allTransactions, start, end]
  );

  const budgetsWithSpend = useMemo<BudgetWithSpend[]>(() => {
    return budgets.map(budget => {
      const spent = transactions
        .filter(t => t.categoryId === budget.categoryId)
        .reduce((sum, t) => sum + t.amount, 0);
      const ratio = getBudgetUsageRatio(spent, budget.amount);
      return {
        budget,
        spent,
        ratio,
        remaining: budget.amount - spent,
        color: getBudgetColor(ratio),
        categoryId: budget.categoryId,
      };
    }).sort((a, b) => b.ratio - a.ratio);
  }, [budgets, transactions]);

  const totalBudget = useMemo(
    () => budgets.reduce((sum, b) => sum + b.amount, 0),
    [budgets]
  );

  const totalSpent = useMemo(
    () => transactions.reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const overallRatio = getBudgetUsageRatio(totalSpent, totalBudget);

  return { budgetsWithSpend, totalBudget, totalSpent, overallRatio };
}
