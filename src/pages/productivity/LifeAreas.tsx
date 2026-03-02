import { useState, useCallback } from 'react';
import { Save, icons } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import SubPageLayout from '@/components/SubPageLayout';
import { toast } from 'sonner';
import { format, startOfMonth } from 'date-fns';
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

  const handleSave = useCallback(() => {
    const scoreArray: LifeAreaScore[] = LIFE_AREAS.map(a => ({
      area: a.key,
      score: scores[a.key],
    }));
    saveEntry.mutate({ date: monthKey, scores: scoreArray });
    toast.success('Assessment saved!');
  }, [scores, monthKey, saveEntry]);

  const radarData = LIFE_AREAS.map(a => ({
    area: a.label,
    score: scores[a.key],
    fullMark: 10,
  }));

  const average = (Object.values(scores).reduce((a, b) => a + b, 0) / 6).toFixed(1);

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
        </div>

        {/* Sliders */}
        <div className="space-y-3">
          {LIFE_AREAS.map(area => (
            <div key={area.key} className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium flex items-center gap-1.5">
                  {(() => { const Icon = icons[area.icon as keyof typeof icons]; return Icon ? <Icon className="h-3.5 w-3.5 text-muted-foreground" /> : null; })()}
                  {area.label}
                </label>
                <span className="text-xs font-semibold text-primary">{scores[area.key]}</span>
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
          ))}
        </div>

        <Button onClick={handleSave} className="w-full h-9 text-sm">
          <Save className="h-3.5 w-3.5 mr-1.5" /> Save
        </Button>

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
