import { useState, useCallback } from 'react';

const LOCAL_KEY = 'quick_log_prefs';

const ALL_IDS = ['prayer', 'quran', 'dhikr', 'fast', 'water', 'sleep', 'tasks', 'habits'];

function getStored(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return ALL_IDS;
}

function save(ids: string[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(ids));
}

export function useQuickLogPreferences() {
  const [enabledIds, setEnabledIds] = useState<string[]>(getStored);

  const toggleItem = useCallback((id: string) => {
    setEnabledIds(prev => {
      const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      save(next);
      return next;
    });
  }, []);

  const reorder = useCallback((ids: string[]) => {
    setEnabledIds(ids);
    save(ids);
  }, []);

  return { enabledIds, allIds: ALL_IDS, toggleItem, reorder };
}
