import { useState, useCallback } from 'react';
import { Save, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  getLifeAreaEntries,
  getLatestLifeAreaEntry,
  saveLifeAreaEntry,
  LifeAreaKey,
  LifeAreaScore,
} from '@/lib/productivity-storage';

const SIBLING_ROUTES = [
  { path: '/productivity/tasks', label: 'Daily Tasks' },
  { path: '/productivity/habits', label: 'Habit Streaks' },
  { path: '/productivity/life-areas', label: 'Life Areas' },
];

const LifeAreasPage = () => {
  const monthKey = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const existing = getLatestLifeAreaEntry();

  const [scores, setScores] = useState<Record<LifeAreaKey, number>>(() => {
    const defaults: Record<LifeAreaKey, number> = {
      iman: 5, health: 5, wealth: 5, family: 5, knowledge: 5, career: 5,
    };
    if (existing) {
      existing.scores.forEach(s => { defaults[s.area] = s.score; });
    }
    return defaults;
  });

  const entries = getLifeAreaEntries();

  const handleSave = useCallback(() => {
    const scoreArray: LifeAreaScore[] = LIFE_AREAS.map(a => ({
      area: a.key,
      score: scores[a.key],
    }));
    saveLifeAreaEntry({ date: monthKey, scores: scoreArray });
    toast.success('Life areas assessment saved!');
  }, [scores, monthKey]);

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
      <div className="space-y-6">
        {/* Radar chart */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Self-Assessment
              </h3>
              <span className="text-sm font-bold text-primary">{average}/10</span>
            </div>
            <div className="w-full aspect-square max-w-[280px] mx-auto">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="area"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 10]}
                    tick={{ fontSize: 9 }}
                    tickCount={6}
                  />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sliders */}
        <div className="space-y-4">
          {LIFE_AREAS.map(area => (
            <div key={area.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <span>{area.emoji}</span> {area.label}
                </label>
                <span className="text-sm font-bold text-primary">{scores[area.key]}</span>
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

        <Button onClick={handleSave} className="w-full" size="lg">
          <Save className="h-4 w-4 mr-2" /> Save Assessment
        </Button>

        {/* History */}
        {entries.length > 1 && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Past Assessments
            </h3>
            <div className="space-y-2">
              {entries.slice(0, 6).map(entry => {
                const avg = (entry.scores.reduce((a, s) => a + s.score, 0) / entry.scores.length).toFixed(1);
                return (
                  <Card key={entry.date} className="bg-muted/30">
                    <CardContent className="p-3 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(entry.date), 'MMMM yyyy')}
                      </span>
                      <span className="text-sm font-bold text-primary">{avg}/10</span>
                    </CardContent>
                  </Card>
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
