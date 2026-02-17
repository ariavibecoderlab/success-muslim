import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';

interface Override {
  id: string;
  override_type: string;
  value: any;
}

interface EditModeContextType {
  isEditMode: boolean;
  toggleEditMode: () => void;
  isAdmin: boolean;
  overrides: Map<string, Override>;
  saveOverride: (elementKey: string, overrideType: string, value: any) => Promise<void>;
  deleteOverride: (elementKey: string, overrideType: string) => Promise<void>;
  getOverride: (elementKey: string, overrideType: string) => any | undefined;
  pageKey: string;
  loading: boolean;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

function derivePageKey(pathname: string): string {
  if (pathname === '/') return 'landing';
  return pathname.replace(/^\//, '').replace(/\//g, '-');
}

export const EditModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const { isAdmin } = useAdmin();
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [overrides, setOverrides] = useState<Map<string, Override>>(new Map());
  const [loading, setLoading] = useState(true);

  const pageKey = derivePageKey(pathname);

  // Fetch overrides for current page
  useEffect(() => {
    const fetchOverrides = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('page_overrides')
        .select('*')
        .eq('page', pageKey);

      if (!error && data) {
        const map = new Map<string, Override>();
        data.forEach((row: any) => {
          const key = `${row.element_key}::${row.override_type}`;
          map.set(key, { id: row.id, override_type: row.override_type, value: row.value });
        });
        setOverrides(map);
      }
      setLoading(false);
    };

    fetchOverrides();
  }, [pageKey]);

  // Turn off edit mode when navigating or if not admin
  useEffect(() => {
    if (!isAdmin) setIsEditMode(false);
  }, [isAdmin, pathname]);

  const toggleEditMode = useCallback(() => {
    if (isAdmin) setIsEditMode(prev => !prev);
  }, [isAdmin]);

  const getOverride = useCallback((elementKey: string, overrideType: string) => {
    const key = `${elementKey}::${overrideType}`;
    return overrides.get(key)?.value;
  }, [overrides]);

  const saveOverride = useCallback(async (elementKey: string, overrideType: string, value: any) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('page_overrides')
      .upsert(
        {
          page: pageKey,
          element_key: elementKey,
          override_type: overrideType,
          value,
          updated_by: user.id,
        },
        { onConflict: 'page,element_key,override_type' }
      )
      .select()
      .single();

    if (!error && data) {
      setOverrides(prev => {
        const next = new Map(prev);
        next.set(`${elementKey}::${overrideType}`, {
          id: (data as any).id,
          override_type: overrideType,
          value,
        });
        return next;
      });
    }
  }, [pageKey, user]);

  const deleteOverride = useCallback(async (elementKey: string, overrideType: string) => {
    const key = `${elementKey}::${overrideType}`;
    const existing = overrides.get(key);
    if (!existing) return;

    await supabase.from('page_overrides').delete().eq('id', existing.id);

    setOverrides(prev => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, [overrides]);

  return (
    <EditModeContext.Provider
      value={{
        isEditMode,
        toggleEditMode,
        isAdmin,
        overrides,
        saveOverride,
        deleteOverride,
        getOverride,
        pageKey,
        loading,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
};

export const useEditMode = () => {
  const context = useContext(EditModeContext);
  if (!context) {
    throw new Error('useEditMode must be used within an EditModeProvider');
  }
  return context;
};
