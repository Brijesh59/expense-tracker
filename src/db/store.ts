import { create } from 'zustand';
import { seedCategories, seedBudgets } from './seed';
import { Storage } from './storage';
import type { Budget, Category, Settings, Transaction, Workspace } from './types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface LumaStore {
  isLoaded: boolean;
  workspaces: Workspace[];
  currentWorkspaceId: string;
  transactions: Transaction[];
  budgets: Budget[];
  categories: Category[];
  settings: Settings;

  initialize: () => Promise<void>;

  // Workspaces
  addWorkspace: (data: { name: string }) => Promise<Workspace>;
  switchWorkspace: (id: string) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;

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
  workspaces: [],
  currentWorkspaceId: 'personal',
  transactions: [],
  budgets: [],
  categories: [],
  settings: {},

  initialize: async () => {
    const settings = await Storage.getSettings();
    let workspaces = await Storage.getWorkspaces();
    let currentWorkspaceId = await Storage.getCurrentWorkspaceId();

    // First-time setup (new install or update from pre-workspace build)
    if (workspaces.length === 0) {
      const ws: Workspace = { id: 'personal', name: 'Personal', createdAt: Date.now() };
      workspaces = [ws];
      currentWorkspaceId = ws.id;

      const migrated = await Storage.migrateToWorkspace(ws.id);
      if (!migrated) {
        await seedCategories(ws.id);
        await seedBudgets(ws.id);
      }

      await Storage.saveWorkspaces(workspaces);
      await Storage.saveCurrentWorkspaceId(ws.id);
    }

    if (!currentWorkspaceId) currentWorkspaceId = workspaces[0].id;

    const { transactions, budgets, categories } = await Storage.loadAllFor(currentWorkspaceId);
    set({ workspaces, currentWorkspaceId, transactions, budgets, categories, settings, isLoaded: true });
  },

  // ── Workspaces ────────────────────────────────────────────────────────────

  addWorkspace: async (data) => {
    const ws: Workspace = { ...data, id: generateId(), createdAt: Date.now() };
    const workspaces = [...get().workspaces, ws];
    await Storage.saveWorkspaces(workspaces);
    await seedCategories(ws.id);
    await seedBudgets(ws.id);
    set({ workspaces });
    return ws;
  },

  switchWorkspace: async (id) => {
    await Storage.saveCurrentWorkspaceId(id);
    const { transactions, budgets, categories } = await Storage.loadAllFor(id);
    set({ currentWorkspaceId: id, transactions, budgets, categories });
  },

  deleteWorkspace: async (id) => {
    const workspaces = get().workspaces;
    if (workspaces.length <= 1) return;
    const next = workspaces.filter(w => w.id !== id);
    await Storage.saveWorkspaces(next);
    set({ workspaces: next });
    if (get().currentWorkspaceId === id) {
      await get().switchWorkspace(next[0].id);
    }
  },

  // ── Transactions ──────────────────────────────────────────────────────────

  addTransaction: async (data) => {
    const tx: Transaction = { ...data, id: generateId(), createdAt: Date.now() };
    const transactions = [...get().transactions, tx];
    set({ transactions });
    await Storage.saveTransactionsFor(get().currentWorkspaceId, transactions);
    return tx;
  },

  updateTransaction: async (id, updates) => {
    const transactions = get().transactions.map(t =>
      t.id === id ? { ...t, ...updates } : t
    );
    set({ transactions });
    await Storage.saveTransactionsFor(get().currentWorkspaceId, transactions);
  },

  deleteTransaction: async (id) => {
    const transactions = get().transactions.filter(t => t.id !== id);
    set({ transactions });
    await Storage.saveTransactionsFor(get().currentWorkspaceId, transactions);
  },

  // ── Budgets ───────────────────────────────────────────────────────────────

  addBudget: async (data) => {
    const budget: Budget = { ...data, id: generateId(), createdAt: Date.now() };
    const budgets = [...get().budgets, budget];
    set({ budgets });
    await Storage.saveBudgetsFor(get().currentWorkspaceId, budgets);
    return budget;
  },

  updateBudget: async (id, updates) => {
    const budgets = get().budgets.map(b =>
      b.id === id ? { ...b, ...updates } : b
    );
    set({ budgets });
    await Storage.saveBudgetsFor(get().currentWorkspaceId, budgets);
  },

  deleteBudget: async (id) => {
    const budgets = get().budgets.filter(b => b.id !== id);
    set({ budgets });
    await Storage.saveBudgetsFor(get().currentWorkspaceId, budgets);
  },

  // ── Categories ────────────────────────────────────────────────────────────

  addCategory: async (data) => {
    const category: Category = { ...data, id: generateId(), isDefault: false };
    const categories = [...get().categories, category];
    set({ categories });
    await Storage.saveCategoriesFor(get().currentWorkspaceId, categories);
    return category;
  },

  updateCategory: async (id, updates) => {
    const categories = get().categories.map(c =>
      c.id === id ? { ...c, ...updates } : c
    );
    set({ categories });
    await Storage.saveCategoriesFor(get().currentWorkspaceId, categories);
  },

  deleteCategory: async (id) => {
    const categories = get().categories.filter(c => c.id !== id);
    set({ categories });
    await Storage.saveCategoriesFor(get().currentWorkspaceId, categories);
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
    set({ transactions: [], budgets: [] });
  },
}));
