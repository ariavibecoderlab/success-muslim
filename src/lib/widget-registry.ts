import { lazy, type ComponentType } from 'react';

export type WidgetSize = 'small' | 'medium' | 'large';
export type WidgetModule = 'iman' | 'health' | 'wealth' | 'tasks' | 'dakwah';

export interface WidgetDefinition {
  id: string;
  label: string;
  icon: string; // lucide icon name
  module: WidgetModule;
  component: ComponentType<{ size: WidgetSize }>;
  defaultEnabled: boolean;
  defaultSize: WidgetSize;
  defaultPosition: number;
  smartVisibility?: () => boolean; // return false to auto-hide
  smartBadge?: string; // e.g. "Ramadan only"
}

// Lazy-load all widget components
const NextPrayerWidget = lazy(() => import('@/components/widgets/NextPrayerWidget'));
const DhikrSelawatWidget = lazy(() => import('@/components/widgets/DhikrSelawatWidget'));
const QuranTodayWidget = lazy(() => import('@/components/widgets/QuranTodayWidget'));
const SolatSunatWidget = lazy(() => import('@/components/widgets/SolatSunatWidget'));
const TarawihWidget = lazy(() => import('@/components/widgets/TarawihWidget'));
const IFFastingWidget = lazy(() => import('@/components/widgets/IFFastingWidget'));
const RamadanFastingWidget = lazy(() => import('@/components/widgets/RamadanFastingWidget'));
const HydrationWidget = lazy(() => import('@/components/widgets/HydrationWidget'));
const SleepWidget = lazy(() => import('@/components/widgets/SleepWidget'));
const SadaqahWidget = lazy(() => import('@/components/widgets/SadaqahWidget'));
const TasksTodayWidget = lazy(() => import('@/components/widgets/TasksTodayWidget'));
const DakwahWidget = lazy(() => import('@/components/widgets/DakwahWidget'));
const StepsWidget = lazy(() => import('@/components/widgets/StepsWidget'));

export const WIDGET_REGISTRY: WidgetDefinition[] = [
  {
    id: 'next_prayer',
    label: 'Next Prayer',
    icon: 'Clock',
    module: 'iman',
    component: NextPrayerWidget,
    defaultEnabled: true,
    defaultSize: 'medium',
    defaultPosition: 0,
  },
  {
    id: 'dhikr_selawat',
    label: 'Dhikr & Selawat',
    icon: 'HandHeart',
    module: 'iman',
    component: DhikrSelawatWidget,
    defaultEnabled: true,
    defaultSize: 'medium',
    defaultPosition: 1,
  },
  {
    id: 'quran_today',
    label: 'Quran Today',
    icon: 'BookOpen',
    module: 'iman',
    component: QuranTodayWidget,
    defaultEnabled: true,
    defaultSize: 'medium',
    defaultPosition: 2,
  },
  {
    id: 'solat_sunat',
    label: 'Solat Sunat',
    icon: 'Star',
    module: 'iman',
    component: SolatSunatWidget,
    defaultEnabled: false,
    defaultSize: 'medium',
    defaultPosition: 3,
  },
  {
    id: 'tarawih',
    label: 'Tarawih Tonight',
    icon: 'Moon',
    module: 'iman',
    component: TarawihWidget,
    defaultEnabled: false,
    defaultSize: 'medium',
    defaultPosition: 4,
    smartBadge: 'Ramadan only',
  },
  {
    id: 'if_fasting',
    label: 'IF Fasting',
    icon: 'Timer',
    module: 'health',
    component: IFFastingWidget,
    defaultEnabled: false,
    defaultSize: 'medium',
    defaultPosition: 5,
    smartBadge: 'Active fast only',
  },
  {
    id: 'ramadan_fasting',
    label: 'Ramadan Fasting',
    icon: 'Moon',
    module: 'health',
    component: RamadanFastingWidget,
    defaultEnabled: false,
    defaultSize: 'medium',
    defaultPosition: 6,
    smartBadge: 'Ramadan only',
  },
  {
    id: 'hydration',
    label: 'Hydration',
    icon: 'Droplets',
    module: 'health',
    component: HydrationWidget,
    defaultEnabled: true,
    defaultSize: 'medium',
    defaultPosition: 7,
  },
  {
    id: 'sleep',
    label: 'Sleep',
    icon: 'BedDouble',
    module: 'health',
    component: SleepWidget,
    defaultEnabled: false,
    defaultSize: 'medium',
    defaultPosition: 8,
  },
  {
    id: 'sadaqah',
    label: 'Sadaqah This Month',
    icon: 'Heart',
    module: 'wealth',
    component: SadaqahWidget,
    defaultEnabled: false,
    defaultSize: 'medium',
    defaultPosition: 9,
  },
  {
    id: 'tasks_today',
    label: 'Tasks Today',
    icon: 'ListChecks',
    module: 'tasks',
    component: TasksTodayWidget,
    defaultEnabled: true,
    defaultSize: 'medium',
    defaultPosition: 10,
  },
  {
    id: 'dakwah',
    label: "Da'wah Today",
    icon: 'Megaphone',
    module: 'dakwah',
    component: DakwahWidget,
    defaultEnabled: false,
    defaultSize: 'medium',
    defaultPosition: 11,
  },
  {
    id: 'steps_today',
    label: 'Steps Today',
    icon: 'Footprints',
    module: 'health',
    component: StepsWidget,
    defaultEnabled: false,
    defaultSize: 'medium',
    defaultPosition: 12,
  },
];

export function getWidgetById(id: string): WidgetDefinition | undefined {
  return WIDGET_REGISTRY.find(w => w.id === id);
}

export function getDefaultWidgetPreferences() {
  return WIDGET_REGISTRY.map(w => ({
    widget_id: w.id,
    enabled: w.defaultEnabled,
    position: w.defaultPosition,
    size: w.defaultSize as string,
  }));
}
