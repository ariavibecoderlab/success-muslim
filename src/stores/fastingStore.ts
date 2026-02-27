import { create } from 'zustand';
import { getActiveIF, startIF, stopIF, type IFActive } from '@/lib/health-storage';

interface FastingStore {
  isActiveFast: boolean;
  activeFast: IFActive | null;
  elapsedSeconds: number;

  // Actions
  hydrate: () => void;
  startFast: (mode: string, fastingHours: number, customStartTime?: string) => void;
  endFast: (completed: boolean, endTimeOverride?: string) => void;
  tick: () => void;
}

export const useFastingStore = create<FastingStore>((set, get) => ({
  isActiveFast: false,
  activeFast: null,
  elapsedSeconds: 0,

  hydrate: () => {
    const active = getActiveIF();
    if (active) {
      const elapsed = Math.floor((Date.now() - new Date(active.startTime).getTime()) / 1000);
      set({ isActiveFast: true, activeFast: active, elapsedSeconds: Math.max(0, elapsed) });
    } else {
      set({ isActiveFast: false, activeFast: null, elapsedSeconds: 0 });
    }
  },

  startFast: (mode, fastingHours, customStartTime) => {
    startIF(mode, fastingHours, customStartTime);
    const active = getActiveIF();
    set({ isActiveFast: true, activeFast: active, elapsedSeconds: 0 });
  },

  endFast: (completed, endTimeOverride) => {
    stopIF(completed, endTimeOverride);
    set({ isActiveFast: false, activeFast: null, elapsedSeconds: 0 });
  },

  tick: () => {
    const { activeFast } = get();
    if (!activeFast) return;
    const elapsed = Math.floor((Date.now() - new Date(activeFast.startTime).getTime()) / 1000);
    set({ elapsedSeconds: Math.max(0, elapsed) });
  },
}));
