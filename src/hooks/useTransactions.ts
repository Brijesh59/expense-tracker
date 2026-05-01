import { useMemo } from 'react';
import { useLumaStore } from '@/db/store';
import type { Transaction } from '@/db/types';
import { startOfMonth, endOfMonth, formatDateLabel } from '@/utils/dates';

interface UseTransactionsOptions {
  month: number;
  year: number;
  categoryId?: string;
  searchQuery?: string;
}

export interface TransactionSection {
  title: string;
  data: Transaction[];
}

export function useTransactions({ month, year, categoryId, searchQuery }: UseTransactionsOptions) {
  const allTransactions = useLumaStore(s => s.transactions);

  const start = startOfMonth(month, year);
  const end = endOfMonth(month, year);

  const filtered = useMemo(() => {
    return allTransactions
      .filter(t => {
        if (t.date < start || t.date > end) return false;
        if (categoryId && t.categoryId !== categoryId) return false;
        if (searchQuery?.trim()) {
          return t.merchant.toLowerCase().includes(searchQuery.trim().toLowerCase());
        }
        return true;
      })
      .sort((a, b) => b.date - a.date);
  }, [allTransactions, start, end, categoryId, searchQuery]);

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
