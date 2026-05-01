import { startOfMonth, endOfMonth, isSameDay, getLast7DayTimestamps } from './dates';

export interface SpendByCategory {
  categoryId: string;
  total: number;
}

export interface DailySpend {
  date: number;
  total: number;
}

export function groupByCategory(
  transactions: Array<{ categoryId: string; amount: number }>
): SpendByCategory[] {
  const map: Record<string, number> = {};
  for (const t of transactions) {
    map[t.categoryId] = (map[t.categoryId] ?? 0) + t.amount;
  }
  return Object.entries(map).map(([categoryId, total]) => ({ categoryId, total }));
}

export function groupByDay(
  transactions: Array<{ date: number; amount: number }>
): DailySpend[] {
  const map: Record<string, number> = {};
  for (const t of transactions) {
    const day = new Date(t.date).toDateString();
    map[day] = (map[day] ?? 0) + t.amount;
  }
  return Object.entries(map).map(([day, total]) => ({
    date: new Date(day).getTime(),
    total,
  }));
}

export function getLast7DaysSpend(
  transactions: Array<{ date: number; amount: number }>
): DailySpend[] {
  const days = getLast7DayTimestamps();
  return days.map(dayTs => {
    const total = transactions
      .filter(t => isSameDay(new Date(t.date), new Date(dayTs)))
      .reduce((sum, t) => sum + t.amount, 0);
    return { date: dayTs, total };
  });
}

export function getSpendPercentChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function getBudgetUsageRatio(spent: number, budget: number): number {
  if (budget === 0) return 0;
  return spent / budget;
}

export function getBudgetColor(ratio: number): string {
  if (ratio >= 1) return '#FF4444';
  if (ratio >= 0.85) return '#F8E71C';
  if (ratio >= 0.7) return '#F8E71C';
  return '#00C853';
}

export function getDailyBudgetPace(totalBudget: number, daysInMonth: number): number {
  return totalBudget / daysInMonth;
}
