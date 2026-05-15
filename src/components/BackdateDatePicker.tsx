import { useState, useEffect, useCallback } from 'react';
import { format, subDays, isAfter, isBefore, startOfDay, differenceInDays } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, Sunrise, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface BackdateDatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  maxDaysBack?: number;
  className?: string;
  compact?: boolean;
  highlight?: boolean;
  darkMode?: boolean;
}

const BackdateDatePicker = ({
  selectedDate,
  onDateChange,
  maxDaysBack = 90,
  className,
  compact = false,
  highlight = false,
  darkMode = false,
}: BackdateDatePickerProps) => {
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const today = startOfDay(new Date());
  const minDate = subDays(today, maxDaysBack);
  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  const daysAgo = differenceInDays(today, startOfDay(selectedDate));

  useEffect(() => {
    if (highlight) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 2000);
      return () => clearTimeout(t);
    }
  }, [highlight]);

  const canGoBack = !isBefore(subDays(selectedDate, 1), minDate);
  const canGoForward = !isAfter(startOfDay(new Date(selectedDate.getTime() + 86400000)), today);

  const goBack = useCallback(() => {
    if (canGoBack) onDateChange(subDays(selectedDate, 1));
  }, [selectedDate, canGoBack, onDateChange]);

  const goForward = useCallback(() => {
    if (canGoForward) {
      const next = new Date(selectedDate);
      next.setDate(next.getDate() + 1);
      onDateChange(next);
    }
  }, [selectedDate, canGoForward, onDateChange]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (open) return; // don't interfere with calendar
      if (e.key === 'ArrowLeft') { e.preventDefault(); goBack(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goForward(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, goBack, goForward]);

  const getSmartLabel = () => {
    if (isToday) return 'Today';
    if (daysAgo === 1) return compact ? 'Yesterday' : `Yesterday · ${format(selectedDate, 'EEE, d MMM')}`;
    if (daysAgo <= 6) return compact ? `${daysAgo}d ago` : `${daysAgo} days ago · ${format(selectedDate, 'EEE, d MMM')}`;
    return format(selectedDate, compact ? 'd MMM' : 'EEE, d MMM yyyy');
  };

  const yesterday = subDays(today, 1);

  return (
    <div className={cn('flex items-center justify-center gap-0', className)}>
      {/* Unified segmented control */}
      <div className={cn(
        'inline-flex items-center rounded-full transition-all duration-200',
        darkMode
          ? 'bg-white/10 backdrop-blur-sm border border-white/10'
          : 'bg-muted/60 border border-border/50',
        pulse && !darkMode && 'ring-2 ring-primary/30 ring-offset-2',
        pulse && darkMode && 'ring-2 ring-white/30 ring-offset-0',
      )}>
        {/* Left chevron */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-8 w-8 rounded-full shrink-0',
            darkMode
              ? 'text-white/60 hover:text-white hover:bg-white/10 disabled:text-white/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent disabled:text-muted-foreground/30'
          )}
          onClick={goBack}
          disabled={!canGoBack}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        {/* Divider */}
        <div className={cn('w-px h-4 shrink-0', darkMode ? 'bg-white/10' : 'bg-border/60')} />

        {/* Date trigger */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'gap-1.5 text-xs h-8 font-medium rounded-none px-3 min-w-[100px]',
                darkMode
                  ? 'text-white hover:bg-white/10'
                  : 'text-foreground hover:bg-accent',
              )}
            >
              {!isToday && (
                <span className={cn(
                  'h-1.5 w-1.5 rounded-full shrink-0',
                  darkMode ? 'bg-amber-300 shadow-[0_0_6px_hsl(var(--primary)/0.5)]' : 'bg-amber-500'
                )} />
              )}
              <CalendarDays className="h-3 w-3 shrink-0 opacity-60" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={format(selectedDate, 'yyyy-MM-dd')}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="truncate"
                >
                  {getSmartLabel()}
                </motion.span>
              </AnimatePresence>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            {/* Range hint header */}
            <div className="px-3 pt-3 pb-1">
              <p className="text-[10px] text-muted-foreground text-center">
                Navigate up to {maxDaysBack} days back
              </p>
            </div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => { if (d) { onDateChange(d); setOpen(false); } }}
              disabled={(date) =>
                isAfter(startOfDay(date), today) || isBefore(startOfDay(date), minDate)
              }
              initialFocus
              className="p-3 pointer-events-auto"
            />
            <div className="px-3 pb-3 flex gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-xs h-7 gap-1.5"
                onClick={() => { onDateChange(yesterday); setOpen(false); }}
              >
                <Clock className="h-3 w-3" />
                Yesterday
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-xs h-7 gap-1.5"
                onClick={() => { onDateChange(today); setOpen(false); }}
              >
                <Sunrise className="h-3 w-3" />
                Today
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Divider */}
        <div className={cn('w-px h-4 shrink-0', darkMode ? 'bg-white/10' : 'bg-border/60')} />

        {/* Right chevron */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-8 w-8 rounded-full shrink-0',
            darkMode
              ? 'text-white/60 hover:text-white hover:bg-white/10 disabled:text-white/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent disabled:text-muted-foreground/30'
          )}
          onClick={goForward}
          disabled={!canGoForward}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default BackdateDatePicker;
