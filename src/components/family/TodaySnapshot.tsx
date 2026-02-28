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
      className="flex items-center gap-2.5 w-full text-left py-2.5 px-1 hover:bg-muted/40 rounded-lg transition-colors"
    >
      <Avatar className="h-7 w-7 flex-shrink-0 border border-border">
        {entry.avatar_url && <AvatarImage src={entry.avatar_url} />}
        <AvatarFallback className="text-[9px] font-semibold bg-primary/5 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="text-xs font-medium truncate flex-1 min-w-0">
        {entry.display_name || 'Member'}
      </span>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className={`inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
          entry.prayers_this_week > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-muted text-muted-foreground/40'
        }`}>
          {entry.prayers_this_week > 0 ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Circle className="h-2.5 w-2.5" />}
          Prayer
        </span>
        <span className={`inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
          entry.quran_days_this_week > 0 ? 'bg-blue-50 text-blue-600' : 'bg-muted text-muted-foreground/40'
        }`}>
          {entry.quran_days_this_week > 0 ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Circle className="h-2.5 w-2.5" />}
          Quran
        </span>
        <span className={`inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
          entry.fasting_days_this_week > 0 ? 'bg-purple-50 text-purple-600' : 'bg-muted text-muted-foreground/40'
        }`}>
          <Moon className="h-2.5 w-2.5" />
        </span>
        {entry.quran_streak > 0 && (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">
            <Flame className="h-2.5 w-2.5" />{entry.quran_streak}
          </span>
        )}
      </div>
    </button>
  );
};

export default TodaySnapshot;
