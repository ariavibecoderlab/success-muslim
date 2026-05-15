import {
  Utensils, TrendingDown, Zap, Flame, Brain,
  BicepsFlexed, Recycle, Dumbbell, Sparkles, HeartPulse, Shield,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface FastingStage {
  level: number;
  startHours: number;
  endHours: number;
  name: string;
  description: string;
  islamicFraming: string;
  icon: LucideIcon;
}

export const FASTING_STAGES: FastingStage[] = [
  {
    level: 1, startHours: 0, endHours: 2, name: 'Fed State',
    description: 'Your body is digesting and absorbing nutrients from your last meal.',
    islamicFraming: 'Bismillah — your fast begins with intention.',
    icon: Utensils,
  },
  {
    level: 2, startHours: 2, endHours: 5, name: 'Blood Sugar Falls',
    description: 'Insulin is delivered into your bloodstream, bringing blood sugar back to normal levels.',
    islamicFraming: 'The Prophet ﷺ said: Fast and you will be healthy.',
    icon: TrendingDown,
  },
  {
    level: 3, startHours: 5, endHours: 8, name: 'Insulin Drops',
    description: 'Insulin levels drop significantly. Your body starts looking for alternative fuel.',
    islamicFraming: 'Patience (sabr) begins here — this is where the reward grows.',
    icon: Zap,
  },
  {
    level: 4, startHours: 8, endHours: 12, name: 'Fat Burning Begins',
    description: 'Glycogen stores are depleted. Your body switches to burning fat for energy.',
    islamicFraming: 'Subhanallah — your body is now using what Allah stored for times of need.',
    icon: Flame,
  },
  {
    level: 5, startHours: 12, endHours: 16, name: 'Ketosis Starts',
    description: 'Your liver produces ketones from fat. Brain fog clears. Mental clarity improves.',
    islamicFraming: 'This is the state of many Sahabah during long fasts — clear mind, strong focus for ibadah.',
    icon: Brain,
  },
  {
    level: 6, startHours: 16, endHours: 20, name: 'Deep Ketosis',
    description: 'Full ketosis. Your body is efficiently burning fat as primary fuel.',
    islamicFraming: 'You are now in the zone — the same state during Ramadan long fasts.',
    icon: BicepsFlexed,
  },
  {
    level: 7, startHours: 20, endHours: 24, name: 'Autophagy Begins',
    description: 'Your cells start cleaning house — removing damaged components and recycling them.',
    islamicFraming: 'Like taubah for your cells — Allah created the body to purify itself.',
    icon: Recycle,
  },
  {
    level: 8, startHours: 24, endHours: 36, name: 'Growth Hormone Surge',
    description: 'Growth hormone increases up to 5x. Muscle preservation and cellular repair accelerate.',
    islamicFraming: 'Puasa Nabi Daud — alternate day fasting that the Prophet ﷺ called the best fast.',
    icon: Dumbbell,
  },
  {
    level: 9, startHours: 36, endHours: 48, name: 'Deep Autophagy',
    description: 'Peak cellular cleaning. Damaged proteins are broken down and recycled.',
    islamicFraming: "The body's own form of internal cleansing — a gift from Allah.",
    icon: Sparkles,
  },
  {
    level: 10, startHours: 48, endHours: 60, name: 'Stem Cells Activate',
    description: 'Stem cell production increases. New healthy cells begin to replace old ones.',
    islamicFraming: 'SubhanAllah — renewal of the body, just as taubah renews the soul.',
    icon: HeartPulse,
  },
  {
    level: 11, startHours: 60, endHours: 72, name: 'Immune Cells Regenerate',
    description: 'Damaged immune cells are recycled. New immune cells regenerate rapidly.',
    islamicFraming: 'Allah said: Fast, for fasting is a shield. Now science confirms — it shields your immune system.',
    icon: Shield,
  },
];

export function getCurrentStage(elapsedHours: number): FastingStage {
  for (let i = FASTING_STAGES.length - 1; i >= 0; i--) {
    if (elapsedHours >= FASTING_STAGES[i].startHours) {
      return FASTING_STAGES[i];
    }
  }
  return FASTING_STAGES[0];
}

export function getNextStage(elapsedHours: number): { stage: FastingStage; hoursUntil: number } | null {
  const current = getCurrentStage(elapsedHours);
  const nextIdx = FASTING_STAGES.findIndex(s => s.level === current.level + 1);
  if (nextIdx === -1) return null;
  const next = FASTING_STAGES[nextIdx];
  return { stage: next, hoursUntil: Math.max(0, next.startHours - elapsedHours) };
}

export function getStageProgress(elapsedHours: number): number {
  const stage = getCurrentStage(elapsedHours);
  const duration = stage.endHours - stage.startHours;
  if (duration <= 0) return 100;
  const elapsed = elapsedHours - stage.startHours;
  return Math.min(100, (elapsed / duration) * 100);
}
