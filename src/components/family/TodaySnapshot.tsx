import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { LeaderboardEntry } from '@/hooks/useFamilyDashboard';
import { Flame } from 'lucide-react';

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
      className="flex items-center gap-2.5 w-full text-left py-2 px-1 hover:bg-muted/30 rounded-md transition-colors"
    >
      <Avatar className="h-6 w-6 flex-shrink-0">
        {entry.avatar_url && <AvatarImage src={entry.avatar_url} />}
        <AvatarFallback className="text-[8px] font-medium bg-muted text-muted-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="text-xs font-medium truncate flex-1 min-w-0">
        {entry.display_name || 'Member'}
      </span>
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Prayer dot */}
        <div className={`w-2 h-2 rounded-full ${entry.prayers_this_week > 0 ? 'bg-emerald-400' : 'bg-border'}`} title="Prayer" />
        {/* Quran dot */}
        <div className={`w-2 h-2 rounded-full ${entry.quran_days_this_week > 0 ? 'bg-blue-400' : 'bg-border'}`} title="Quran" />
        {/* Fasting dot */}
        <div className={`w-2 h-2 rounded-full ${entry.fasting_days_this_week > 0 ? 'bg-purple-400' : 'bg-border'}`} title="Fasting" />
        {/* Streak */}
        {entry.quran_streak > 0 && (
          <span className="text-[9px] text-amber-500 font-medium flex items-center gap-px ml-0.5">
            {entry.quran_streak}<Flame className="h-2 w-2" />
          </span>
        )}
      </div>
    </button>
  );
};

export default TodaySnapshot;
