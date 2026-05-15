import { useState } from 'react';
import { ArrowUp, ArrowDown, Settings2 } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { WIDGET_REGISTRY, type WidgetSize } from '@/lib/widget-registry';
import type { WidgetPreference } from '@/hooks/useWidgetPreferences';

interface WidgetCustomizerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: WidgetPreference[];
  onToggle: (widgetId: string) => void;
  onResize: (widgetId: string, size: WidgetSize) => void;
  onReorder: (newOrder: WidgetPreference[]) => void;
}

const MODULE_LABELS: Record<string, string> = {
  iman: '🕌 Iman',
  health: '💪 Health',
  wealth: '💰 Wealth',
  tasks: '✅ Tasks',
  dakwah: "📢 Da'wah",
};

const SIZE_OPTIONS: { value: WidgetSize; label: string }[] = [
  { value: 'small', label: 'S' },
  { value: 'medium', label: 'M' },
  { value: 'large', label: 'L' },
];

export default function WidgetCustomizer({
  open,
  onOpenChange,
  preferences,
  onToggle,
  onResize,
  onReorder,
}: WidgetCustomizerProps) {
  const sorted = [...preferences].sort((a, b) => a.position - b.position);

  const moveUp = (idx: number) => {
    if (idx <= 0) return;
    const newOrder = [...sorted];
    [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
    onReorder(newOrder);
  };

  const moveDown = (idx: number) => {
    if (idx >= sorted.length - 1) return;
    const newOrder = [...sorted];
    [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
    onReorder(newOrder);
  };

  // Group by module
  const modules = ['iman', 'health', 'wealth', 'tasks', 'dakwah'];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Customize Widgets
          </DrawerTitle>
          <p className="sr-only">Toggle, reorder, and resize your dashboard widgets</p>
        </DrawerHeader>

        <div className="px-4 pb-4 overflow-y-auto max-h-[60vh] space-y-5">
          {modules.map(mod => {
            const modWidgets = sorted.filter(p => {
              const def = WIDGET_REGISTRY.find(w => w.id === p.widget_id);
              return def?.module === mod;
            });
            if (modWidgets.length === 0) return null;

            return (
              <div key={mod}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {MODULE_LABELS[mod] || mod}
                </p>
                <div className="space-y-2">
                  {modWidgets.map(pref => {
                    const def = WIDGET_REGISTRY.find(w => w.id === pref.widget_id);
                    if (!def) return null;
                    const globalIdx = sorted.findIndex(p => p.widget_id === pref.widget_id);

                    return (
                      <div
                        key={pref.widget_id}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                      >
                        <div className="flex flex-col gap-0.5">
                          <button onClick={() => moveUp(globalIdx)} className="p-0.5 hover:bg-secondary rounded">
                            <ArrowUp className="h-3 w-3 text-muted-foreground" />
                          </button>
                          <button onClick={() => moveDown(globalIdx)} className="p-0.5 hover:bg-secondary rounded">
                            <ArrowDown className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{def.label}</span>
                            {def.smartBadge && (
                              <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                                {def.smartBadge}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {SIZE_OPTIONS.map(s => (
                              <button
                                key={s.value}
                                onClick={() => onResize(pref.widget_id, s.value)}
                                className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                                  pref.size === s.value
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'border-border text-muted-foreground hover:bg-secondary'
                                }`}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <Switch
                          checked={pref.enabled}
                          onCheckedChange={() => onToggle(pref.widget_id)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button className="w-full">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
