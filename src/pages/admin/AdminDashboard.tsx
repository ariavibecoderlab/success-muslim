import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, Activity, CalendarCheck, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import { LiveActivityFeed } from '@/components/admin/LiveActivityFeed';

type Stats = {
  total_users: number;
  today_signups: number;
  dau: number;
  mau: number;
  onboarding_completed: number;
  onboarding_total: number;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<{ date: string; signups: number; cumulative: number }[]>([]);
  const [moduleData, setModuleData] = useState<{ module: string; unique_users: number }[]>([]);
  const [range, setRange] = useState(30);

  const load = useCallback(async () => {
    const { data: s } = await supabase.rpc('admin_overview_stats');
    if (s) setStats(s as unknown as Stats);

    const { data: chart } = await supabase.rpc('admin_signup_chart', { _days: range });
    if (chart) {
      let cum = 0;
      setChartData((chart as any[]).map(r => {
        cum += Number(r.signup_count);
        return { date: new Date(r.signup_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), signups: Number(r.signup_count), cumulative: cum };
      }));
    }

    const { data: mod } = await supabase.rpc('admin_module_usage');
    if (mod) setModuleData((mod as any[]).map(m => ({ module: m.module, unique_users: Number(m.unique_users) })));
  }, [range]);

  useEffect(() => { load(); const i = setInterval(load, 60000); return () => clearInterval(i); }, [load]);

  const onboardingPct = stats && stats.onboarding_total > 0
    ? Math.round((stats.onboarding_completed / stats.onboarding_total) * 100) : 0;

  const cards = [
    { label: 'Total Users', value: stats?.total_users ?? 0, icon: Users, color: 'text-primary' },
    { label: "Today's New", value: stats?.today_signups ?? 0, icon: UserPlus, color: 'text-emerald-500' },
    { label: 'Active DAU', value: stats?.dau ?? 0, icon: Activity, color: 'text-blue-500' },
    { label: 'Active MAU', value: stats?.mau ?? 0, icon: CalendarCheck, color: 'text-violet-500' },
    { label: 'Onboarded', value: `${onboardingPct}%`, icon: CheckCircle, color: 'text-emerald-500' },
    { label: 'Drop-off', value: `${100 - onboardingPct}%`, icon: XCircle, color: 'text-destructive' },
    { label: 'Avg Session', value: '—', icon: Clock, color: 'text-amber-500' },
    { label: 'D7 Retention', value: '—', icon: TrendingUp, color: 'text-blue-500' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(c => (
          <Card
            key={c.label}
            className="bg-card/70 backdrop-blur-sm border-border/50 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`mt-0.5 ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{typeof c.value === 'number' ? c.value.toLocaleString() : c.value}</p>
                <p className="text-[11px] text-muted-foreground">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card/70 backdrop-blur-sm border-border/50 rounded-xl shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">User Growth</h2>
            <div className="flex gap-1">
              {[7, 30, 90].map(d => (
                <Button key={d} size="sm" variant={range === d ? 'default' : 'ghost'} onClick={() => setRange(d)} className="text-xs h-7 px-2">
                  {d}d
                </Button>
              ))}
            </div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis yAxisId="left" allowDecimals={false} tick={{ fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar yAxisId="left" dataKey="signups" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} opacity={0.7} />
                <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/70 backdrop-blur-sm border-border/50 rounded-xl shadow-sm">
        <CardContent className="p-5">
          <h2 className="font-semibold mb-4">Module Usage</h2>
          {moduleData.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(200, moduleData.length * 40)}>
              <BarChart data={moduleData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="module" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="unique_users" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">No activity data yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
