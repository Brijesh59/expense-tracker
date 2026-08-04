import { create } from 'zustand';
import { seedCategories, seedBudgets } from './seed';
import { Storage } from './storage';
import type { Budget, BudgetOverride, BudgetRule, Category, Settings, Transaction, Workspace } from './types';
import { buildEffectiveBudgets } from '@/utils/budgetRules';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const STARTER_WORKSPACES = ['Personal', 'Household', 'Japan Trip', 'Business', 'Family Support'];

function getCurrentBudgetMonth() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

function slugifyWorkspaceName(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || generateId();
}

async function ensureStarterWorkspaces(workspaces: Workspace[]): Promise<Workspace[]> {
  const existingNames = new Set(workspaces.map(ws => ws.name.toLowerCase()));
  const missing = STARTER_WORKSPACES.filter(name => !existingNames.has(name.toLowerCase()));

  if (missing.length === 0) {
    return workspaces;
  }

  const createdAt = Date.now();
  const additions = missing.map(name => ({
    id: slugifyWorkspaceName(name),
    name,
    createdAt,
  }));

  await Promise.all(additions.map(ws => seedCategories(ws.id)));
  const next = [...workspaces, ...additions];
  await Storage.saveWorkspaces(next);
  return next;
}

type BudgetScope = 'everyMonth' | 'thisMonth';

interface LumaStore {
  isLoaded: boolean;
  workspaces: Workspace[];
  currentWorkspaceId: string;
  transactions: Transaction[];
  budgets: Budget[];
  budgetRules: BudgetRule[];
  budgetOverrides: BudgetOverride[];
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
  addBudget: (data: Omit<Budget, 'id' | 'createdAt'>, options?: { scope?: BudgetScope }) => Promise<Budget>;
  updateBudget: (
    id: string,
    updates: Partial<Omit<Budget, 'id' | 'createdAt'>>,
    options?: { scope?: BudgetScope; month?: number; year?: number; categoryId?: string }
  ) => Promise<void>;
  deleteBudget: (id: string, options?: { scope?: BudgetScope; month?: number; year?: number; categoryId?: string }) => Promise<void>;
  addBudgetRule: (data: Omit<BudgetRule, 'id' | 'workspaceId' | 'createdAt'>) => Promise<BudgetRule>;
  updateBudgetRule: (id: string, updates: Partial<Omit<BudgetRule, 'id' | 'workspaceId' | 'createdAt'>>) => Promise<void>;
  deleteBudgetRule: (id: string) => Promise<void>;
  setBudgetOverride: (data: Omit<BudgetOverride, 'id' | 'workspaceId' | 'createdAt'>) => Promise<BudgetOverride>;
  deleteBudgetOverride: (id: string) => Promise<void>;
  getEffectiveBudgets: (month: number, year: number) => Budget[];
  getEffectiveBudget: (categoryId: string, month: number, year: number) => Budget | null;

