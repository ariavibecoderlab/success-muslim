import { useState } from 'react';
import { format, subDays, isAfter, isBefore, startOfDay } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface BackdateDatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  maxDaysBack?: number;
  className?: string;
  compact?: boolean;
}

const BackdateDatePicker = ({
  selectedDate,
  onDateChange,
  maxDaysBack = 90,
  className,
  compact = false,
}: BackdateDatePickerProps) => {
  const [open, setOpen] = useState(false);
  const today = startOfDay(new Date());
  const minDate = subDays(today, maxDaysBack);
  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

  const goBack = () => {
    const prev = subDays(selectedDate, 1);
    if (!isBefore(prev, minDate)) onDateChange(prev);
  };

  const goForward = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    if (!isAfter(startOfDay(next), today)) onDateChange(next);
  };

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goBack}
        disabled={isBefore(subDays(selectedDate, 1), minDate)}>
        <ChevronLeft className="h-3.5 w-3.5" />
      </Button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm"
            className={cn('gap-1.5 text-xs h-7 font-medium', compact && 'px-2')}>
            <CalendarDays className="h-3 w-3" />
            {isToday ? 'Today' : format(selectedDate, compact ? 'd MMM' : 'EEE, d MMM yyyy')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
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
          <div className="px-3 pb-3">
            <Button variant="ghost" size="sm" className="w-full text-xs h-7"
              onClick={() => { onDateChange(today); setOpen(false); }}>
              Go to Today
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goForward}
        disabled={isAfter(startOfDay(new Date(selectedDate.getTime() + 86400000)), today)}>
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>

      {!isToday && (
        <span className="text-[10px] text-amber-500 font-medium ml-1">Backdating</span>
      )}
    </div>
  );
};

export default BackdateDatePicker;
