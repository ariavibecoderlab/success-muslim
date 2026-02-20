import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { LeaderboardEntry } from '@/hooks/useFamilyDashboard';
import { Flame, BookOpen, HandHelping, Medal, Trophy, Award } from 'lucide-react';

const RANK_CONFIG = [
  { icon: <Trophy className="h-5 w-5 text-yellow-500" />, bg: 'from-yellow-500/10 to-yellow-500/5', border: 'border-yellow-500/30' },
  { icon: <Medal className="h-5 w-5 text-slate-400" />, bg: 'from-slate-400/10 to-slate-400/5', border: 'border-slate-400/30' },
  { icon: <Award className="h-5 w-5 text-amber-700" />, bg: 'from-amber-700/10 to-amber-700/5', border: 'border-amber-700/30' },
];

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  rank: number;
  isCurrentUser: boolean;
  onClick?: () => void;
}

const LeaderboardCard = ({ entry, rank, isCurrentUser, onClick }: LeaderboardCardProps) => {
  const config = RANK_CONFIG[rank - 1];
  const initials = entry.display_name
    ? entry.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md active:scale-[0.98] border ${
        config ? config.border : 'border-border'
      } ${isCurrentUser ? 'ring-1 ring-primary/30' : ''}`}
      onClick={onClick}
    >
      <CardContent className={`p-3 flex items-center gap-3 bg-gradient-to-r ${config?.bg ?? ''}`}>
        {/* Rank */}
        <div className="w-8 flex items-center justify-center flex-shrink-0">
          {rank <= 3 ? (
            config.icon
          ) : (
            <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
          )}
        </div>

        {/* Avatar */}
        <Avatar className="h-10 w-10 flex-shrink-0 border border-border">
          {entry.avatar_url && <AvatarImage src={entry.avatar_url} />}
          <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Name + stats */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold truncate">
              {entry.display_name || 'Member'}
            </p>
            {isCurrentUser && (
              <Badge variant="outline" className="text-[9px] py-0 px-1 h-4 flex-shrink-0">you</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <HandHelping className="h-2.5 w-2.5" /> {entry.prayers_this_week} prayers
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <BookOpen className="h-2.5 w-2.5" /> {entry.quran_days_this_week}/7 days
            </span>
            {entry.quran_streak > 0 && (
              <span className="text-[10px] text-primary flex items-center gap-0.5">
                <Flame className="h-2.5 w-2.5" />{entry.quran_streak}d
              </span>
            )}
          </div>
        </div>

        {/* Iman Score */}
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-primary leading-none">{entry.iman_score}</p>
          <p className="text-[9px] text-muted-foreground">Iman</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaderboardCard;
