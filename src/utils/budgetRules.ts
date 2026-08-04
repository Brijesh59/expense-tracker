import type { Budget, BudgetOverride, BudgetRule } from '@/db/types';

function monthIndex(month: number, year: number): number {
  return year * 12 + month;
}

export function isBudgetRuleActive(rule: BudgetRule, month: number, year: number): boolean {
  const selected = monthIndex(month, year);
  const starts = monthIndex(rule.startsMonth, rule.startsYear);
  const ends = rule.endsMonth && rule.endsYear
    ? monthIndex(rule.endsMonth, rule.endsYear)
    : Number.POSITIVE_INFINITY;

  return selected >= starts && selected <= ends;
}

export function buildEffectiveBudgets(
  workspaceId: string,
  rules: BudgetRule[],
  overrides: BudgetOverride[],
  month: number,
  year: number
): Budget[] {
  const rulesByCategory = new Map<string, BudgetRule>();

  rules
    .filter(rule => rule.workspaceId === workspaceId && rule.amount > 0 && isBudgetRuleActive(rule, month, year))
    .sort((a, b) => {
      const byStart = monthIndex(b.startsMonth, b.startsYear) - monthIndex(a.startsMonth, a.startsYear);
      return byStart || b.createdAt - a.createdAt;
    })
    .forEach(rule => {
      if (!rulesByCategory.has(rule.categoryId)) {
        rulesByCategory.set(rule.categoryId, rule);
      }
    });

  const overridesByCategory = new Map<string, BudgetOverride>();
  overrides
    .filter(override =>
      override.workspaceId === workspaceId &&
      override.amount >= 0 &&
      override.month === month &&
      override.year === year
    )
    .sort((a, b) => b.createdAt - a.createdAt)
    .forEach(override => {
      if (!overridesByCategory.has(override.categoryId)) {
        overridesByCategory.set(override.categoryId, override);
      }
    });

  const categoryIds = new Set<string>([
    ...Array.from(rulesByCategory.keys()),
    ...Array.from(overridesByCategory.keys()),
  ]);

  return Array.from(categoryIds).flatMap<Budget>(categoryId => {
    const rule = rulesByCategory.get(categoryId);
    const override = overridesByCategory.get(categoryId);

    if (override) {
      if (override.amount <= 0) {
        return [];
      }

      return [{
        id: override.id,
        categoryId,
        amount: override.amount,
        month,
        year,
        createdAt: override.createdAt,
        ruleId: rule?.id,
        overrideId: override.id,
        isOverride: true,
      }];
    }

    return [{
      id: rule!.id,
      categoryId,
      amount: rule!.amount,
      month,
      year,
      createdAt: rule!.createdAt,
      ruleId: rule!.id,
      isOverride: false,
    }];
  });
}
