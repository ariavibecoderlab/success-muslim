import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { LeaderboardEntry } from '@/hooks/useFamilyDashboard';

interface TodaySnapshotProps {
  entry: LeaderboardEntry;
  onClick?: () => void;
}

const TodaySnapshot = ({ entry, onClick }: TodaySnapshotProps) => {
  const initials = entry.display_name
    ? entry.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  // Derive "today" status from weekly data as proxies
  const prayerIcon = entry.prayers_this_week > 0 ? '✅' : '⬜';
  const quranIcon = entry.quran_days_this_week > 0 ? '✅' : '⬜';
  const fastIcon = entry.fasting_days_this_week > 0 ? '🌙' : '⬜';

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
      <div className="flex items-center gap-1.5 flex-shrink-0 text-[11px]">
        <span title="Prayer">{prayerIcon}</span>
        <span title="Quran">{quranIcon}</span>
        <span title="Fasting">{fastIcon}</span>
        {entry.quran_streak > 0 && (
          <span className="text-orange-500 text-[10px]">🔥{entry.quran_streak}</span>
        )}
      </div>
    </button>
  );
};

export default TodaySnapshot;
