import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, BookOpen, Heart, HandCoins, Sparkles } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
} from 'recharts';

type ImanStats = {
  prayers_today: number;
  prayers_on_time_today: number;
  prayer_breakdown_week: { status: string; cnt: number }[];
  most_missed_30d: { prayer_name: string; missed_count: number }[];
  quran_pages_this_week: number;
  quran_readers_this_week: number;
  dhikr_total_today: number;
  dhikr_sessions_today: number;
  fasters_today: number;
  sadaqah_this_month: number;
  sadaqah_donors_this_month: number;
};

type ImanTrends = {
  prayer_trend: { d: string; on_time: number; late: number; missed: number; unique_users: number }[];
  quran_trend: { d: string; pages: number; readers: number }[];
  dhikr_trend: { d: string; total_count: number; users: number }[];
  fasting_trend: { d: string; fasters: number }[];
};

type SadaqahCat = { category: string; total_amount: number; donor_count: number };

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const AdminImanAnalytics = () => {
  const [stats, setStats] = useState<ImanStats | null>(null);
  const [trends, setTrends] = useState<ImanTrends | null>(null);
  const [sadaqahCats, setSadaqahCats] = useState<SadaqahCat[]>([]);
  const [range, setRange] = useState(30);

  const load = useCallback(async () => {
    const [{ data: s }, { data: t }, { data: sc }] = await Promise.all([
      supabase.rpc('admin_iman_stats'),
      supabase.rpc('admin_iman_trends', { _days: range }),
      supabase.rpc('admin_sadaqah_by_category'),
    ]);
    if (s) setStats(s as unknown as ImanStats);
    if (t) setTrends(t as unknown as ImanTrends);
    if (sc) setSadaqahCats(sc as unknown as SadaqahCat[]);
  }, [range]);

  useEffect(() => { load(); }, [load]);

  const kpis = [
    { label: 'Prayers Today', value: stats?.prayers_today ?? 0, icon: Moon, color: 'text-primary' },
    { label: 'On-Time Today', value: stats?.prayers_on_time_today ?? 0, icon: Sparkles, color: 'text-emerald-500' },
    { label: 'Quran Pages (Week)', value: stats?.quran_pages_this_week ?? 0, icon: BookOpen, color: 'text-blue-500' },
    { label: 'Quran Readers (Week)', value: stats?.quran_readers_this_week ?? 0, icon: BookOpen, color: 'text-violet-500' },
    { label: 'Dhikr Today', value: stats?.dhikr_total_today ?? 0, icon: Heart, color: 'text-amber-500' },
    { label: 'Fasters Today', value: stats?.fasters_today ?? 0, icon: Moon, color: 'text-orange-500' },
    { label: 'Sadaqah (Month)', value: `RM ${Number(stats?.sadaqah_this_month ?? 0).toLocaleString()}`, icon: HandCoins, color: 'text-emerald-500' },
    { label: 'Donors (Month)', value: stats?.sadaqah_donors_this_month ?? 0, icon: HandCoins, color: 'text-blue-500' },
  ];

  const prayerTrend = (trends?.prayer_trend || []).map(d => ({
    date: fmt(d.d), on_time: Number(d.on_time), late: Number(d.late), missed: Number(d.missed),
  }));
  const quranTrend = (trends?.quran_trend || []).map(d => ({ date: fmt(d.d), pages: Number(d.pages), readers: Number(d.readers) }));
  const dhikrTrend = (trends?.dhikr_trend || []).map(d => ({ date: fmt(d.d), count: Number(d.total_count) }));
  const fastingTrend = (trends?.fasting_trend || []).map(d => ({ date: fmt(d.d), fasters: Number(d.fasters) }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Iman Analytics</h1>
        <div className="flex gap-1">
          {[7, 30, 90].map(d => (
            <Button key={d} size="sm" variant={range === d ? 'default' : 'ghost'} onClick={() => setRange(d)} className="text-xs h-7 px-2">{d}d</Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(c => (
          <Card key={c.label} className="bg-card/70 backdrop-blur-sm border-border/50 rounded-xl shadow-sm">
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`mt-0.5 ${c.color}`}><c.icon className="h-5 w-5" /></div>
              <div>
                <p className="text-xl font-bold">{typeof c.value === 'number' ? c.value.toLocaleString() : c.value}</p>
                <p className="text-[11px] text-muted-foreground">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Prayer Trend — Stacked Area */}
      <Card className="bg-card/70 backdrop-blur-sm border-border/50 rounded-xl shadow-sm">
        <CardContent className="p-5">
          <h2 className="font-semibold mb-4">Prayer Logs Over Time</h2>
          {prayerTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={prayerTrend}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="on_time" stackId="1" fill="#10b981" stroke="#10b981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="late" stackId="1" fill="#f59e0b" stroke="#f59e0b" fillOpacity={0.6} />
                <Area type="monotone" dataKey="missed" stackId="1" fill="#ef4444" stroke="#ef4444" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-muted-foreground">No prayer data yet.</p>}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Prayer Status Pie */}
        <Card className="bg-card/70 backdrop-blur-sm border-border/50 rounded-xl shadow-sm">
          <CardContent className="p-5">
            <h2 className="font-semibold mb-4">Prayer Status (This Week)</h2>
            {(stats?.prayer_breakdown_week?.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={stats!.prayer_breakdown_week} dataKey="cnt" nameKey="status" cx="50%" cy="50%" outerRadius={90} label={({ status, cnt }) => `${status}: ${cnt}`}>
                    {stats!.prayer_breakdown_week.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground">No prayer data yet.</p>}
          </CardContent>
        </Card>

        {/* Most Missed Prayers */}
        <Card className="bg-card/70 backdrop-blur-sm border-border/50 rounded-xl shadow-sm">
          <CardContent className="p-5">
            <h2 className="font-semibold mb-4">Most Missed ({range} Days)</h2>
            {(stats?.most_missed_30d?.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats!.most_missed_30d}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="prayer_name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="missed_count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground">No missed prayer data.</p>}
          </CardContent>
        </Card>
      </div>

      {/* Quran + Dhikr Trends */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="bg-card/70 backdrop-blur-sm border-border/50 rounded-xl shadow-sm">
          <CardContent className="p-5">
            <h2 className="font-semibold mb-4">Quran Pages Read</h2>
            {quranTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={quranTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="pages" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground">No data yet.</p>}
          </CardContent>
        </Card>

        <Card className="bg-card/70 backdrop-blur-sm border-border/50 rounded-xl shadow-sm">
          <CardContent className="p-5">
            <h2 className="font-semibold mb-4">Dhikr Counts</h2>
            {dhikrTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={dhikrTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" fill="hsl(var(--primary))" stroke="hsl(var(--primary))" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground">No data yet.</p>}
          </CardContent>
        </Card>
      </div>

      {/* Fasting Trend + Sadaqah Categories */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="bg-card/70 backdrop-blur-sm border-border/50 rounded-xl shadow-sm">
          <CardContent className="p-5">
            <h2 className="font-semibold mb-4">Fasting Participation</h2>
            {fastingTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={fastingTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="fasters" fill="#f97316" radius={[4, 4, 0, 0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground">No data yet.</p>}
          </CardContent>
        </Card>

        <Card className="bg-card/70 backdrop-blur-sm border-border/50 rounded-xl shadow-sm">
          <CardContent className="p-5">
            <h2 className="font-semibold mb-4">Sadaqah by Category (This Month)</h2>
            {sadaqahCats.length > 0 ? (
              <div className="space-y-3">
                {sadaqahCats.map((c, i) => (
                  <div key={c.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-sm font-medium capitalize">{c.category}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold">RM {Number(c.total_amount).toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground ml-2">({c.donor_count} donors)</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">No sadaqah data yet.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminImanAnalytics;
