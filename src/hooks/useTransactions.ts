import { useMemo } from 'react';
import { useLumaStore } from '@/db/store';
import type { Transaction } from '@/db/types';
import { startOfMonth, endOfMonth, formatDateLabel } from '@/utils/dates';

interface MonthFilter {
  month: number;
  year: number;
}

interface UseTransactionsOptions {
  // Single-month mode (overview screen)
  month?: number;
  year?: number;
  // Multi-month mode (transactions screen): empty array = all time
  months?: MonthFilter[];
  categoryId?: string;
  searchQuery?: string;
}

export interface TransactionSection {
  title: string;
  data: Transaction[];
}

export function useTransactions({ month, year, months, categoryId, searchQuery }: UseTransactionsOptions) {
  const allTransactions = useLumaStore(s => s.transactions);

  const filtered = useMemo(() => {
    return allTransactions
      .filter(t => {
        if (months !== undefined) {
          if (months.length > 0) {
            const d = new Date(t.date);
            const tMonth = d.getMonth() + 1;
            const tYear = d.getFullYear();
            if (!months.some(m => m.month === tMonth && m.year === tYear)) return false;
          }
          // months.length === 0 → all time, no date filter
        } else if (month !== undefined && year !== undefined) {
          const start = startOfMonth(month, year);
          const end = endOfMonth(month, year);
          if (t.date < start || t.date > end) return false;
        }

        if (categoryId && t.categoryId !== categoryId) return false;
        if (searchQuery?.trim()) {
          return t.merchant.toLowerCase().includes(searchQuery.trim().toLowerCase());
        }
        return true;
      })
      .sort((a, b) => b.date - a.date);
  }, [allTransactions, months, month, year, categoryId, searchQuery]);

  const sections = useMemo<TransactionSection[]>(() => {
    const map: Record<string, Transaction[]> = {};
    for (const t of filtered) {
      const label = formatDateLabel(t.date);
      if (!map[label]) map[label] = [];
      map[label].push(t);
    }
    return Object.entries(map).map(([title, data]) => ({ title, data }));
  }, [filtered]);

  const total = useMemo(
    () => filtered.reduce((sum, t) => sum + t.amount, 0),
    [filtered]
  );

  return { transactions: filtered, sections, total };
}
