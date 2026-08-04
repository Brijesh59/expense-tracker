export interface Transaction {
  id: string;
  amount: number;
  categoryId: string;
  merchant: string;
  date: number;
  paymentMethod: string;
  notes: string;
  createdAt: number;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  month: number;
  year: number;
  createdAt: number;
  ruleId?: string;
  overrideId?: string;
  isOverride?: boolean;
}

export interface BudgetRule {
  id: string;
  workspaceId: string;
  categoryId: string;
  amount: number;
  startsMonth: number;
  startsYear: number;
  endsMonth?: number;
  endsYear?: number;
  createdAt: number;
  updatedAt?: number;
}

export interface BudgetOverride {
  id: string;
  workspaceId: string;
  categoryId: string;
  month: number;
  year: number;
  amount: number;
  createdAt: number;
  updatedAt?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

export type Settings = Record<string, string>;

export interface Workspace {
  id: string;
  name: string;
  createdAt: number;
}
