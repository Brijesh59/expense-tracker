export interface CategoryDefinition {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const DEFAULT_CATEGORIES: CategoryDefinition[] = [
  { id: 'food',          name: 'Food',          icon: '🍔', color: '#FF6B6B' },
  { id: 'transport',     name: 'Transport',     icon: '🚕', color: '#4ECDC4' },
  { id: 'shopping',      name: 'Shopping',      icon: '🛍️', color: '#F59E6B' },
  { id: 'bills',         name: 'Bills',         icon: '⚡',  color: '#7C6AF7' },
  { id: 'health',        name: 'Health',        icon: '💊', color: '#4FC3F7' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#BA68C8' },
  { id: 'travel',        name: 'Travel',        icon: '✈️', color: '#81C784' },
  { id: 'education',     name: 'Education',     icon: '📚', color: '#FFD54F' },
  { id: 'fitness',       name: 'Fitness',       icon: '🏋️', color: '#4ECDC4' },
  { id: 'coffee',        name: 'Coffee',        icon: '☕', color: '#A1887F' },
  { id: 'groceries',     name: 'Groceries',     icon: '🛒', color: '#66BB6A' },
  { id: 'other',         name: 'Other',         icon: '📦', color: '#8888A8' },
];
