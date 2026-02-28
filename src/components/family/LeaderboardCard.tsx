import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { LeaderboardEntry } from '@/hooks/useFamilyDashboard';
import { Flame, BookOpen, HandHelping } from 'lucide-react';

const RANK_COLORS: Record<number, string> = {
  1: 'bg-amber-400 text-white',
  2: 'bg-slate-300 text-slate-700',
  3: 'bg-amber-600/70 text-white',
};

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  rank: number;
  isCurrentUser: boolean;
  onClick?: () => void;
}

const LeaderboardCard = ({ entry, rank, isCurrentUser, onClick }: LeaderboardCardProps) => {
  const initials = entry.display_name
    ? entry.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const rankCircle = RANK_COLORS[rank];

  return (
    <button
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-muted/40 transition-colors active:bg-muted/60 rounded-lg ${
        rank === 1 ? 'bg-amber-50/50' : ''
      }`}
      onClick={onClick}
    >
      {/* Rank */}
      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
        rankCircle ?? 'bg-muted text-muted-foreground'
      }`}>
        {rank}
      </div>

      {/* Avatar */}
      <Avatar className="h-8 w-8 flex-shrink-0">
        {entry.avatar_url && <AvatarImage src={entry.avatar_url} />}
        <AvatarFallback className="text-[10px] font-medium bg-muted text-muted-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Name + stats */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate">
            {entry.display_name || 'Member'}
          </span>
          {isCurrentUser && (
            <span className="text-[9px] text-primary font-medium">you</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-px">
          <span className="text-[10px] text-muted-foreground">
            {entry.prayers_this_week} prayers
          </span>
          <span className="text-[10px] text-muted-foreground">·</span>
          <span className="text-[10px] text-muted-foreground">
            {entry.quran_days_this_week}/7
          </span>
          {entry.quran_streak > 0 && (
            <>
              <span className="text-[10px] text-muted-foreground">·</span>
              <span className="text-[10px] text-amber-500 flex items-center gap-0.5">
                {entry.quran_streak}d <Flame className="h-2.5 w-2.5" />
              </span>
            </>
          )}
        </div>
      </div>

      {/* Score */}
      <div className="text-right flex-shrink-0">
        <p className={`text-base font-semibold leading-none ${rank === 1 ? 'text-amber-500' : rank <= 3 ? 'text-muted-foreground' : 'text-foreground'}`}>
          {entry.iman_score}
        </p>
      </div>
    </button>
  );
};

export default LeaderboardCard;
