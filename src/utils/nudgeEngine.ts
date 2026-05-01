import { nudges as copy } from '@/constants/copy';

export type NudgeType = 'good' | 'caution' | 'warning' | 'over' | 'neutral';

export interface NudgeResult {
  text: string;
  type: NudgeType;
}

export function computeNudge(params: {
  transactionAmount: number;
  categorySpentTotal: number;
  categoryBudget: number | null;
  categoryName: string;
  sameCategoryTodayCount: number;
}): NudgeResult {
  const { categoryBudget, categorySpentTotal, categoryName, sameCategoryTodayCount } = params;

  if (!categoryBudget || categoryBudget === 0) {
    return { text: copy.logged, type: 'neutral' };
  }

  // Frequency nudge overrides budget nudge
  if (sameCategoryTodayCount >= 3) {
    return {
      text: `That's your ${sameCategoryTodayCount}rd ${categoryName} expense today 👀`,
      type: 'caution',
    };
  }

  const ratio = categorySpentTotal / categoryBudget;

  if (ratio >= 1.0) {
    return { text: pick(copy.over), type: 'over' };
  }
  if (ratio >= 0.85) {
    return { text: pick(copy.warning), type: 'warning' };
  }
  if (ratio >= 0.65) {
    return { text: pick(copy.caution), type: 'caution' };
  }
  return { text: pick(copy.good), type: 'good' };
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
