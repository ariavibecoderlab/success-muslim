import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Check, Clock, X as XIcon, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useSalahLog, useSalahMutation } from '@/hooks/useSalahQuery';
import { SALAH_NAMES, type SalahName, type SalahStatus } from '@/lib/salah-storage';
import { getTodayKey } from '@/lib/calculations';
import { hapticLight, hapticSuccess } from '@/utils/native/haptics';
import { cn } from '@/lib/utils';

const PRAYER_LABELS: Record<SalahName, string> = {
  Fajr: 'Subuh',
  Dhuhr: 'Zohor',
  Asr: 'Asar',
  Maghrib: 'Maghrib',
  Isha: 'Isyak',
};

const STATUS_OPTIONS: { value: Exclude<SalahStatus, null>; label: string; icon: typeof Check; cls: string }[] = [
  { value: 'ontime', label: 'On time', icon: Check, cls: 'bg-primary text-primary-foreground border-primary' },
  { value: 'late', label: 'Late', icon: Clock, cls: 'bg-amber-500/15 text-amber-700 border-amber-500/40 dark:text-amber-300' },
  { value: 'missed', label: 'Missed', icon: XIcon, cls: 'bg-destructive/15 text-destructive border-destructive/40' },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SalahQuickLogSheet = ({ open, onOpenChange }: Props) => {
  const today = getTodayKey();
  const { data: log } = useSalahLog(today);
  const { mutate: logPrayer } = useSalahMutation();

  const { logged, nextUnlogged } = useMemo(() => {
    let count = 0;
    let next: SalahName | null = null;
    for (const name of SALAH_NAMES) {
      const status = log?.prayers?.[name]?.status ?? null;
      if (status) count++;
      else if (!next) next = name;
    }
    return { logged: count, nextUnlogged: next };
  }, [log]);

  const handleLog = (prayer: SalahName, status: Exclude<SalahStatus, null>) => {
    const current = log?.prayers?.[prayer]?.status ?? null;
    const nextStatus: SalahStatus = current === status ? null : status;
    logPrayer({ prayer, status: nextStatus, date: today });

    if (nextStatus) {
      hapticSuccess();
      toast.success(`${PRAYER_LABELS[prayer]} logged`, {
        description: STATUS_OPTIONS.find(o => o.value === nextStatus)?.label,
      });
    } else {
      hapticLight();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl border-t border-border max-w-md mx-auto px-5 pt-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]"
      >
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-muted" />

        <SheetHeader className="text-left mt-2">
          <SheetTitle className="text-xl font-bold tracking-tight">Quick log Salah</SheetTitle>
          <SheetDescription>
            <span className="font-semibold text-primary">{logged} / 5</span> prayers logged today
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-2">
          {SALAH_NAMES.map(name => {
            const status = log?.prayers?.[name]?.status ?? null;
            const isNext = !status && nextUnlogged === name;
            return (
              <div
                key={name}
                className={cn(
                  'flex items-center justify-between rounded-2xl border p-3 transition-colors',
                  status ? 'bg-card border-border' : 'bg-muted/30 border-border/60',
                  isNext && 'ring-2 ring-primary/40 border-primary/40 bg-primary/5',
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0',
                      status === 'ontime' && 'bg-primary text-primary-foreground',
                      status === 'late' && 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
                      status === 'missed' && 'bg-destructive/15 text-destructive',
                      !status && 'bg-background border border-border text-muted-foreground',
                    )}
                  >
                    {PRAYER_LABELS[name][0]}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground leading-tight">
                      {PRAYER_LABELS[name]}
                    </div>
                    {isNext && (
                      <div className="text-[11px] text-primary font-medium leading-tight mt-0.5">
                        Next prayer
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {STATUS_OPTIONS.map(opt => {
                    const active = status === opt.value;
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleLog(name, opt.value)}
                        aria-label={`${PRAYER_LABELS[name]} ${opt.label}`}
                        className={cn(
                          'min-w-[44px] h-10 px-2 rounded-xl border flex items-center justify-center transition-all active:scale-95',
                          active ? opt.cls : 'bg-background border-border text-muted-foreground hover:text-foreground',
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <Link
          to="/iman/salah-log"
          onClick={() => onOpenChange(false)}
          className="mt-5 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <span>View full Salah log</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </SheetContent>
    </Sheet>
  );
};

export default SalahQuickLogSheet;