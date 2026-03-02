import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import EditableText from '@/components/cms/EditableText';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { getScoreColor, getScoreLabel, type LifeScore } from '@/lib/life-score';
import { fadeUp } from './constants';

interface Props {
  lifeScore: LifeScore;
  weeklyScores: { date: string; score: number }[];
}

export default function LifeScoreCard({ lifeScore, weeklyScores }: Props) {
  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.5}>
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border-emerald-100 border-l-4 border-l-emerald-400">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <EditableText elementKey="lifescore.card.title" defaultText="Life Score" tag="h2" className="text-sm font-semibold" />
                <p className={`text-xs ${getScoreColor(lifeScore.total)}`}>{getScoreLabel(lifeScore.total)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-3xl font-bold ${getScoreColor(lifeScore.total)}`}>{lifeScore.total}</p>
              <p className="text-[10px] text-muted-foreground">/ 100</p>
            </div>
          </div>
          <div className="space-y-2">
            {lifeScore.pillars.map(p => (
              <div key={p.label} className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground w-20">{p.label} ({Math.round(p.weight * 100)}%)</span>
                <div className="flex-1">
                  <Progress value={p.score} className="h-1.5" />
                </div>
                <span className="text-xs font-medium w-8 text-right">{p.score}</span>
              </div>
            ))}
          </div>
          {weeklyScores.length > 1 && (
            <div className="mt-4">
              <p className="text-[10px] text-muted-foreground mb-2">7-Day Trend</p>
              <ResponsiveContainer width="100%" height={60}>
                <BarChart data={weeklyScores}>
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
