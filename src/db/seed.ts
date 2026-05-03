import { Storage } from './storage';
import type { Budget, Category } from './types';

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

const SEED_BUDGETS: Budget[] = [
  { id: "budget-rent", categoryId: "rent", amount: 25000, month: currentMonth, year: currentYear, createdAt: now },
  { id: "budget-society-maintenance", categoryId: "society-maintenance", amount: 2000, month: currentMonth, year: currentYear, createdAt: now },
  { id: "budget-electricity", categoryId: "electricity", amount: 3000, month: currentMonth, year: currentYear, createdAt: now },
  { id: "budget-water", categoryId: "water", amount: 0, month: currentMonth, year: currentYear, createdAt: now },
  { id: "budget-cooking-gas", categoryId: "cooking-gas", amount: 1500, month: currentMonth, year: currentYear, createdAt: now },
  { id: "budget-internet-broadband", categoryId: "internet-broadband", amount: 1000, month: currentMonth, year: currentYear, createdAt: now },
  { id: "budget-mobile-recharge", categoryId: "mobile-recharge", amount: 1000, month: currentMonth, year: currentYear, createdAt: now },
  { id: "budget-ott-subscriptions", categoryId: "ott-subscriptions", amount: 1000, month: currentMonth, year: currentYear, createdAt: now },
  { id: "budget-insurance-health", categoryId: "insurance-health", amount: 1500, month: currentMonth, year: currentYear, createdAt: now },
  { id: "budget-insurance-term", categoryId: "insurance-term", amount: 1500, month: currentMonth, year: currentYear, createdAt: now },
  { id: "budget-loan-emi", categoryId: "loan-emi", amount: 0, month: currentMonth, year: currentYear, createdAt: now },
  { id: "budget-grocery", categoryId: "grocery", amount: 6000, month: currentMonth, year: currentYear, createdAt: now },
  { id: "budget-milk", categoryId: "milk", amount: 2100, month: currentMonth, year: currentYear, createdAt: now },
  { id: "budget-fruits-vegetables", categoryId: "fruits-vegetables", amount: 1000, month: currentMonth, year: currentYear, createdAt: now },
  { id: "budget-household-supplies", categoryId: "household-supplies", amount: 1000, month: currentMonth, year: currentYear, createdAt: now },
  { id: "budget-local-transport", categoryId: "local-transport", amount: 2000, month: currentMonth, year: currentYear, createdAt: now },
  { id: "budget-medical-pharmacy", categoryId: "medical-pharmacy", amount: 1000, month: currentMonth, year: currentYear, createdAt: now },
  { id: "budget-family-support", categoryId: "family-support", amount: 15000, month: currentMonth, year: currentYear, createdAt: now },
  { id: "budget-house-help", categoryId: "house-help", amount: 0, month: currentMonth, year: currentYear, createdAt: now },
  { id: "budget-eating-out-dining", categoryId: "eating-out-dining", amount: 2500, month: currentMonth, year: currentYear, createdAt: now },
  { id: "budget-entertainment", categoryId: "entertainment", amount: 2000, month: currentMonth, year: currentYear, createdAt: now },
  { id: "budget-shopping", categoryId: "shopping", amount: 5000, month: currentMonth, year: currentYear, createdAt: now },
  { id: "budget-personal-care", categoryId: "personal-care", amount: 4000, month: currentMonth, year: currentYear, createdAt: now },
  { id: "budget-skin-care-items", categoryId: "skin-care-items", amount: 3000, month: currentMonth, year: currentYear, createdAt: now },
  { id: "budget-others", categoryId: "others", amount: 5000, month: currentMonth, year: currentYear, createdAt: now },
];

// Seeds categories and budgets into the given workspace on first launch.
export async function seedCategories(workspaceId: string): Promise<Category[]> {
  const seeded: Category[] = SEED_CATEGORIES.map(c => ({ ...c, isDefault: false }));

  await Storage.saveCategoriesFor(workspaceId, seeded);
  await Storage.saveBudgetsFor(workspaceId, SEED_BUDGETS);

  return seeded;
}
