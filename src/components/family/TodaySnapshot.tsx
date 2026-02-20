import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { LeaderboardEntry } from '@/hooks/useFamilyDashboard';
import { CheckCircle2, Circle, Moon, Flame } from 'lucide-react';

interface TodaySnapshotProps {
  entry: LeaderboardEntry;
  onClick?: () => void;
}

const TodaySnapshot = ({ entry, onClick }: TodaySnapshotProps) => {
  const initials = entry.display_name
    ? entry.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 w-full text-left py-2 px-0.5 hover:opacity-80 transition-opacity"
    >
      <Avatar className="h-7 w-7 flex-shrink-0 border border-border">
        {entry.avatar_url && <AvatarImage src={entry.avatar_url} />}
        <AvatarFallback className="text-[9px] font-semibold bg-primary/10 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="text-xs font-medium truncate flex-1 min-w-0">
        {entry.display_name || 'Member'}
      </span>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span title="Prayer">
          {entry.prayers_this_week > 0
            ? <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            : <Circle className="h-3.5 w-3.5 text-muted-foreground/40" />}
        </span>
        <span title="Quran">
          {entry.quran_days_this_week > 0
            ? <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            : <Circle className="h-3.5 w-3.5 text-muted-foreground/40" />}
        </span>
        <span title="Fasting">
          {entry.fasting_days_this_week > 0
            ? <Moon className="h-3.5 w-3.5 text-primary" />
            : <Circle className="h-3.5 w-3.5 text-muted-foreground/40" />}
        </span>
        {entry.quran_streak > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] text-primary">
            <Flame className="h-3 w-3" />{entry.quran_streak}
          </span>
        )}
      </div>
    </button>
  );
};

export default TodaySnapshot;
