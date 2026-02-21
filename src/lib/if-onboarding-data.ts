import {
  Flame, Heart, Brain, Moon, Zap,
  Sofa, PersonStanding, Activity, Dumbbell,
  UtensilsCrossed, Salad, BarChart3, Croissant,
  Clock,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface OnboardingOption {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
}

export const GOALS: OnboardingOption[] = [
  { id: 'lose_weight', label: 'Lose Weight', icon: Flame, description: 'Burn fat and reach your ideal weight' },
  { id: 'healthy_habits', label: 'Build Healthy Habits', icon: Heart, description: 'Develop a sustainable lifestyle' },
  { id: 'mental_clarity', label: 'Mental Clarity', icon: Brain, description: 'Sharpen focus and reduce brain fog' },
  { id: 'sunnah_fasting', label: 'Follow Sunnah Fasting', icon: Moon, description: 'Fast as the Prophet ﷺ did' },
  { id: 'boost_energy', label: 'Boost Energy', icon: Zap, description: 'Feel more energized throughout the day' },
];

export const EATING_HABITS: OnboardingOption[] = [
  { id: 'whatever', label: 'I eat whatever I want', icon: Croissant },
  { id: 'healthy', label: 'I try to eat healthy', icon: Salad },
  { id: 'calories', label: 'I count calories', icon: BarChart3 },
  { id: 'islamic', label: 'Islamic dietary guidelines', icon: Moon },
];

export const SLEEP_OPTIONS = ['< 5h', '5-6h', '6-7h', '7-8h', '> 8h'];

export const ACTIVITY_LEVELS: OnboardingOption[] = [
  { id: 'sedentary', label: 'Sedentary', description: 'Mostly sitting', icon: Sofa },
  { id: 'light', label: 'Lightly Active', description: 'Some walking', icon: PersonStanding },
  { id: 'moderate', label: 'Moderately Active', description: 'Regular exercise', icon: Activity },
  { id: 'active', label: 'Very Active', description: 'Exercise regularly', icon: Dumbbell },
];

export const FASTING_EXPERIENCE: OnboardingOption[] = [
  { id: 'first_time', label: 'First time', icon: Clock },
  { id: 'few_times', label: 'Tried a few times', icon: Activity },
  { id: 'regular', label: 'I fast regularly', icon: Flame },
  { id: 'sunnah', label: 'I do Sunnah fasting', icon: Moon },
];

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return +(weightKg / (heightM * heightM)).toFixed(1);
}

export function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: 'hsl(210, 80%, 55%)' };
  if (bmi < 25) return { label: 'Normal', color: 'hsl(142, 70%, 45%)' };
  if (bmi < 30) return { label: 'Overweight', color: 'hsl(38, 92%, 50%)' };
  if (bmi < 35) return { label: 'Obese', color: 'hsl(15, 85%, 50%)' };
  return { label: 'Severely Obese', color: 'hsl(0, 85%, 50%)' };
}

export function calculateTDEE(
  weightKg: number, heightCm: number, age: number, gender: string, activity: string
): number {
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  const multipliers: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
  return Math.round(bmr * (multipliers[activity] || 1.2));
}

export function recommendProtocol(experience: string, goal: string, activity: string): string {
  if (experience === 'first_time' || activity === 'sedentary') return '14:10';
  if (experience === 'sunnah') return '18:6';
  if (experience === 'regular' && (goal === 'lose_weight' || activity === 'active')) return '18:6';
  return '16:8';
}

export function estimateWeightLoss30Days(currentWeight: number, tdee: number, protocol: string): number {
  // Rough estimate: fasting creates ~15-25% caloric deficit
  const deficitPct = protocol === '18:6' ? 0.25 : protocol === '16:8' ? 0.20 : 0.15;
  const dailyDeficit = tdee * deficitPct;
  const totalDeficit = dailyDeficit * 30;
  // 7700 kcal ≈ 1 kg of fat
  return +(totalDeficit / 7700).toFixed(1);
}

export function getBMIPosition(bmi: number): number {
  // Map BMI to percentage position on the spectrum bar (15-40 range)
  const min = 15;
  const max = 40;
  return Math.min(100, Math.max(0, ((bmi - min) / (max - min)) * 100));
}
