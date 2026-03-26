import { useState, useCallback, useMemo } from 'react';
import { Save, TrendingUp, TrendingDown, Minus, Lightbulb, icons } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import SubPageLayout from '@/components/SubPageLayout';
import { toast } from 'sonner';
import { format, startOfMonth, subMonths } from 'date-fns';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  LIFE_AREAS,
  type LifeAreaKey,
  type LifeAreaScore,
} from '@/lib/productivity-storage';
import { useLifeAreaEntries, useLatestLifeAreaEntry, useSaveLifeAreaEntry } from '@/hooks/useLifeAreasQuery';
import { motion } from 'framer-motion';

const SIBLING_ROUTES = [
  { path: '/productivity/tasks', label: 'Daily Tasks' },
  { path: '/productivity/habits', label: 'Habit Streaks' },
  { path: '/productivity/life-areas', label: 'Life Areas' },
];

const INSIGHTS: Record<LifeAreaKey, string> = {
  iman: "Try adding a daily dhikr habit or increase your Quran reading time.",
  health: "Consider adding a daily walk habit or tracking your water intake.",
  wealth: "Review your budget and set a small savings goal this month.",
  family: "Schedule quality time — even 15 minutes of focused conversation helps.",
  knowledge: "Pick one book or course and commit to 20 minutes daily.",
  career: "Set 3 MITs each workday and use the Pomodoro timer to stay focused.",
};

const LifeAreasPage = () => {
  const monthKey = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const existing = useLatestLifeAreaEntry();
  const { data: entries = [] } = useLifeAreaEntries();
  const saveEntry = useSaveLifeAreaEntry();

  const [scores, setScores] = useState<Record<LifeAreaKey, number>>(() => {
    const defaults: Record<LifeAreaKey, number> = {
      iman: 5, health: 5, wealth: 5, family: 5, knowledge: 5, career: 5,
    };
    if (existing) {
      existing.scores.forEach(s => { defaults[s.area] = s.score; });
    }
    return defaults;
  });

  // Previous month data for comparison
  const prevMonthKey = format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd');
  const prevEntry = useMemo(() => entries.find(e => e.date === prevMonthKey), [entries, prevMonthKey]);

  const prevScores = useMemo(() => {
    const map: Partial<Record<LifeAreaKey, number>> = {};
    if (prevEntry) prevEntry.scores.forEach(s => { map[s.area] = s.score; });
    return map;
  }, [prevEntry]);

  const handleSave = useCallback(() => {
    const scoreArray: LifeAreaScore[] = LIFE_AREAS.map(a => ({ area: a.key, score: scores[a.key] }));
    saveEntry.mutate({ date: monthKey, scores: scoreArray });
    toast.success('Assessment saved!');
  }, [scores, monthKey, saveEntry]);

  const radarData = LIFE_AREAS.map(a => ({
    area: a.label,
    score: scores[a.key],
    prev: prevScores[a.key] ?? 0,
    fullMark: 10,
  }));

  const average = (Object.values(scores).reduce((a, b) => a + b, 0) / 6).toFixed(1);

  // Find lowest 2 areas for insights
  const sortedAreas = [...LIFE_AREAS].sort((a, b) => scores[a.key] - scores[b.key]);
  const lowestAreas = sortedAreas.slice(0, 2);

  return (
    <SubPageLayout title="Life Areas" backTo="/productivity" siblingRoutes={SIBLING_ROUTES} currentPath="/productivity/life-areas">
      <div className="space-y-4">
        {/* Radar chart */}
        <div className="bg-card rounded-xl border border-border p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Self-Assessment</p>
            <span className="text-sm font-semibold text-primary">{average}/10</span>
          </div>
          <div className="w-full aspect-square max-w-[240px] mx-auto">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="area" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 8 }} tickCount={6} />
                {prevEntry && (
                  <Radar
                    name="Previous"
                    dataKey="prev"
                    stroke="hsl(var(--muted-foreground))"
                    fill="none"
                    strokeWidth={1}
                    strokeDasharray="4 3"
                  />
                )}
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.15}
                  strokeWidth={1.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          {prevEntry && (
            <p className="text-[9px] text-muted-foreground text-center mt-1">
              Dashed line = previous month
            </p>
          )}
        </div>

        {/* Sliders with deltas */}
        <div className="space-y-3">
          {LIFE_AREAS.map(area => {
            const prev = prevScores[area.key];
            const delta = prev !== undefined ? scores[area.key] - prev : null;
            return (
              <div key={area.key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium flex items-center gap-1.5">
                    {(() => { const Icon = icons[area.icon as keyof typeof icons]; return Icon ? <Icon className="h-3.5 w-3.5 text-muted-foreground" /> : null; })()}
                    {area.label}
                  </label>
                  <div className="flex items-center gap-1.5">
                    {delta !== null && delta !== 0 && (
                      <span className={`text-[10px] flex items-center gap-0.5 ${delta > 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                        {delta > 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                        {delta > 0 ? '+' : ''}{delta.toFixed(0)}
                      </span>
                    )}
                    {delta !== null && delta === 0 && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Minus className="h-2.5 w-2.5" /> 0
                      </span>
                    )}
                    <span className="text-xs font-semibold text-primary">{scores[area.key]}</span>
                  </div>
                </div>
                <Slider
                  value={[scores[area.key]]}
                  onValueChange={([val]) => setScores(prev => ({ ...prev, [area.key]: val }))}
                  min={1} max={10} step={1}
                  className="w-full"
                />
              </div>
            );
          })}
        </div>

        <Button onClick={handleSave} className="w-full h-9 text-sm">
          <Save className="h-3.5 w-3.5 mr-1.5" /> Save
        </Button>

        {/* Insight cards */}
        {lowestAreas.some(a => scores[a.key] <= 5) && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Suggestions</p>
            {lowestAreas.filter(a => scores[a.key] <= 5).map(area => (
              <div key={area.key} className="bg-primary/5 border border-primary/10 rounded-lg px-3 py-2.5 flex gap-2">
                <Lightbulb className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium">{area.label} — {scores[area.key]}/10</p>
                  <p className="text-[11px] text-muted-foreground">{INSIGHTS[area.key]}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* History */}
        {entries.length > 1 && (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">Past Assessments</p>
            <div className="bg-card rounded-xl border border-border divide-y divide-border">
              {entries.slice(0, 6).map(entry => {
                const avg = (entry.scores.reduce((a, s) => a + s.score, 0) / entry.scores.length).toFixed(1);
                return (
                  <div key={entry.date} className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs text-muted-foreground">{format(new Date(entry.date), 'MMM yyyy')}</span>
                    <span className="text-xs font-semibold text-primary">{avg}/10</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </SubPageLayout>
  );
};

export default LifeAreasPage;