  // Categories
  addCategory: (data: Omit<Category, 'id' | 'isDefault'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Omit<Category, 'id' | 'isDefault'>>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Settings
  getSetting: (key: string) => string | null;
  setSetting: (key: string, value: string) => Promise<void>;

  // Reset
  resetData: () => Promise<void>;
  resetAll: () => Promise<void>;
}

export const useLumaStore = create<LumaStore>((set, get) => ({
  isLoaded: false,
  workspaces: [],
  currentWorkspaceId: 'personal',
  transactions: [],
  budgets: [],
  budgetRules: [],
  budgetOverrides: [],
  categories: [],
  settings: {},

  initialize: async () => {
    const settings = await Storage.getSettings();
    let workspaces = await Storage.getWorkspaces();
    let currentWorkspaceId = await Storage.getCurrentWorkspaceId();

    // First-time setup (new install or update from pre-workspace build)
    if (workspaces.length === 0) {
      const createdAt = Date.now();
      workspaces = STARTER_WORKSPACES.map(name => ({
        id: slugifyWorkspaceName(name),
        name,
        createdAt,
      }));
      currentWorkspaceId = 'personal';

      const migrated = await Storage.migrateToWorkspace(currentWorkspaceId);
      if (!migrated) {
        await seedCategories(currentWorkspaceId);
        await seedBudgets(currentWorkspaceId);
      }

      await Promise.all(
        workspaces
          .filter(ws => ws.id !== currentWorkspaceId)
          .map(ws => seedCategories(ws.id))
      );
      await Storage.saveWorkspaces(workspaces);
      await Storage.saveCurrentWorkspaceId(currentWorkspaceId);
    } else {
      workspaces = await ensureStarterWorkspaces(workspaces);
    }

    if (!currentWorkspaceId) currentWorkspaceId = workspaces[0].id;

    await Storage.migrateBudgetsToRecurring(currentWorkspaceId);
    const { transactions, budgetRules, budgetOverrides, categories } = await Storage.loadAllFor(currentWorkspaceId);
    const { month, year } = getCurrentBudgetMonth();
    const budgets = buildEffectiveBudgets(currentWorkspaceId, budgetRules, budgetOverrides, month, year);
    set({ workspaces, currentWorkspaceId, transactions, budgets, budgetRules, budgetOverrides, categories, settings, isLoaded: true });
  },

  // ── Workspaces ────────────────────────────────────────────────────────────

  addWorkspace: async (data) => {
    const ws: Workspace = { ...data, id: generateId(), createdAt: Date.now() };
    const workspaces = [...get().workspaces, ws];
    await Storage.saveWorkspaces(workspaces);
    await seedCategories(ws.id);
    set({ workspaces });
    return ws;
  },

  switchWorkspace: async (id) => {
    await Storage.saveCurrentWorkspaceId(id);
    await Storage.migrateBudgetsToRecurring(id);
    const { transactions, budgetRules, budgetOverrides, categories } = await Storage.loadAllFor(id);
    const { month, year } = getCurrentBudgetMonth();
    const budgets = buildEffectiveBudgets(id, budgetRules, budgetOverrides, month, year);
    set({ currentWorkspaceId: id, transactions, budgets, budgetRules, budgetOverrides, categories });
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

  addBudget: async (data, options) => {
    const scope = options?.scope ?? 'everyMonth';
    if (scope === 'thisMonth') {
      return get().setBudgetOverride({
        categoryId: data.categoryId,
        amount: data.amount,
        month: data.month,
        year: data.year,
      });
    }

    const rule = await get().addBudgetRule({
      categoryId: data.categoryId,
      amount: data.amount,
      startsMonth: data.month,
      startsYear: data.year,
    });
    return {
      id: rule.id,
      categoryId: rule.categoryId,
      amount: rule.amount,
      month: data.month,
      year: data.year,
      createdAt: rule.createdAt,
      ruleId: rule.id,
      isOverride: false,
    };
  },

  updateBudget: async (id, updates, options) => {
    const state = get();
    const scope = options?.scope ?? 'everyMonth';
    const amount = updates.amount;
    const existingBudget = state.budgets.find(b => b.id === id);
    const categoryId = options?.categoryId ?? existingBudget?.categoryId;
    const month = options?.month ?? existingBudget?.month;
    const year = options?.year ?? existingBudget?.year;
    const existingRule = state.budgetRules.find(rule => rule.id === id || rule.id === existingBudget?.ruleId);
    const existingOverride = state.budgetOverrides.find(override => override.id === id || override.id === existingBudget?.overrideId);

    if (scope === 'thisMonth') {
      if (!categoryId || !month || !year || amount === undefined) return;
      const override = state.budgetOverrides.find(o =>
        o.categoryId === categoryId && o.month === month && o.year === year
      );
      if (override) {
        await get().setBudgetOverride({ ...override, amount });
      } else {
        await get().setBudgetOverride({ categoryId, amount, month, year });
      }
      return;
    }

    if (existingRule) {
      await get().updateBudgetRule(existingRule.id, { amount });
      return;
    }

    if (existingOverride && categoryId && month && year && amount !== undefined) {
      await get().addBudgetRule({ categoryId, amount, startsMonth: month, startsYear: year });
      return;
    }
  },

  deleteBudget: async (id, options) => {
    const state = get();
    const scope = options?.scope ?? 'everyMonth';
    const existingBudget = state.budgets.find(b => b.id === id);
    const ruleId = existingBudget?.ruleId ?? id;
    const overrideId = existingBudget?.overrideId ?? id;

    if (scope === 'thisMonth') {
      const override = state.budgetOverrides.find(o => o.id === overrideId);
      if (override) {
        await get().deleteBudgetOverride(override.id);
        return;
      }
      const categoryId = options?.categoryId ?? existingBudget?.categoryId;
      const month = options?.month ?? existingBudget?.month;
      const year = options?.year ?? existingBudget?.year;
      if (categoryId && month && year) {
        await get().setBudgetOverride({ categoryId, amount: 0, month, year });
      }
      return;
    }

    const rule = state.budgetRules.find(r => r.id === ruleId);
    if (rule) {
      await get().deleteBudgetRule(rule.id);
    }
  },

  addBudgetRule: async (data) => {
    const workspaceId = get().currentWorkspaceId;
    const existingRule = get().budgetRules.find(rule =>
      rule.categoryId === data.categoryId &&
      !rule.endsMonth &&
      !rule.endsYear
    );
    const now = Date.now();

    if (existingRule) {
      const updated = {
        ...existingRule,
        categoryId: data.categoryId,
        amount: data.amount,
        updatedAt: now,
      };
      const budgetRules = get().budgetRules.map(rule => rule.id === updated.id ? updated : rule);
      const { month, year } = getCurrentBudgetMonth();
      set({ budgetRules, budgets: buildEffectiveBudgets(workspaceId, budgetRules, get().budgetOverrides, month, year) });
      await Storage.saveBudgetRulesFor(workspaceId, budgetRules);
      return updated;
    }

    const rule: BudgetRule = { ...data, id: generateId(), workspaceId, createdAt: now };
    const budgetRules = [...get().budgetRules, rule];
    const { month, year } = getCurrentBudgetMonth();
    set({ budgetRules, budgets: buildEffectiveBudgets(workspaceId, budgetRules, get().budgetOverrides, month, year) });
    await Storage.saveBudgetRulesFor(workspaceId, budgetRules);
    return rule;
  },

  updateBudgetRule: async (id, updates) => {
    const workspaceId = get().currentWorkspaceId;
    const budgetRules = get().budgetRules.map(rule =>
      rule.id === id ? { ...rule, ...updates, updatedAt: Date.now() } : rule
    );
    const { month, year } = getCurrentBudgetMonth();
    set({ budgetRules, budgets: buildEffectiveBudgets(workspaceId, budgetRules, get().budgetOverrides, month, year) });
    await Storage.saveBudgetRulesFor(workspaceId, budgetRules);
  },

  deleteBudgetRule: async (id) => {
    const workspaceId = get().currentWorkspaceId;
    const budgetRules = get().budgetRules.filter(rule => rule.id !== id);
    const { month, year } = getCurrentBudgetMonth();
    set({ budgetRules, budgets: buildEffectiveBudgets(workspaceId, budgetRules, get().budgetOverrides, month, year) });
    await Storage.saveBudgetRulesFor(workspaceId, budgetRules);
  },

  setBudgetOverride: async (data) => {
    const workspaceId = get().currentWorkspaceId;
    const existing = 'id' in data
      ? get().budgetOverrides.find(override => override.id === data.id)
      : get().budgetOverrides.find(override =>
          override.categoryId === data.categoryId &&
          override.month === data.month &&
          override.year === data.year
        );
    const now = Date.now();
    const override: BudgetOverride = existing
      ? { ...existing, ...data, workspaceId, updatedAt: now }
      : { ...data, id: generateId(), workspaceId, createdAt: now };
    const budgetOverrides = existing
      ? get().budgetOverrides.map(item => item.id === override.id ? override : item)
      : [...get().budgetOverrides, override];
    const { month, year } = getCurrentBudgetMonth();
    set({ budgetOverrides, budgets: buildEffectiveBudgets(workspaceId, get().budgetRules, budgetOverrides, month, year) });
    await Storage.saveBudgetOverridesFor(workspaceId, budgetOverrides);
    return override;
  },

  deleteBudgetOverride: async (id) => {
    const workspaceId = get().currentWorkspaceId;
    const budgetOverrides = get().budgetOverrides.filter(override => override.id !== id);
    const { month, year } = getCurrentBudgetMonth();
    set({ budgetOverrides, budgets: buildEffectiveBudgets(workspaceId, get().budgetRules, budgetOverrides, month, year) });
    await Storage.saveBudgetOverridesFor(workspaceId, budgetOverrides);
  },

  getEffectiveBudgets: (month, year) => {
    const state = get();
    return buildEffectiveBudgets(state.currentWorkspaceId, state.budgetRules, state.budgetOverrides, month, year);
  },

  getEffectiveBudget: (categoryId, month, year) => {
    return get().getEffectiveBudgets(month, year).find(budget => budget.categoryId === categoryId) ?? null;
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
    set({ transactions: [], budgets: [], budgetRules: [], budgetOverrides: [] });
  },

  resetAll: async () => {
    await Storage.resetApp();
    set({
      isLoaded: false,
      workspaces: [],
      currentWorkspaceId: 'personal',
      transactions: [],
      budgets: [],
      budgetRules: [],
      budgetOverrides: [],
      categories: [],
      settings: {},
    });
  },
}));
