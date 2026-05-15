import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import SubPageLayout from '@/components/SubPageLayout';
import { useSalahLog, useSalahMutation, useTodaySalahCount } from '@/hooks/useSalahQuery';
import { useSunnahLog, useSunnahStats } from '@/hooks/useSunnahQuery';
import { useQuranReadingLog } from '@/hooks/useQuranReadingLog';
import { useDhikrDaily } from '@/hooks/useDhikrQuery';
import { SALAH_NAMES, type SalahName, type SalahStatus } from '@/lib/salah-storage';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';
import { Check, Clock, X, Circle, BookOpen, Moon, Star, HandHeart } from 'lucide-react';

const STATUS_CONFIG: Record<string, { icon: typeof Check; color: string; label: string }> = {
  ontime: { icon: Check, color: 'text-emerald-500', label: 'On time' },
  late: { icon: Clock, color: 'text-amber-500', label: 'Late' },
  missed: { icon: X, color: 'text-red-400', label: 'Missed' },
};

const STATUSES: SalahStatus[] = ['ontime', 'late', 'missed', null];

function PrayerRow({ name, status, onCycle }: { name: SalahName; status: SalahStatus; onCycle: () => void }) {
  const config = status ? STATUS_CONFIG[status] : null;
  const Icon = config?.icon ?? Circle;

  return (
    <button
      onClick={onCycle}
      className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-muted/50 transition-colors w-full"
    >
      <span className="text-sm font-medium">{name}</span>
      <div className={`flex items-center gap-1.5 ${config?.color ?? 'text-muted-foreground'}`}>
        <Icon className="h-4 w-4" />
        <span className="text-xs">{config?.label ?? 'Tap to log'}</span>
      </div>
    </button>
  );
}

