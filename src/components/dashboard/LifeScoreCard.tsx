import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { getScoreLabel, type LifeScore } from '@/lib/life-score';
import { fadeUp } from './constants';

interface Props {
  lifeScore: LifeScore;
  weeklyScores: { date: string; score: number }[];
}

export default function LifeScoreCard({ lifeScore, weeklyScores }: Props) {
  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.5}>
      <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-white/70">Life Score</p>
              <p className="text-xs text-white/80">{getScoreLabel(lifeScore.total)}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold leading-tight">{lifeScore.total}</p>
              <p className="text-[10px] text-white/60">/ 100</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {lifeScore.pillars.map(p => (
              <div key={p.label} className="flex items-center gap-2">
                <span className="text-[10px] text-white/70 w-20">{p.label} ({Math.round(p.weight * 100)}%)</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full rounded-full bg-white/80 transition-all" style={{ width: `${p.score}%` }} />
                </div>
                <span className="text-[10px] font-medium w-6 text-right text-white/90">{p.score}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
