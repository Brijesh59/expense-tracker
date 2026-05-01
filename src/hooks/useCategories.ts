import { useLumaStore } from '@/db/store';
import type { Category } from '@/db/types';

export function useCategories(): Category[] {
  return useLumaStore(s => s.categories);
}
