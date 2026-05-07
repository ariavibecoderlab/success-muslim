import { useMemo } from 'react';
import { BookOpen, Flame, FileText, Trophy, Award, Medal, CheckCircle2, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import SubPageLayout from '@/components/SubPageLayout';
import ReadingHeatmap from '@/components/quran/ReadingHeatmap';
import { useQuranReadingLog } from '@/hooks/useQuranReadingLog';
import { useHijriDate } from '@/hooks/useHijriDate';
import { useQuranPrefs } from '@/hooks/useQuranData';

function ProgressRing({ percent, label, sublabel }: { percent: number; label: string; sublabel: string }) {
  const size = 168;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="-rotate-90" width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <BookOpen className="h-5 w-5 text-primary mb-1" />
          <span className="text-3xl font-bold">{Math.round(percent)}%</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">Khatam</span>
        </div>
      </div>
      <p className="text-sm font-semibold mt-3">{label}</p>
      <p className="text-xs text-muted-foreground">{sublabel}</p>
    </div>
  );
}

const QuranStats = () => {
  const {
    allTimeTotalAyahs, allTimeTotalPages, streak,
    last7DaysLogs, todayTotalPages, hijriMonthPages,
    loading,
  } = useQuranReadingLog();
  const { hijriParts } = useHijriDate();
  const { prefs } = useQuranPrefs();

  const khatamPercent = Math.min(100, (allTimeTotalAyahs / 6236) * 100);

  // Last 7 days as chart data (date -> total pages)
  const weekData = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      map.set(key, 0);
    }
    last7DaysLogs.forEach(l => {
      if (map.has(l.date)) map.set(l.date, (map.get(l.date) || 0) + Number(l.page_count));
    });
    // include today
    const todayKey = new Date().toISOString().split('T')[0];
    map.set(todayKey, (map.get(todayKey) || 0) + todayTotalPages);
    return Array.from(map.entries()).map(([date, pages]) => ({
      date: new Date(date + 'T00:00:00').toLocaleDateString('en', { weekday: 'short' }).slice(0, 1),
      pages,
    }));
  }, [last7DaysLogs, todayTotalPages]);

  // Estimate days to khatam at recent pace
  const recent7Pages = weekData.reduce((s, d) => s + d.pages, 0);
  const dailyAvg = recent7Pages / 7;
  const remaining = Math.max(0, 604 - allTimeTotalPages);
  const estDays = dailyAvg > 0 ? Math.ceil(remaining / dailyAvg) : 0;

  const heatmapSessions = last7DaysLogs.map(l => ({
    date: l.date,
    pages_read: Number(l.page_count),
  }));

  const achievements = [
    { label: 'First Day', icon: <CheckCircle2 className="h-5 w-5" />, earned: allTimeTotalAyahs >= 1 },
    { label: '7 Day Streak', icon: <Flame className="h-5 w-5" />, earned: streak >= 7 },
    { label: '30 Day Streak', icon: <Award className="h-5 w-5" />, earned: streak >= 30 },
    { label: 'Khatam', icon: <Medal className="h-5 w-5" />, earned: allTimeTotalAyahs >= 6236 },
  ];

  if (loading) {
    return (
      <SubPageLayout title="Quran Stats" backTo="/iman/quran">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
        </div>
      </SubPageLayout>
    );
  }

  return (
    <SubPageLayout title="Quran Stats" backTo="/iman/quran">
      <div className="space-y-5">
        {/* Khatam Ring */}
        <div className="flex justify-center pt-2">
          <ProgressRing
            percent={khatamPercent}
            label="Khatam Progress"
            sublabel={`${allTimeTotalAyahs.toLocaleString()} / 6,236 ayahs`}
          />
        </div>

        {/* Khatam progress bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pages Read</p>
              <span className="text-xs font-bold text-primary">{Math.round((allTimeTotalPages / 604) * 100)}%</span>
            </div>
            <Progress value={Math.min(100, (allTimeTotalPages / 604) * 100)} className="h-2" />
            <p className="text-[11px] text-muted-foreground mt-2">
              {allTimeTotalPages} of 604 pages
              {dailyAvg > 0 && remaining > 0 && ` · ~${estDays} days at current pace`}
            </p>
          </CardContent>
        </Card>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <Flame className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">{streak}</p>
              <p className="text-[10px] text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <BookOpen className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">{allTimeTotalAyahs.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Total Ayahs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <FileText className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">{allTimeTotalPages}</p>
              <p className="text-[10px] text-muted-foreground">Total Pages</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Target className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">{estDays || '–'}</p>
              <p className="text-[10px] text-muted-foreground">Days to Khatam</p>
            </CardContent>
          </Card>
        </div>

        {/* Hijri monthly pace */}
        {hijriParts && (
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {hijriParts.monthName} {hijriParts.year}
              </p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold">{hijriMonthPages}</span>
                <span className="text-sm text-muted-foreground">/ {prefs.monthly_page_goal} pages</span>
              </div>
              <Progress value={Math.min(100, (hijriMonthPages / prefs.monthly_page_goal) * 100)} className="h-2" />
            </CardContent>
          </Card>
        )}

        {/* Last 7 days chart */}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Last 7 Days</p>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={weekData}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
                  formatter={(value: number) => [`${value} pages`, 'Read']}
                />
                <Bar dataKey="pages" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Heatmap */}
        <ReadingHeatmap sessions={heatmapSessions} />

        {/* Achievements */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Achievements</p>
              <Trophy className="h-3.5 w-3.5 text-muted-foreground/50" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {achievements.map(a => (
                <div
                  key={a.label}
                  className={`text-center p-2 rounded-lg min-h-[64px] flex flex-col items-center justify-center ${
                    a.earned ? 'bg-primary/10 text-primary' : 'bg-secondary/50 text-muted-foreground opacity-50'
                  }`}
                >
                  <div className="flex justify-center">{a.icon}</div>
                  <p className="text-[10px] mt-1 leading-tight font-medium break-words text-center">{a.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </SubPageLayout>
  );
};

export default QuranStats;