function TodaySolatCard() {
  const today = new Date().toISOString().split('T')[0];
  const { data: salahLog } = useSalahLog(today);
  const salahMutation = useSalahMutation();
  const salahCount = useTodaySalahCount();

  const handleCycle = (prayer: SalahName) => {
    if (!salahLog) return;
    const current = salahLog.prayers[prayer].status;
    const idx = STATUSES.indexOf(current);
    const next = STATUSES[(idx + 1) % STATUSES.length];
    salahMutation.mutate({ prayer, status: next, date: today });
  };

  return (
    <Card className="border-0 shadow-sm rounded-2xl">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold">Solat 5 Waktu</h3>
          </div>
          <span className="text-xs text-muted-foreground font-medium">{salahCount.logged}/5</span>
        </div>
        <div className="space-y-0.5">
          {SALAH_NAMES.map((name) => (
            <PrayerRow
              key={name}
              name={name}
              status={salahLog?.prayers[name]?.status ?? null}
              onCycle={() => handleCycle(name)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TodaySunnahCard() {
  const navigate = useNavigate();
  const { data: sunnahLog } = useSunnahLog();
  const { items } = useSunnahStats();
  const completed = sunnahLog?.completed?.length ?? 0;
  const total = items?.length ?? 12;

  return (
    <Card className="border-0 shadow-sm rounded-2xl cursor-pointer" onClick={() => navigate('/iman/sunnah')}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold">Amalan Sunnah</h3>
          </div>
          <span className="text-xs text-muted-foreground font-medium">{completed}/{total}</span>
        </div>
        <Progress value={(completed / total) * 100} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          {completed === 0 ? 'Belum ada amalan sunnah hari ini' : `${completed} amalan selesai`}
        </p>
      </CardContent>
    </Card>
  );
}

function TodayQuranCard() {
  const navigate = useNavigate();
  const { todayTotalPages, todayTotalAyahs, streak } = useQuranReadingLog();
  const dailyTarget = 5; // pages

  return (
    <Card className="border-0 shadow-sm rounded-2xl cursor-pointer" onClick={() => navigate('/iman/quran')}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-teal-600" />
            <h3 className="text-sm font-bold">Bacaan Quran</h3>
          </div>
          <div className="flex items-center gap-2">
            {streak > 0 && (
              <span className="text-xs text-amber-600 font-medium">🔥 {streak}d</span>
            )}
            <span className="text-xs text-muted-foreground font-medium">
              {todayTotalPages}/{dailyTarget} pg
            </span>
          </div>
        </div>
        <Progress value={Math.min((todayTotalPages / dailyTarget) * 100, 100)} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          {todayTotalAyahs > 0
            ? `${todayTotalAyahs} ayat dibaca hari ini`
            : 'Belum baca Quran hari ini'}
        </p>
      </CardContent>
    </Card>
  );
}

function TodayDhikrCard() {
  const navigate = useNavigate();
  const { data: dhikr } = useDhikrDaily();

  return (
    <Card className="border-0 shadow-sm rounded-2xl cursor-pointer" onClick={() => navigate('/iman/dhikr')}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HandHeart className="h-4 w-4 text-purple-500" />
            <h3 className="text-sm font-bold">Dhikr</h3>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {dhikr?.totalCount ?? 0} kali
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function PrayerTrend() {
  const days = useMemo(() => {
    const result: { day: string; date: string }[] = [];
    const dayNames = ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      result.push({
        day: dayNames[d.getDay()],
        date: d.toISOString().split('T')[0],
      });
    }
    return result;
  }, []);

  // We need salah logs for each day. Use the hook for today and derive from localStorage for past days.
  // For simplicity, use the sync query approach with individual hooks would be too many.
  // Instead, read from localStorage directly for the chart.
  const chartData = useMemo(() => {
    return days.map(({ day, date }) => {
      try {
        const raw = localStorage.getItem('salah_tracking');
        const all = raw ? JSON.parse(raw) : {};
        const log = all[date];
        if (!log) return { day, count: 0 };
        let count = 0;
        for (const name of SALAH_NAMES) {
          if (log.prayers?.[name]?.status) count++;
        }
        return { day, count };
      } catch {
        return { day, count: 0 };
      }
    });
  }, [days]);

  return (
    <div>
      <h3 className="text-sm font-bold mb-2">Konsistensi Solat (7 hari)</h3>
      <ResponsiveContainer width="100%" height={80}>
        <BarChart data={chartData} barCategoryGap="30%">
          <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={20}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.count >= 5 ? 'hsl(var(--primary))' : entry.count > 0 ? 'hsl(var(--primary) / 0.4)' : 'hsl(var(--muted))'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function QuranTrend() {
  const { logs } = useQuranReadingLog();

  const chartData = useMemo(() => {
    const dayNames = ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'];
    const result: { day: string; pages: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLogs = logs.filter(l => l.date === dateStr);
      const pages = dayLogs.reduce((s, l) => s + Number(l.page_count), 0);
      result.push({ day: dayNames[d.getDay()], pages });
    }
    return result;
  }, [logs]);

  return (
    <div>
      <h3 className="text-sm font-bold mb-2">Bacaan Quran (7 hari)</h3>
      <ResponsiveContainer width="100%" height={80}>
        <BarChart data={chartData} barCategoryGap="30%">
          <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
          <Bar dataKey="pages" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" maxBarSize={20}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.pages > 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted))'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function DeenJourney() {
  return (
    <SubPageLayout title="Deen Journey" backTo="/">
      {/* Today's Progress */}
      <section className="space-y-3 mb-6">
        <h2 className="text-base font-bold">Progress Hari Ini</h2>
        <TodaySolatCard />
        <TodayQuranCard />
        <TodaySunnahCard />
        <TodayDhikrCard />
      </section>

      {/* Trends */}
      <section className="space-y-4">
        <h2 className="text-base font-bold">Trends (7 Hari)</h2>
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardContent className="p-4 space-y-6">
            <PrayerTrend />
            <QuranTrend />
          </CardContent>
        </Card>
      </section>
    </SubPageLayout>
  );
}
