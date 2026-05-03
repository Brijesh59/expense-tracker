import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Transaction, Budget, Category, Settings, Workspace } from './types';

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

  async getCategoriesFor(wsId: string): Promise<Category[]> {
    return getJSON<Category[]>(wsKeys(wsId).CATEGORIES, []);
  },
  async saveCategoriesFor(wsId: string, categories: Category[]): Promise<void> {
    return setJSON(wsKeys(wsId).CATEGORIES, categories);
  },

  async loadAllFor(wsId: string): Promise<{ transactions: Transaction[]; budgets: Budget[]; categories: Category[] }> {
    const [transactions, budgets, categories] = await Promise.all([
      this.getTransactionsFor(wsId),
      this.getBudgetsFor(wsId),
      this.getCategoriesFor(wsId),
    ]);
    return { transactions, budgets, categories };
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
      await AsyncStorage.multiRemove([wsKeys(wsId).TRANSACTIONS, wsKeys(wsId).BUDGETS]);
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
