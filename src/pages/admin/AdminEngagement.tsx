import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Zap, Calendar, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';

type EngagementData = {
  wau: number;
  dau_trend: { d: string; active_users: number }[];
  feature_adoption: { module: string; users: number; adoption_pct: number }[];
};

type CheckinData = {
  checkins_today: number;
  avg_streak: number;
  total_checkin_users: number;
  streak_distribution: { bucket: string; cnt: number }[];
};

type WidgetRow = { widget_id: string; enabled_count: number; total_users: number };

const COLORS = ['hsl(var(--primary))', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f97316', '#6366f1'];

const AdminEngagement = () => {
  const [data, setData] = useState<EngagementData | null>(null);
  const [checkins, setCheckins] = useState<CheckinData | null>(null);
  const [widgets, setWidgets] = useState<WidgetRow[]>([]);
  const [range, setRange] = useState(30);

  const load = useCallback(async () => {
    const { data: eng } = await supabase.rpc('admin_engagement_stats', { _days: range });
    if (eng) setData(eng as unknown as EngagementData);

    const { data: chk } = await supabase.rpc('admin_checkin_stats');
    if (chk) setCheckins(chk as unknown as CheckinData);

    const { data: wdg } = await supabase.rpc('admin_widget_popularity');
    if (wdg) setWidgets(wdg as unknown as WidgetRow[]);
  }, [range]);

  useEffect(() => { load(); }, [load]);

  const dauChart = (data?.dau_trend || []).map(d => ({
    date: new Date(d.d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    users: d.active_users,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Engagement Analytics</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'WAU', value: data?.wau ?? 0, icon: Users, color: 'text-blue-500' },
          { label: 'Checkins Today', value: checkins?.checkins_today ?? 0, icon: Calendar, color: 'text-emerald-500' },
          { label: 'Avg Streak', value: checkins?.avg_streak ?? 0, icon: Zap, color: 'text-amber-500' },
          { label: 'Total Checkin Users', value: checkins?.total_checkin_users ?? 0, icon: TrendingUp, color: 'text-violet-500' },
        ].map(c => (
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

      {/* DAU Trend */}
      <Card className="bg-card/70 backdrop-blur-sm border-border/50 rounded-xl shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Daily Active Users</h2>
            <div className="flex gap-1">
              {[7, 30, 90].map(d => (
                <Button key={d} size="sm" variant={range === d ? 'default' : 'ghost'} onClick={() => setRange(d)} className="text-xs h-7 px-2">{d}d</Button>
              ))}
            </div>
          </div>
          {dauChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={dauChart}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-muted-foreground">No data yet.</p>}
        </CardContent>
      </Card>

      {/* Feature Adoption */}
      <Card className="bg-card/70 backdrop-blur-sm border-border/50 rounded-xl shadow-sm">
        <CardContent className="p-5">
          <h2 className="font-semibold mb-4">Feature Adoption</h2>
          {(data?.feature_adoption?.length ?? 0) > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(200, (data?.feature_adoption?.length ?? 0) * 36)}>
              <BarChart data={data!.feature_adoption} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" tick={{ fontSize: 10 }} unit="%" />
                <YAxis type="category" dataKey="module" tick={{ fontSize: 11 }} width={110} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="adoption_pct" radius={[0, 4, 4, 0]}>
                  {data!.feature_adoption.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-muted-foreground">No data yet.</p>}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Streak Distribution */}
        <Card className="bg-card/70 backdrop-blur-sm border-border/50 rounded-xl shadow-sm">
          <CardContent className="p-5">
            <h2 className="font-semibold mb-4">Streak Distribution</h2>
            {(checkins?.streak_distribution?.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={checkins!.streak_distribution}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="cnt" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground">No data yet.</p>}
          </CardContent>
        </Card>

        {/* Widget Popularity */}
        <Card className="bg-card/70 backdrop-blur-sm border-border/50 rounded-xl shadow-sm">
          <CardContent className="p-5">
            <h2 className="font-semibold mb-4">Widget Popularity</h2>
            {widgets.length > 0 ? (
              <div className="space-y-2">
                {widgets.slice(0, 10).map(w => (
                  <div key={w.widget_id} className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium">{w.widget_id}</span>
                    <span className="text-muted-foreground">{Number(w.enabled_count)} enabled</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">No data yet.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminEngagement;
