import { useMemo } from 'react';
import { useLumaStore } from '@/db/store';
import { startOfMonth, endOfMonth } from '@/utils/dates';
import { groupByCategory, getLast7DaysSpend, getSpendPercentChange } from '@/utils/analytics';

export interface InsightCard {
  id: string;
  text: string;
  type: 'good' | 'neutral' | 'warning';
}

export function useInsights({ month, year }: { month: number; year: number }) {
  const allTransactions = useLumaStore(s => s.transactions);

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  const transactions = useMemo(
    () => allTransactions.filter(t => t.date >= startOfMonth(month, year) && t.date <= endOfMonth(month, year)),
    [allTransactions, month, year]
  );

  const prevTransactions = useMemo(
    () => allTransactions.filter(t => t.date >= startOfMonth(prevMonth, prevYear) && t.date <= endOfMonth(prevMonth, prevYear)),
    [allTransactions, prevMonth, prevYear]
  );

  const totalSpent = useMemo(
    () => transactions.reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const prevTotalSpent = useMemo(
    () => prevTransactions.reduce((sum, t) => sum + t.amount, 0),
    [prevTransactions]
  );

  const percentChange = useMemo(
    () => getSpendPercentChange(totalSpent, prevTotalSpent),
    [totalSpent, prevTotalSpent]
  );

  const spendByCategory = useMemo(
    () => groupByCategory(transactions.map(t => ({ categoryId: t.categoryId, amount: t.amount }))),
    [transactions]
  );

  const last7DaysSpend = useMemo(
    () => getLast7DaysSpend(transactions.map(t => ({ date: t.date, amount: t.amount }))),
    [transactions]
  );

  const insightCards = useMemo<InsightCard[]>(() => {
    const cards: InsightCard[] = [];

    const weekendSpend = transactions
      .filter(t => { const d = new Date(t.date).getDay(); return d === 0 || d === 6; })
      .reduce((sum, t) => sum + t.amount, 0);
    if (totalSpent > 0 && weekendSpend / totalSpent > 0.5) {
      cards.push({ id: 'weekend', text: 'Weekend spending is your pattern', type: 'neutral' });
    }

    const topCategory = [...spendByCategory].sort((a, b) => b.total - a.total)[0];
    if (topCategory && totalSpent > 0 && topCategory.total / totalSpent > 0.3) {
      cards.push({ id: 'top-cat', text: 'One category is driving most of your spend', type: 'neutral' });
    }

    if (transactions.length > 0) {
      const avg = totalSpent / transactions.length;
      if (avg < 300 && totalSpent > 3000) {
        cards.push({ id: 'small', text: 'Small expenses are adding up this month', type: 'warning' });
      }
    }

    if (percentChange < -5) {
      cards.push({ id: 'down', text: `Spending is down ${Math.abs(percentChange)}% vs last month 👏`, type: 'good' });
    }

    return cards;
  }, [transactions, spendByCategory, totalSpent, percentChange]);

  return {
    totalSpent,
    prevTotalSpent,
    percentChange,
    spendByCategory,
    last7DaysSpend,
    insightCards,
    transactions: [...transactions].sort((a, b) => b.amount - a.amount),
  };
}
