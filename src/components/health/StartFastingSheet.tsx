import { useState, useRef, useEffect, useCallback } from 'react';
import { Check } from 'lucide-react';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { addDays, format, subDays } from 'date-fns';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (startTime: Date) => void;
  initialDate?: Date;
}

// Generate day labels relative to today
function getDayOptions() {
  const today = new Date();
  const options: { label: string; date: Date }[] = [];
  for (let i = -3; i <= 3; i++) {
    const d = i === 0 ? today : i < 0 ? subDays(today, -i) : addDays(today, i);
    let label: string;
    if (i === 0) label = 'Today';
    else if (i === -1) label = 'Yesterday';
    else if (i === 1) label = 'Tomorrow';
    else label = format(d, 'EEEE');
    options.push({ label, date: d });
  }
  return options;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PADDING_ITEMS = Math.floor(VISIBLE_ITEMS / 2);

function ScrollColumn<T>({
  items,
  selectedIndex,
  onSelect,
  renderItem,
}: {
  items: T[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  renderItem: (item: T, index: number, isSelected: boolean) => React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Scroll to selected index on mount and when selectedIndex changes externally
  useEffect(() => {
    if (containerRef.current && !isScrollingRef.current) {
      containerRef.current.scrollTop = selectedIndex * ITEM_HEIGHT;
    }
  }, [selectedIndex]);

  const handleScroll = useCallback(() => {
    isScrollingRef.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      if (!containerRef.current) return;
      const scrollTop = containerRef.current.scrollTop;
      const index = Math.round(scrollTop / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(items.length - 1, index));
      
      // Snap to position
      containerRef.current.scrollTo({ top: clampedIndex * ITEM_HEIGHT, behavior: 'smooth' });
      onSelect(clampedIndex);
      
      setTimeout(() => { isScrollingRef.current = false; }, 150);
    }, 80);
  }, [items.length, onSelect]);

  return (
    <div className="relative flex-1" style={{ height: CONTAINER_HEIGHT }}>
      {/* Highlight band */}
      <div
        className="absolute left-0 right-0 z-10 pointer-events-none rounded-lg bg-primary/8 border-y border-primary/15"
        style={{ top: PADDING_ITEMS * ITEM_HEIGHT, height: ITEM_HEIGHT }}
      />
      {/* Gradient masks */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent z-20 pointer-events-none" />
      
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto scrollbar-hide snap-y snap-mandatory"
        style={{
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Top padding */}
        {Array.from({ length: PADDING_ITEMS }).map((_, i) => (
          <div key={`pad-top-${i}`} style={{ height: ITEM_HEIGHT }} />
        ))}
        
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-center snap-center cursor-pointer"
            style={{ height: ITEM_HEIGHT }}
            onClick={() => {
              onSelect(index);
              containerRef.current?.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'smooth' });
            }}
          >
            {renderItem(item, index, index === selectedIndex)}
          </div>
        ))}
        
        {/* Bottom padding */}
        {Array.from({ length: PADDING_ITEMS }).map((_, i) => (
          <div key={`pad-bot-${i}`} style={{ height: ITEM_HEIGHT }} />
        ))}
      </div>
    </div>
  );
}

export default function StartFastingSheet({ open, onOpenChange, onConfirm, initialDate }: Props) {
  const dayOptions = getDayOptions();
  const now = initialDate || new Date();
  
  const [dayIndex, setDayIndex] = useState(() => {
    if (initialDate) {
      const dateStr = format(initialDate, 'yyyy-MM-dd');
      const idx = dayOptions.findIndex(d => format(d.date, 'yyyy-MM-dd') === dateStr);
      return idx >= 0 ? idx : 3; // 3 = "Today"
    }
    return 3;
  });
  const [hourIndex, setHourIndex] = useState(now.getHours());
  const [minuteIndex, setMinuteIndex] = useState(now.getMinutes());

  // Reset when opening
  useEffect(() => {
    if (open) {
      const d = initialDate || new Date();
      if (initialDate) {
        const dateStr = format(initialDate, 'yyyy-MM-dd');
        const idx = dayOptions.findIndex(opt => format(opt.date, 'yyyy-MM-dd') === dateStr);
        setDayIndex(idx >= 0 ? idx : 3);
      } else {
        setDayIndex(3);
      }
      setHourIndex(d.getHours());
      setMinuteIndex(d.getMinutes());
    }
  }, [open]);

  const handleConfirm = () => {
    const selectedDay = dayOptions[dayIndex].date;
    const result = new Date(selectedDay);
    result.setHours(hourIndex, minuteIndex, 0, 0);
    onConfirm(result);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[60vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <h3 className="text-lg font-black">Start fasting</h3>
          <button
            onClick={handleConfirm}
            className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors"
          >
            <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </button>
        </div>
        
        <div className="h-px bg-border mx-5" />

        {/* Scroll wheels */}
        <div className="flex gap-0 px-4 py-3">
          {/* Day column */}
          <ScrollColumn
            items={dayOptions}
            selectedIndex={dayIndex}
            onSelect={setDayIndex}
            renderItem={(item, _, isSelected) => (
              <span className={`text-sm transition-all ${
                isSelected 
                  ? 'text-foreground font-black text-base' 
                  : 'text-muted-foreground/60 font-medium'
              }`}>
                {item.label}
              </span>
            )}
          />
          
          {/* Hour column */}
          <ScrollColumn
            items={HOURS}
            selectedIndex={hourIndex}
            onSelect={setHourIndex}
            renderItem={(item, _, isSelected) => (
              <span className={`text-sm font-mono transition-all ${
                isSelected
                  ? 'text-foreground font-black text-base'
                  : 'text-muted-foreground/60 font-medium'
              }`}>
                {item.toString().padStart(2, '0')}
              </span>
            )}
          />
          
          {/* Minute column */}
          <ScrollColumn
            items={MINUTES}
            selectedIndex={minuteIndex}
            onSelect={setMinuteIndex}
            renderItem={(item, _, isSelected) => (
              <span className={`text-sm font-mono transition-all ${
                isSelected
                  ? 'text-foreground font-black text-base'
                  : 'text-muted-foreground/60 font-medium'
              }`}>
                {item.toString().padStart(2, '0')}
              </span>
            )}
          />
        </div>
        
        <div className="h-4" />
      </DrawerContent>
    </Drawer>
  );
}
