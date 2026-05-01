import { create } from 'zustand';
import { seedCategories } from './seed';
import { Storage } from './storage';
import type { Budget, Category, Settings, Transaction } from './types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface LumaStore {
  isLoaded: boolean;
  transactions: Transaction[];
  budgets: Budget[];
  categories: Category[];
  settings: Settings;

  initialize: () => Promise<void>;

  // Transactions
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => Promise<Transaction>;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Budgets
  addBudget: (data: Omit<Budget, 'id' | 'createdAt'>) => Promise<Budget>;
  updateBudget: (id: string, updates: Partial<Omit<Budget, 'id' | 'createdAt'>>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  // Categories
  addCategory: (data: Omit<Category, 'id' | 'isDefault'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Omit<Category, 'id' | 'isDefault'>>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Settings
  getSetting: (key: string) => string | null;
  setSetting: (key: string, value: string) => Promise<void>;

  // Reset
  resetData: () => Promise<void>;
}

export const useLumaStore = create<LumaStore>((set, get) => ({
  isLoaded: false,
  transactions: [],
  budgets: [],
  categories: [],
  settings: {},

  initialize: async () => {
    const { transactions, budgets, categories, settings } = await Storage.loadAll();

    let finalCategories = categories;
    
    if (categories.length === 0) {
      finalCategories = await seedCategories();
    }

    set({ transactions, budgets, categories: finalCategories, settings, isLoaded: true });
  },

  // ── Transactions ──────────────────────────────────────────────────────────

  addTransaction: async (data) => {
    const tx: Transaction = { ...data, id: generateId(), createdAt: Date.now() };
    const transactions = [...get().transactions, tx];
    set({ transactions });
    await Storage.saveTransactions(transactions);
    return tx;
  },

  updateTransaction: async (id, updates) => {
    const transactions = get().transactions.map(t =>
      t.id === id ? { ...t, ...updates } : t
    );
    set({ transactions });
    await Storage.saveTransactions(transactions);
  },

  deleteTransaction: async (id) => {
    const transactions = get().transactions.filter(t => t.id !== id);
    set({ transactions });
    await Storage.saveTransactions(transactions);
  },

  // ── Budgets ───────────────────────────────────────────────────────────────

  addBudget: async (data) => {
    const budget: Budget = { ...data, id: generateId(), createdAt: Date.now() };
    const budgets = [...get().budgets, budget];
    set({ budgets });
    await Storage.saveBudgets(budgets);
    return budget;
  },

  updateBudget: async (id, updates) => {
    const budgets = get().budgets.map(b =>
      b.id === id ? { ...b, ...updates } : b
    );
    set({ budgets });
    await Storage.saveBudgets(budgets);
  },

  deleteBudget: async (id) => {
    const budgets = get().budgets.filter(b => b.id !== id);
    set({ budgets });
    await Storage.saveBudgets(budgets);
  },

  // ── Categories ────────────────────────────────────────────────────────────

  addCategory: async (data) => {
    const category: Category = { ...data, id: generateId(), isDefault: false };
    const categories = [...get().categories, category];
    set({ categories });
    await Storage.saveCategories(categories);
    return category;
  },

  updateCategory: async (id, updates) => {
    const categories = get().categories.map(c =>
      c.id === id ? { ...c, ...updates } : c
    );
    set({ categories });
    await Storage.saveCategories(categories);
  },

  deleteCategory: async (id) => {
    const categories = get().categories.filter(c => c.id !== id);
    set({ categories });
    await Storage.saveCategories(categories);
  },

  // ── Settings ──────────────────────────────────────────────────────────────

  getSetting: (key) => get().settings[key] ?? null,

  setSetting: async (key, value) => {
    const settings = { ...get().settings, [key]: value };
    set({ settings });
    await Storage.saveSettings(settings);
  },

  // ── Reset ─────────────────────────────────────────────────────────────────

  resetData: async () => {
    await Storage.clearAll();
    set({ transactions: [], budgets: []});
  },
}));
