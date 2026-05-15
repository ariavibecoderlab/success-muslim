import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from './useAuth';
import { WIDGET_REGISTRY, getDefaultWidgetPreferences, type WidgetSize } from '@/lib/widget-registry';

export interface WidgetPreference {
  widget_id: string;
  enabled: boolean;
  position: number;
  size: string;
}

const LOCAL_KEY = 'widget_preferences';

function getLocal(): WidgetPreference[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocal(prefs: WidgetPreference[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(prefs));
}

async function fetchWidgetPrefs(userId: string): Promise<{ prefs: WidgetPreference[]; isFirstTime: boolean }> {
  try {
    const data = await api<WidgetPreference[]>('api-misc', {
      params: { resource: 'widget-prefs' },
    });

    if (data && data.length > 0) {
      const existingIds = new Set(data.map(d => d.widget_id));
      const merged = [
        ...data,
        ...WIDGET_REGISTRY
          .filter(w => !existingIds.has(w.id))
          .map(w => ({
            widget_id: w.id,
            enabled: false,
            position: w.defaultPosition + 100,
            size: w.defaultSize,
          })),
      ];
      saveLocal(merged);
      return { prefs: merged, isFirstTime: false };
    }
  } catch {
    // fall through to defaults
  }

  const defaults = getDefaultWidgetPreferences();
  saveLocal(defaults);
  return { prefs: defaults, isFirstTime: true };
}

export function useWidgetPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading: loading } = useQuery({
    queryKey: ['widget-prefs', user?.id],
    queryFn: () => fetchWidgetPrefs(user!.id),
    enabled: !!user,
    initialData: () => {
      const local = getLocal();
      return { prefs: local.length > 0 ? local : getDefaultWidgetPreferences(), isFirstTime: false };
    },
  });

  const preferences = data?.prefs ?? getDefaultWidgetPreferences();
  const isFirstTime = data?.isFirstTime ?? false;

  const saveToDb = useCallback(async (prefs: WidgetPreference[]) => {
    if (!user) return;
    await api('api-misc', {
      method: 'POST',
      params: { resource: 'widget-prefs' },
      body: { prefs },
    });
  }, [user]);

  const updatePrefs = useCallback((updater: (prev: WidgetPreference[]) => WidgetPreference[]) => {
    const updated = updater(preferences);
    saveLocal(updated);
    queryClient.setQueryData(['widget-prefs', user?.id], { prefs: updated, isFirstTime: false });
    saveToDb(updated);
  }, [preferences, queryClient, user?.id, saveToDb]);

  const toggleWidget = useCallback((widgetId: string) => {
    updatePrefs(prev => prev.map(p =>
      p.widget_id === widgetId ? { ...p, enabled: !p.enabled } : p
    ));
  }, [updatePrefs]);

  const resizeWidget = useCallback((widgetId: string, size: WidgetSize) => {
    updatePrefs(prev => prev.map(p =>
      p.widget_id === widgetId ? { ...p, size } : p
    ));
  }, [updatePrefs]);

  const reorderWidgets = useCallback((newOrder: WidgetPreference[]) => {
    const reindexed = newOrder.map((p, i) => ({ ...p, position: i }));
    updatePrefs(() => reindexed);
  }, [updatePrefs]);

  const setIsFirstTime = useCallback((val: boolean) => {
    queryClient.setQueryData(['widget-prefs', user?.id], (old: any) => ({
      ...old,
      isFirstTime: val,
    }));
  }, [queryClient, user?.id]);

  const initializeDefaults = useCallback(async () => {
    const defaults = getDefaultWidgetPreferences();
    saveLocal(defaults);
    queryClient.setQueryData(['widget-prefs', user?.id], { prefs: defaults, isFirstTime: false });
    await saveToDb(defaults);
  }, [saveToDb, queryClient, user?.id]);

  return {
    preferences,
    loading,
    isFirstTime,
    toggleWidget,
    resizeWidget,
    reorderWidgets,
    initializeDefaults,
    setIsFirstTime,
  };
}
