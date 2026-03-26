import { useState, useCallback, useMemo } from 'react';
import { Save, icons, TrendingUp, TrendingDown, Lightbulb } from 'lucide-react';
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

const SIBLING_ROUTES = [
  { path: '/productivity/tasks', label: 'Daily Tasks' },
  { path: '/productivity/habits', label: 'Habit Streaks' },
  { path: '/productivity/life-areas', label: 'Life Areas' },
];

const INSIGHTS: Record<LifeAreaKey, string> = {
  iman: 'Try adding a daily dhikr or Quran reading habit to strengthen your spiritual connection.',
  health: 'Consider adding a daily walk or hydration habit to improve your health score.',
  wealth: 'Review your budget this week — small savings add up over time.',
  family: 'Schedule a family activity or check in with a loved one today.',
  knowledge: 'Read for 15 minutes daily or listen to a podcast on your commute.',
  career: 'Set one professional goal this month and break it into weekly tasks.',
};

const LifeAreasPage = () => {
  const monthKey = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const existing = useLatestLifeAreaEntry();
  const { data: entries = [] } = useLifeAreaEntries();
  const saveEntry = useSaveLifeAreaEntry();

  // Find previous month entry
  const prevMonthKey = format(subMonths(startOfMonth(new Date()), 1), 'yyyy-MM-dd');
  const prevEntry = entries.find(e => e.date === prevMonthKey);

  const [scores, setScores] = useState<Record<LifeAreaKey, number>>(() => {
    const defaults: Record<LifeAreaKey, number> = {
      iman: 5, health: 5, wealth: 5, family: 5, knowledge: 5, career: 5,
    };
    if (existing) {
      existing.scores.forEach(s => { defaults[s.area] = s.score; });
    }
    return defaults;
  });

  const handleSave = useCallback(() => {
    const scoreArray: LifeAreaScore[] = LIFE_AREAS.map(a => ({
      area: a.key,
      score: scores[a.key],
    }));
    saveEntry.mutate({ date: monthKey, scores: scoreArray });
    toast.success('Assessment saved!');
  }, [scores, monthKey, saveEntry]);

  const prevScores = useMemo(() => {
    if (!prevEntry) return null;
    const map: Partial<Record<LifeAreaKey, number>> = {};
    prevEntry.scores.forEach(s => { map[s.area] = s.score; });
    return map;
  }, [prevEntry]);

  const radarData = LIFE_AREAS.map(a => ({
    area: a.label,
    score: scores[a.key],
    prev: prevScores?.[a.key] ?? 0,
    fullMark: 10,
  }));

  const average = (Object.values(scores).reduce((a, b) => a + b, 0) / 6).toFixed(1);

  // Find lowest 2 areas for insights
  const sortedAreas = [...LIFE_AREAS].sort((a, b) => scores[a.key] - scores[b.key]);
  const lowestAreas = sortedAreas.slice(0, 2);

  return (
    <SubPageLayout
      title="Life Areas"
      backTo="/productivity"
      siblingRoutes={SIBLING_ROUTES}
      currentPath="/productivity/life-areas"
    >
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
                <PolarAngleAxis
                  dataKey="area"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 10]}
                  tick={{ fontSize: 8 }}
                  tickCount={6}
                />
                {prevScores && (
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
          {prevScores && (
            <div className="flex items-center justify-center gap-4 mt-1 text-[9px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-4 h-px bg-primary inline-block" /> Current
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-px bg-muted-foreground inline-block border-dashed" style={{ borderTop: '1px dashed' }} /> Previous
              </span>
            </div>
          )}
        </div>

        {/* Sliders with deltas */}
        <div className="space-y-3">
          {LIFE_AREAS.map(area => {
            const delta = prevScores ? scores[area.key] - (prevScores[area.key] ?? 0) : null;
            return (
              <div key={area.key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium flex items-center gap-1.5">
                    {(() => { const Icon = icons[area.icon as keyof typeof icons]; return Icon ? <Icon className="h-3.5 w-3.5 text-muted-foreground" /> : null; })()}
                    {area.label}
                  </label>
                  <div className="flex items-center gap-1.5">
                    {delta !== null && delta !== 0 && (
                      <span className={`text-[10px] flex items-center gap-0.5 ${delta > 0 ? 'text-green-500' : 'text-red-400'}`}>
                        {delta > 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                        {delta > 0 ? '+' : ''}{delta.toFixed(0)}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-primary">{scores[area.key]}</span>
                  </div>
                </div>
                <Slider
                  value={[scores[area.key]]}
                  onValueChange={([val]) => setScores(prev => ({ ...prev, [area.key]: val }))}
                  min={1}
                  max={10}
                  step={1}
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
          <div className="space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Lightbulb className="h-3 w-3" /> Suggestions
            </p>
            {lowestAreas.filter(a => scores[a.key] <= 5).map(area => (
              <div key={area.key} className="bg-primary/5 border border-primary/10 rounded-lg px-3 py-2.5">
                <p className="text-xs font-medium text-primary mb-0.5">{area.label}</p>
                <p className="text-[11px] text-muted-foreground">{INSIGHTS[area.key]}</p>
              </div>
            ))}
          </div>
        )}

        {/* History */}
        {entries.length > 1 && (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
              Past Assessments
            </p>
            <div className="bg-card rounded-xl border border-border divide-y divide-border">
              {entries.slice(0, 6).map(entry => {
                const avg = (entry.scores.reduce((a, s) => a + s.score, 0) / entry.scores.length).toFixed(1);
                return (
                  <div key={entry.date} className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(entry.date), 'MMM yyyy')}
                    </span>
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
