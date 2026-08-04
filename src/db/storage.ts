import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Transaction, Budget, BudgetOverride, BudgetRule, Category, Settings, Workspace } from './types';

const KEYS = {
  TRANSACTIONS: '@luma/transactions',
  BUDGETS: '@luma/budgets',
  CATEGORIES: '@luma/categories',
  SETTINGS: '@luma/settings',
  HAS_LAUNCHED: '@luma/has_launched',
  WORKSPACES: '@luma/workspaces',
  CURRENT_WORKSPACE_ID: '@luma/currentWorkspaceId',
} as const;

function wsKeys(wsId: string) {
  return {
    TRANSACTIONS: `@luma/ws/${wsId}/transactions`,
    BUDGETS: `@luma/ws/${wsId}/budgets`,
    BUDGET_RULES: `@luma/ws/${wsId}/budgetRules`,
    BUDGET_OVERRIDES: `@luma/ws/${wsId}/budgetOverrides`,
    BUDGET_MIGRATION_BACKUP: `@luma/ws/${wsId}/budgetMigrationBackup`,
    CATEGORIES: `@luma/ws/${wsId}/categories`,
  };
}

async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function setJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const Storage = {
  // ── Workspace list ────────────────────────────────────────────────────────

  async getWorkspaces(): Promise<Workspace[]> {
    return getJSON<Workspace[]>(KEYS.WORKSPACES, []);
  },
  async saveWorkspaces(workspaces: Workspace[]): Promise<void> {
    return setJSON(KEYS.WORKSPACES, workspaces);
  },

  async getCurrentWorkspaceId(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.CURRENT_WORKSPACE_ID);
  },
  async saveCurrentWorkspaceId(id: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.CURRENT_WORKSPACE_ID, id);
  },

  // ── Per-workspace data ────────────────────────────────────────────────────

  async getTransactionsFor(wsId: string): Promise<Transaction[]> {
    return getJSON<Transaction[]>(wsKeys(wsId).TRANSACTIONS, []);
  },
  async saveTransactionsFor(wsId: string, transactions: Transaction[]): Promise<void> {
    return setJSON(wsKeys(wsId).TRANSACTIONS, transactions);
  },

  async getBudgetsFor(wsId: string): Promise<Budget[]> {
    return getJSON<Budget[]>(wsKeys(wsId).BUDGETS, []);
  },
  async saveBudgetsFor(wsId: string, budgets: Budget[]): Promise<void> {
    return setJSON(wsKeys(wsId).BUDGETS, budgets);
  },

  async getBudgetRulesFor(wsId: string): Promise<BudgetRule[]> {
    return getJSON<BudgetRule[]>(wsKeys(wsId).BUDGET_RULES, []);
  },
  async saveBudgetRulesFor(wsId: string, rules: BudgetRule[]): Promise<void> {
    return setJSON(wsKeys(wsId).BUDGET_RULES, rules);
  },

  async getBudgetOverridesFor(wsId: string): Promise<BudgetOverride[]> {
    return getJSON<BudgetOverride[]>(wsKeys(wsId).BUDGET_OVERRIDES, []);
  },
  async saveBudgetOverridesFor(wsId: string, overrides: BudgetOverride[]): Promise<void> {
    return setJSON(wsKeys(wsId).BUDGET_OVERRIDES, overrides);
  },

  async getCategoriesFor(wsId: string): Promise<Category[]> {
    return getJSON<Category[]>(wsKeys(wsId).CATEGORIES, []);
  },
  async saveCategoriesFor(wsId: string, categories: Category[]): Promise<void> {
    return setJSON(wsKeys(wsId).CATEGORIES, categories);
  },

  async loadAllFor(wsId: string): Promise<{
    transactions: Transaction[];
    budgets: Budget[];
    budgetRules: BudgetRule[];
    budgetOverrides: BudgetOverride[];
    categories: Category[];
  }> {
    const [transactions, budgets, budgetRules, budgetOverrides, categories] = await Promise.all([
      this.getTransactionsFor(wsId),
      this.getBudgetsFor(wsId),
      this.getBudgetRulesFor(wsId),
      this.getBudgetOverridesFor(wsId),
      this.getCategoriesFor(wsId),
    ]);
    return { transactions, budgets, budgetRules, budgetOverrides, categories };
  },

  async migrateBudgetsToRecurring(wsId: string): Promise<void> {
    const [legacyBudgets, existingRules, existingOverrides] = await Promise.all([
      this.getBudgetsFor(wsId),
      this.getBudgetRulesFor(wsId),
      this.getBudgetOverridesFor(wsId),
    ]);

    if (legacyBudgets.length === 0 || existingRules.length > 0 || existingOverrides.length > 0) {
      return;
    }

    const latestByCategory = new Map<string, Budget>();
    legacyBudgets.forEach(budget => {
      const current = latestByCategory.get(budget.categoryId);
      const currentRank = current ? current.year * 12 + current.month : -1;
      const nextRank = budget.year * 12 + budget.month;
      if (!current || nextRank > currentRank || (nextRank === currentRank && budget.createdAt > current.createdAt)) {
        latestByCategory.set(budget.categoryId, budget);
      }
    });

    const now = Date.now();
    const rules: BudgetRule[] = Array.from(latestByCategory.values())
      .filter(budget => budget.amount > 0)
      .map(budget => ({
        id: `rule-${budget.id}`,
        workspaceId: wsId,
        categoryId: budget.categoryId,
        amount: budget.amount,
        startsMonth: budget.month,
        startsYear: budget.year,
        createdAt: budget.createdAt,
        updatedAt: now,
      }));

    const latestAmountByCategory = new Map(
      Array.from(latestByCategory.entries()).map(([categoryId, budget]) => [categoryId, budget.amount])
    );
    const overrides: BudgetOverride[] = legacyBudgets
      .filter(budget => {
        const latestAmount = latestAmountByCategory.get(budget.categoryId);
        return budget.amount > 0 && latestAmount !== undefined && budget.amount !== latestAmount;
      })
      .map(budget => ({
        id: `override-${budget.id}`,
        workspaceId: wsId,
        categoryId: budget.categoryId,
        month: budget.month,
        year: budget.year,
        amount: budget.amount,
        createdAt: budget.createdAt,
        updatedAt: now,
      }));

    await Promise.all([
      setJSON(wsKeys(wsId).BUDGET_MIGRATION_BACKUP, legacyBudgets),
      this.saveBudgetRulesFor(wsId, rules),
      this.saveBudgetOverridesFor(wsId, overrides),
      AsyncStorage.removeItem(wsKeys(wsId).BUDGETS),
    ]);
  },

  // ── Migration from flat keys to workspace-namespaced keys ─────────────────
  // Returns true if old data was found and migrated.

  async migrateToWorkspace(wsId: string): Promise<boolean> {
    const [oldTxs, oldBudgets, oldCats] = await Promise.all([
      getJSON<Transaction[]>(KEYS.TRANSACTIONS, []),
      getJSON<Budget[]>(KEYS.BUDGETS, []),
      getJSON<Category[]>(KEYS.CATEGORIES, []),
    ]);

    const hasData = oldTxs.length > 0 || oldBudgets.length > 0 || oldCats.length > 0;
    if (!hasData) return false;

    await Promise.all([
      setJSON(wsKeys(wsId).TRANSACTIONS, oldTxs),
      setJSON(wsKeys(wsId).BUDGETS, oldBudgets),
      setJSON(wsKeys(wsId).CATEGORIES, oldCats),
    ]);
    await AsyncStorage.multiRemove([KEYS.TRANSACTIONS, KEYS.BUDGETS, KEYS.CATEGORIES]);
    return true;
  },

  // ── Settings (global) ─────────────────────────────────────────────────────

  async getSettings(): Promise<Settings> {
    return getJSON<Settings>(KEYS.SETTINGS, {});
  },
  async saveSettings(settings: Settings): Promise<void> {
    return setJSON(KEYS.SETTINGS, settings);
  },

  // ── Misc ──────────────────────────────────────────────────────────────────

  async hasLaunched(): Promise<boolean> {
    const val = await AsyncStorage.getItem(KEYS.HAS_LAUNCHED);
    return val === 'true';
  },

  async markLaunched(): Promise<void> {
    await AsyncStorage.setItem(KEYS.HAS_LAUNCHED, 'true');
  },

  async clearAll(): Promise<void> {
    const wsId = await this.getCurrentWorkspaceId();
    if (wsId) {
      await AsyncStorage.multiRemove([
        wsKeys(wsId).TRANSACTIONS,
        wsKeys(wsId).BUDGETS,
        wsKeys(wsId).BUDGET_RULES,
        wsKeys(wsId).BUDGET_OVERRIDES,
      ]);
    }
  },

  async resetApp(): Promise<void> {
    await AsyncStorage.clear();
  },

  // ── Legacy flat getters (kept for migration path only) ────────────────────

  async getTransactions(): Promise<Transaction[]> {
    return getJSON<Transaction[]>(KEYS.TRANSACTIONS, []);
  },
  async getBudgets(): Promise<Budget[]> {
    return getJSON<Budget[]>(KEYS.BUDGETS, []);
  },
  async getCategories(): Promise<Category[]> {
    return getJSON<Category[]>(KEYS.CATEGORIES, []);
  },

  async loadAll(): Promise<{ transactions: Transaction[]; budgets: Budget[]; categories: Category[]; settings: Settings }> {
    const [transactions, budgets, categories, settings] = await Promise.all([
      this.getTransactions(),
      this.getBudgets(),
      this.getCategories(),
      this.getSettings(),
    ]);
    return { transactions, budgets, categories, settings };
  },
};
