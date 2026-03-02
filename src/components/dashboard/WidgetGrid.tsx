import { WIDGET_REGISTRY, type WidgetSize } from '@/lib/widget-registry';
import type { WidgetPreference } from '@/hooks/useWidgetPreferences';
import WidgetShell from '@/components/widgets/WidgetShell';

interface Props {
  preferences: WidgetPreference[];
  isRamadan: boolean;
  activeIF: any;
  loading: boolean;
}

function smartVisibilityCheck(widgetId: string, isRamadan: boolean, activeIF: any): boolean {
  switch (widgetId) {
    case 'tarawih':
    case 'ramadan_fasting':
      return isRamadan;
    case 'if_fasting':
      return !!activeIF;
    default:
      return true;
  }
}

export default function WidgetGrid({ preferences, isRamadan, activeIF, loading }: Props) {
  if (loading) return null;

  const visibleWidgets = preferences
    .filter(p => p.enabled && smartVisibilityCheck(p.widget_id, isRamadan, activeIF))
    .sort((a, b) => a.position - b.position);

  return (
    <div className="grid grid-cols-2 gap-3">
      {visibleWidgets.map((pref, idx) => {
        const def = WIDGET_REGISTRY.find(w => w.id === pref.widget_id);
        if (!def) return null;
        const WidgetComponent = def.component;

        return (
          <WidgetShell key={pref.widget_id} size={pref.size as WidgetSize} index={idx}>
            <WidgetComponent size={pref.size as WidgetSize} />
          </WidgetShell>
        );
      })}
    </div>
  );
}
