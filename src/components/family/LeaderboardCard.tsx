import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { LeaderboardEntry } from '@/hooks/useFamilyDashboard';
import { Flame, BookOpen, HandHelping, Trophy, Medal, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const RANK_CONFIG = [
  {
    gradient: 'from-yellow-400 to-amber-500',
    textColor: 'text-white',
    subColor: 'text-white/80',
    icon: <Trophy className="h-5 w-5 text-white" />,
    glow: true,
  },
  {
    gradient: 'from-slate-300 to-slate-400',
    textColor: 'text-slate-800',
    subColor: 'text-slate-600',
    icon: <Medal className="h-5 w-5 text-slate-700" />,
    glow: false,
  },
  {
    gradient: 'from-amber-600 to-amber-700',
    textColor: 'text-white',
    subColor: 'text-white/80',
    icon: <Award className="h-5 w-5 text-white" />,
    glow: false,
  },
];

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  rank: number;
  isCurrentUser: boolean;
  onClick?: () => void;
}

const LeaderboardCard = ({ entry, rank, isCurrentUser, onClick }: LeaderboardCardProps) => {
  const config = rank <= 3 ? RANK_CONFIG[rank - 1] : null;
  const initials = entry.display_name
    ? entry.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const isTop = rank <= 3 && config;

  return (
    <motion.div
      animate={config?.glow ? { scale: [1, 1.01, 1] } : undefined}
      transition={config?.glow ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      <div
        className={`cursor-pointer rounded-2xl p-3 transition-all active:scale-[0.98] ${
          isTop
            ? `bg-gradient-to-r ${config.gradient} shadow-lg`
            : `bg-card border border-border hover:shadow-md ${isCurrentUser ? 'ring-1 ring-primary/30' : ''}`
        }`}
        onClick={onClick}
      >
        <div className="flex items-center gap-3">
          {/* Rank */}
          <div className="w-8 flex items-center justify-center flex-shrink-0">
            {isTop ? config.icon : (
              <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
            )}
          </div>

          {/* Avatar */}
          <Avatar className={`h-10 w-10 flex-shrink-0 border ${isTop ? 'border-white/40' : 'border-border'}`}>
            {entry.avatar_url && <AvatarImage src={entry.avatar_url} />}
            <AvatarFallback className={`text-xs font-semibold ${isTop ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Name + stats */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className={`text-sm font-semibold truncate ${isTop ? config.textColor : ''}`}>
                {entry.display_name || 'Member'}
              </p>
              {isCurrentUser && (
                <Badge variant="outline" className={`text-[9px] py-0 px-1 h-4 flex-shrink-0 ${isTop ? 'border-white/40 text-white' : ''}`}>you</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className={`text-[10px] flex items-center gap-0.5 ${isTop ? config.subColor : 'text-muted-foreground'}`}>
                <HandHelping className="h-2.5 w-2.5" /> {entry.prayers_this_week}
              </span>
              <span className={`text-[10px] flex items-center gap-0.5 ${isTop ? config.subColor : 'text-muted-foreground'}`}>
                <BookOpen className="h-2.5 w-2.5" /> {entry.quran_days_this_week}/7
              </span>
              {entry.quran_streak > 0 && (
                <span className={`text-[10px] flex items-center gap-0.5 ${isTop ? 'text-white' : 'text-primary'}`}>
                  <Flame className="h-2.5 w-2.5" />{entry.quran_streak}d
                </span>
              )}
            </div>
          </div>

          {/* Iman Score */}
          <div className="text-right flex-shrink-0">
            <p className={`text-lg font-bold leading-none ${isTop ? config.textColor : 'text-primary'}`}>{entry.iman_score}</p>
            <p className={`text-[9px] ${isTop ? config.subColor : 'text-muted-foreground'}`}>Iman</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LeaderboardCard;
