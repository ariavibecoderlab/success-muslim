import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { LeaderboardEntry } from '@/hooks/useFamilyDashboard';
import { Flame, BookOpen, HandHelping, Trophy, Medal, Award } from 'lucide-react';

const RANK_STYLES: Record<number, { borderColor: string; iconColor: string; scoreColor: string; icon: React.ReactNode; shadow?: boolean }> = {
  1: {
    borderColor: 'border-l-amber-400',
    iconColor: 'text-amber-500',
    scoreColor: 'text-amber-500',
    icon: <Trophy className="h-4 w-4 text-amber-500" />,
    shadow: true,
  },
  2: {
    borderColor: 'border-l-slate-400',
    iconColor: 'text-slate-400',
    scoreColor: 'text-slate-500',
    icon: <Medal className="h-4 w-4 text-slate-400" />,
  },
  3: {
    borderColor: 'border-l-amber-600',
    iconColor: 'text-amber-600',
    scoreColor: 'text-amber-600',
    icon: <Award className="h-4 w-4 text-amber-600" />,
  },
};

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  rank: number;
  isCurrentUser: boolean;
  onClick?: () => void;
}

const LeaderboardCard = ({ entry, rank, isCurrentUser, onClick }: LeaderboardCardProps) => {
  const style = RANK_STYLES[rank];
  const initials = entry.display_name
    ? entry.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div
      className={`cursor-pointer rounded-xl bg-card p-3 transition-all active:scale-[0.98] border-l-[3px] border border-border/60 ${
        style?.borderColor ?? 'border-l-border'
      } ${style?.shadow ? 'shadow-md' : 'shadow-sm'} ${isCurrentUser ? 'ring-1 ring-primary/20' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {/* Rank */}
        <div className="w-7 flex items-center justify-center flex-shrink-0">
          {style?.icon ?? (
            <span className="text-xs font-semibold text-muted-foreground">#{rank}</span>
          )}
        </div>

        {/* Avatar */}
        <Avatar className="h-9 w-9 flex-shrink-0 border border-border">
          {entry.avatar_url && <AvatarImage src={entry.avatar_url} />}
          <AvatarFallback className="text-[10px] font-semibold bg-primary/5 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Name + stats */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium truncate">
              {entry.display_name || 'Member'}
            </p>
            {isCurrentUser && (
              <Badge className="text-[9px] py-0 px-1.5 h-4 flex-shrink-0 bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                you
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[10px] flex items-center gap-0.5 text-muted-foreground">
              <HandHelping className="h-2.5 w-2.5" /> {entry.prayers_this_week}
            </span>
            <span className="text-[10px] flex items-center gap-0.5 text-muted-foreground">
              <BookOpen className="h-2.5 w-2.5" /> {entry.quran_days_this_week}/7
            </span>
            {entry.quran_streak > 0 && (
              <span className="text-[10px] flex items-center gap-0.5 text-amber-500">
                <Flame className="h-2.5 w-2.5" />{entry.quran_streak}d
              </span>
            )}
          </div>
        </div>

        {/* Iman Score */}
        <div className="text-right flex-shrink-0">
          <p className={`text-lg font-bold leading-none ${style?.scoreColor ?? 'text-primary'}`}>{entry.iman_score}</p>
          <p className="text-[9px] text-muted-foreground">Iman</p>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardCard;
