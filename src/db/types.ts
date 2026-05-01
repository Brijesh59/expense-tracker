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
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

export type Settings = Record<string, string>;
