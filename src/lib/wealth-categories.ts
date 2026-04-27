import {
  UtensilsCrossed, Home, Car, Heart, Gem, GraduationCap,
  Stethoscope, Clapperboard, Lightbulb, Shirt, Package,
  Briefcase, Laptop, Store, BarChart3, Gift,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface CategoryDef {
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

export const EXPENSE_CATEGORIES: CategoryDef[] = [
  { value: 'food', label: 'Food & Groceries', icon: UtensilsCrossed, color: 'hsl(25, 95%, 53%)' },
  { value: 'housing', label: 'Housing & Rent', icon: Home, color: 'hsl(210, 70%, 50%)' },
  { value: 'transport', label: 'Transport', icon: Car, color: 'hsl(45, 90%, 50%)' },
  { value: 'sadaqah', label: 'Sadaqah', icon: Heart, color: 'hsl(120, 61%, 34%)' },
  { value: 'zakat', label: 'Zakat', icon: Gem, color: 'hsl(160, 60%, 40%)' },
  { value: 'education', label: 'Education', icon: GraduationCap, color: 'hsl(270, 60%, 55%)' },
  { value: 'healthcare', label: 'Healthcare', icon: Stethoscope, color: 'hsl(0, 70%, 55%)' },
  { value: 'entertainment', label: 'Entertainment', icon: Clapperboard, color: 'hsl(300, 50%, 55%)' },
  { value: 'utilities', label: 'Utilities', icon: Lightbulb, color: 'hsl(50, 80%, 50%)' },
  { value: 'clothing', label: 'Clothing', icon: Shirt, color: 'hsl(190, 60%, 50%)' },
  { value: 'other', label: 'Other', icon: Package, color: 'hsl(0, 0%, 55%)' },
];

export const INCOME_CATEGORIES: CategoryDef[] = [
  { value: 'salary', label: 'Salary', icon: Briefcase, color: 'hsl(120, 50%, 40%)' },
  { value: 'freelance', label: 'Freelance', icon: Laptop, color: 'hsl(200, 60%, 50%)' },
  { value: 'business', label: 'Business', icon: Store, color: 'hsl(30, 70%, 50%)' },
  { value: 'investment', label: 'Investment Returns', icon: BarChart3, color: 'hsl(260, 50%, 55%)' },
  { value: 'gift', label: 'Gift / Hadiah', icon: Gift, color: 'hsl(340, 60%, 55%)' },
  { value: 'other', label: 'Other', icon: Package, color: 'hsl(0, 0%, 55%)' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getIncomeCategory(value: string): CategoryDef {
  return INCOME_CATEGORIES.find(c => c.value === value) ?? INCOME_CATEGORIES[INCOME_CATEGORIES.length - 1];
}
