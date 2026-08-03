import { Storage } from './storage';
import type { BudgetRule, Category } from './types';

const now = Date.now();
const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

const SEED_CATEGORIES: Omit<Category, "isDefault">[] = [
  { id: "rent", name: "Rent", icon: "🏠", color: "#7C6AF7" },
  { id: "society-maintenance", name: "Society Maintenance", icon: "🏢", color: "#8B5CF6" },
  { id: "electricity", name: "Electricity", icon: "⚡", color: "#FACC15" },
  { id: "water", name: "Water", icon: "💧", color: "#38BDF8" },
  { id: "cooking-gas", name: "Cooking Gas", icon: "🔥", color: "#F97316" },
  { id: "internet-broadband", name: "Internet (Broadband)", icon: "🌐", color: "#3B82F6" },
  { id: "mobile-recharge", name: "Mobile Recharge", icon: "📱", color: "#06B6D4" },
  { id: "ott-subscriptions", name: "OTT Subscriptions", icon: "📺", color: "#A855F7" },
  { id: "insurance-health", name: "Insurance (Health)", icon: "🛡️", color: "#10B981" },
  { id: "insurance-term", name: "Insurance (Term)", icon: "📄", color: "#14B8A6" },
  { id: "loan-emi", name: "Loan EMI", icon: "💳", color: "#EF4444" },
  { id: "grocery", name: "Grocery", icon: "🛒", color: "#22C55E" },
  { id: "milk", name: "Milk", icon: "🥛", color: "#60A5FA" },
  { id: "fruits-vegetables", name: "Fruits & Vegetables", icon: "🥦", color: "#84CC16" },
  { id: "household-supplies", name: "Household Supplies", icon: "🧽", color: "#F59E0B" },
  { id: "local-transport", name: "Local Transport", icon: "🚕", color: "#4ECDC4" },
  { id: "medical-pharmacy", name: "Medical/Pharmacy", icon: "💊", color: "#4FC3F7" },
  { id: "family-support", name: "Family Support", icon: "👨‍👩‍👧", color: "#EC4899" },
  { id: "house-help", name: "House Help", icon: "🧹", color: "#A1887F" },
  { id: "eating-out-dining", name: "Eating Out / Dining", icon: "🍽️", color: "#FF6B6B" },
  { id: "entertainment", name: "Entertainment", icon: "🎬", color: "#BA68C8" },
  { id: "shopping", name: "Shopping", icon: "🛍️", color: "#F59E6B" },
  { id: "personal-care", name: "Personal Care", icon: "💇", color: "#FB7185" },
  { id: "skin-care-items", name: "Skin care items", icon: "🧴", color: "#F9A8D4" },
  { id: "others", name: "Others", icon: "📦", color: "#8888A8" },
];

const SEED_BUDGET_RULES: BudgetRule[] = [
  { id: "rule-rent", workspaceId: "", categoryId: "rent", amount: 25000, startsMonth: currentMonth, startsYear: currentYear, createdAt: now },
  { id: "rule-society-maintenance", workspaceId: "", categoryId: "society-maintenance", amount: 2000, startsMonth: currentMonth, startsYear: currentYear, createdAt: now },
  { id: "rule-electricity", workspaceId: "", categoryId: "electricity", amount: 3000, startsMonth: currentMonth, startsYear: currentYear, createdAt: now },
  { id: "rule-cooking-gas", workspaceId: "", categoryId: "cooking-gas", amount: 1500, startsMonth: currentMonth, startsYear: currentYear, createdAt: now },
  { id: "rule-internet-broadband", workspaceId: "", categoryId: "internet-broadband", amount: 1000, startsMonth: currentMonth, startsYear: currentYear, createdAt: now },
  { id: "rule-mobile-recharge", workspaceId: "", categoryId: "mobile-recharge", amount: 1000, startsMonth: currentMonth, startsYear: currentYear, createdAt: now },
  { id: "rule-ott-subscriptions", workspaceId: "", categoryId: "ott-subscriptions", amount: 1000, startsMonth: currentMonth, startsYear: currentYear, createdAt: now },
  { id: "rule-insurance-health", workspaceId: "", categoryId: "insurance-health", amount: 1500, startsMonth: currentMonth, startsYear: currentYear, createdAt: now },
  { id: "rule-insurance-term", workspaceId: "", categoryId: "insurance-term", amount: 1500, startsMonth: currentMonth, startsYear: currentYear, createdAt: now },
  { id: "rule-grocery", workspaceId: "", categoryId: "grocery", amount: 6000, startsMonth: currentMonth, startsYear: currentYear, createdAt: now },
  { id: "rule-milk", workspaceId: "", categoryId: "milk", amount: 2100, startsMonth: currentMonth, startsYear: currentYear, createdAt: now },
  { id: "rule-fruits-vegetables", workspaceId: "", categoryId: "fruits-vegetables", amount: 1000, startsMonth: currentMonth, startsYear: currentYear, createdAt: now },
  { id: "rule-household-supplies", workspaceId: "", categoryId: "household-supplies", amount: 1000, startsMonth: currentMonth, startsYear: currentYear, createdAt: now },
  { id: "rule-local-transport", workspaceId: "", categoryId: "local-transport", amount: 2000, startsMonth: currentMonth, startsYear: currentYear, createdAt: now },
  { id: "rule-medical-pharmacy", workspaceId: "", categoryId: "medical-pharmacy", amount: 1000, startsMonth: currentMonth, startsYear: currentYear, createdAt: now },
  { id: "rule-family-support", workspaceId: "", categoryId: "family-support", amount: 15000, startsMonth: currentMonth, startsYear: currentYear, createdAt: now },
  { id: "rule-eating-out-dining", workspaceId: "", categoryId: "eating-out-dining", amount: 2500, startsMonth: currentMonth, startsYear: currentYear, createdAt: now },
  { id: "rule-entertainment", workspaceId: "", categoryId: "entertainment", amount: 2000, startsMonth: currentMonth, startsYear: currentYear, createdAt: now },
  { id: "rule-shopping", workspaceId: "", categoryId: "shopping", amount: 5000, startsMonth: currentMonth, startsYear: currentYear, createdAt: now },
  { id: "rule-personal-care", workspaceId: "", categoryId: "personal-care", amount: 4000, startsMonth: currentMonth, startsYear: currentYear, createdAt: now },
  { id: "rule-skin-care-items", workspaceId: "", categoryId: "skin-care-items", amount: 3000, startsMonth: currentMonth, startsYear: currentYear, createdAt: now },
  { id: "rule-others", workspaceId: "", categoryId: "others", amount: 5000, startsMonth: currentMonth, startsYear: currentYear, createdAt: now },
];

export async function seedCategories(workspaceId: string): Promise<Category[]> {
  const seeded: Category[] = SEED_CATEGORIES.map(c => ({ ...c, isDefault: false }));
  await Storage.saveCategoriesFor(workspaceId, seeded);
  return seeded;
}

export async function seedBudgets(workspaceId: string): Promise<void> {
  const rules = SEED_BUDGET_RULES.map(rule => ({
    ...rule,
    id: `${workspaceId}-${rule.id}`,
    workspaceId,
  }));
  await Storage.saveBudgetRulesFor(workspaceId, rules);
}
