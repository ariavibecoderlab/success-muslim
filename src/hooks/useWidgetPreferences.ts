import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

export function useWidgetPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<WidgetPreference[]>(() => {
    const local = getLocal();
    return local.length > 0 ? local : getDefaultWidgetPreferences();
  });
  const [loading, setLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);

  // Load from DB
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    (async () => {
      const { data, error } = await supabase
        .from('widget_preferences')
        .select('widget_id, enabled, position, size')
        .eq('user_id', user.id)
        .order('position', { ascending: true });

      if (!error && data && data.length > 0) {
        // Merge with registry to catch new widgets added after user saved
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
        setPreferences(merged);
        saveLocal(merged);
        setIsFirstTime(false);
      } else if (!error && (!data || data.length === 0)) {
        setIsFirstTime(true);
        const defaults = getDefaultWidgetPreferences();
        setPreferences(defaults);
        saveLocal(defaults);
      }
      setLoading(false);
    })();
  }, [user]);

  const saveToDb = useCallback(async (prefs: WidgetPreference[]) => {
    if (!user) return;

    // Upsert all preferences
    const rows = prefs.map(p => ({
      user_id: user.id,
      widget_id: p.widget_id,
      enabled: p.enabled,
      position: p.position,
      size: p.size,
    }));

    await supabase
      .from('widget_preferences')
      .upsert(rows as any, { onConflict: 'user_id,widget_id' });
  }, [user]);

  const toggleWidget = useCallback((widgetId: string) => {
    setPreferences(prev => {
      const updated = prev.map(p =>
        p.widget_id === widgetId ? { ...p, enabled: !p.enabled } : p
      );
      saveLocal(updated);
      saveToDb(updated);
      return updated;
    });
  }, [saveToDb]);

  const resizeWidget = useCallback((widgetId: string, size: WidgetSize) => {
    setPreferences(prev => {
      const updated = prev.map(p =>
        p.widget_id === widgetId ? { ...p, size } : p
      );
      saveLocal(updated);
      saveToDb(updated);
      return updated;
    });
  }, [saveToDb]);

  const reorderWidgets = useCallback((newOrder: WidgetPreference[]) => {
    const reindexed = newOrder.map((p, i) => ({ ...p, position: i }));
    setPreferences(reindexed);
    saveLocal(reindexed);
    saveToDb(reindexed);
  }, [saveToDb]);

  const initializeDefaults = useCallback(async () => {
    const defaults = getDefaultWidgetPreferences();
    setPreferences(defaults);
    saveLocal(defaults);
    await saveToDb(defaults);
    setIsFirstTime(false);
  }, [saveToDb]);

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
