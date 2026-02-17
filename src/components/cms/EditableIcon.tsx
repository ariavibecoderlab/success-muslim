import React, { useState, useCallback, useMemo } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EditableIconProps {
  elementKey: string;
  defaultIcon: string; // lucide icon name e.g. "Heart"
  className?: string;
  size?: number;
}

const iconMap: Record<string, React.ComponentType<any>> = LucideIcons as any;

const getIcon = (name: string): React.ComponentType<any> | null => {
  return iconMap[name] || null;
};

const allIconNames = Object.keys(LucideIcons).filter(
  (key) => key !== 'default' && key !== 'createLucideIcon' && key !== 'icons' && typeof (LucideIcons as any)[key] === 'function' && /^[A-Z]/.test(key)
);

const EditableIcon: React.FC<EditableIconProps> = ({
  elementKey,
  defaultIcon,
  className,
  size = 24,
}) => {
  const { isEditMode, getOverride, saveOverride, deleteOverride } = useEditMode();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');

  const overrideValue = getOverride(elementKey, 'text') as string | undefined;
  const iconName = overrideValue ?? defaultIcon;
  const IconComponent = getIcon(iconName);

  const filteredIcons = useMemo(() => {
    if (!search) return allIconNames.slice(0, 120);
    const lower = search.toLowerCase();
    return allIconNames.filter(n => n.toLowerCase().includes(lower)).slice(0, 120);
  }, [search]);

  const handleSelect = useCallback((name: string) => {
    if (name === defaultIcon) {
      deleteOverride(elementKey, 'text');
    } else {
      saveOverride(elementKey, 'text', name);
    }
    setPickerOpen(false);
    setSearch('');
  }, [elementKey, defaultIcon, saveOverride, deleteOverride]);

  if (!IconComponent) {
    return <span className={className}>?</span>;
  }

  if (!isEditMode) {
    return <IconComponent className={className} size={size} />;
  }

  return (
    <>
      <IconComponent
        className={cn(className, 'cursor-pointer ring-2 ring-transparent hover:ring-blue-400 rounded transition-shadow')}
        size={size}
        onClick={() => setPickerOpen(true)}
      />
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Icon</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-3"
          />
          <ScrollArea className="h-64">
            <div className="grid grid-cols-6 gap-2">
              {filteredIcons.map((name) => {
                const Ic = getIcon(name);
                if (!Ic) return null;
                return (
                  <button
                    key={name}
                    className={cn(
                      'p-2 rounded hover:bg-muted flex items-center justify-center',
                      name === iconName && 'bg-primary/10 ring-2 ring-primary'
                    )}
                    onClick={() => handleSelect(name)}
                    title={name}
                  >
                    <Ic size={20} />
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditableIcon;
