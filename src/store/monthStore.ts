import { create } from 'zustand';

interface MonthState {
  month: number;
  year: number;
  setMonth: (month: number, year: number) => void;
}

const now = new Date();

export const useMonthStore = create<MonthState>((set) => ({
  month: now.getMonth() + 1,
  year: now.getFullYear(),
  setMonth: (month, year) => set({ month, year }),
}));
