import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Transaction, Budget, Category, Settings } from './types';

const KEYS = {
  TRANSACTIONS: '@luma/transactions',
  BUDGETS: '@luma/budgets',
  CATEGORIES: '@luma/categories',
  SETTINGS: '@luma/settings',
  HAS_LAUNCHED: '@luma/has_launched',  // flat key, never cleared
} as const;

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
  async getTransactions(): Promise<Transaction[]> {
    return getJSON<Transaction[]>(KEYS.TRANSACTIONS, []);
  },
  async saveTransactions(transactions: Transaction[]): Promise<void> {
    return setJSON(KEYS.TRANSACTIONS, transactions);
  },

  async getBudgets(): Promise<Budget[]> {
    return getJSON<Budget[]>(KEYS.BUDGETS, []);
  },
  async saveBudgets(budgets: Budget[]): Promise<void> {
    return setJSON(KEYS.BUDGETS, budgets);
  },

  async getCategories(): Promise<Category[]> {
    return getJSON<Category[]>(KEYS.CATEGORIES, []);
  },
  async saveCategories(categories: Category[]): Promise<void> {
    return setJSON(KEYS.CATEGORIES, categories);
  },

  async getSettings(): Promise<Settings> {
    return getJSON<Settings>(KEYS.SETTINGS, {});
  },
  async saveSettings(settings: Settings): Promise<void> {
    return setJSON(KEYS.SETTINGS, settings);
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

  async hasLaunched(): Promise<boolean> {
    const val = await AsyncStorage.getItem(KEYS.HAS_LAUNCHED);
    return val === 'true';
  },

  async markLaunched(): Promise<void> {
    await AsyncStorage.setItem(KEYS.HAS_LAUNCHED, 'true');
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([
      KEYS.TRANSACTIONS,
      KEYS.BUDGETS,
    ]);
  },
};
