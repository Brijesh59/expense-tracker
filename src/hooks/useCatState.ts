import { useMemo } from 'react';
import type { CatState } from '@/components/mascot/LumaCat';
import type { BudgetWithSpend } from '@/hooks/useBudgets';
import { daysBetween } from '@/utils/dates';
import type { Transaction } from '@/db/types';

export function useCatState(params: {
  budgetsWithSpend: BudgetWithSpend[];
  transactions: Transaction[];
  totalSpent: number;
  totalBudget: number;
  overallRatio: number;
}): CatState {
  const { transactions, overallRatio } = params;

  return useMemo<CatState>(() => {
    // No transactions for 3+ days → sleeping
    if (transactions.length > 0) {
      const lastDate = Math.max(...transactions.map(t => t.date));
      const daysSince = daysBetween(lastDate, Date.now());
      if (daysSince >= 3) return 'sleeping';
    } else {
      return 'sleeping';
    }

    // Over 85% budget → watching
    if (overallRatio >= 0.85 && overallRatio < 1.0) return 'watching';

    // At or over 100% → celebrating (completed the month challenge — paradoxically use "watching" for over)
    if (overallRatio >= 1.0) return 'watching';

    // Under 50% and logged today → excited
    const today = new Date().toDateString();
    const loggedToday = transactions.some(t => new Date(t.date).toDateString() === today);
    if (overallRatio < 0.5 && loggedToday) return 'excited';

    return 'idle';
  }, [transactions, overallRatio]);
}
