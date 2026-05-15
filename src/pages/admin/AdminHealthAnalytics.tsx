import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Moon, Weight, Scale } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, LineChart, Line, AreaChart, Area,
} from 'recharts';

type HealthStats = {
  health_profiles_count: number;
  bmi_distribution: { category: string; cnt: number }[];
  if_protocol_distribution: { protocol: string; cnt: number }[];
  avg_sleep_duration: number | null;
  sleep_loggers_30d: number;
  weight_trackers: number;
};

type HealthTrends = {
  sleep_trend: { d: string; avg_duration: number | null; loggers: number }[];
  weight_trend: { d: string; avg_weight: number | null; loggers: number }[];
};

const BMI_COLORS: Record<string, string> = {
  Underweight: '#3b82f6',
  Normal: '#10b981',
  Overweight: '#f59e0b',
  Obese: '#ef4444',
};

const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const AdminHealthAnalytics = () => {
  const [stats, setStats] = useState<HealthStats | null>(null);
  const [trends, setTrends] = useState<HealthTrends | null>(null);
  const [range, setRange] = useState(30);

  const load = useCallback(async () => {
    const [s, t] = await Promise.all([
      api<HealthStats>('api-admin', { params: { resource: 'health-stats' } }),
      api<HealthTrends>('api-admin', { params: { resource: 'health-trends', days: String(range) } }),
    ]);
    if (s) setStats(s);
    if (t) setTrends(t);
  }, [range]);

  useEffect(() => { load(); }, [load]);

  const kpis = [
    { label: 'Health Profiles', value: stats?.health_profiles_count ?? 0, icon: Activity, color: 'text-primary' },
    { label: 'Avg Sleep (30d)', value: stats?.avg_sleep_duration ? `${stats.avg_sleep_duration}h` : '—', icon: Moon, color: 'text-blue-500' },
    { label: 'Sleep Loggers (30d)', value: stats?.sleep_loggers_30d ?? 0, icon: Moon, color: 'text-violet-500' },
    { label: 'Weight Trackers', value: stats?.weight_trackers ?? 0, icon: Weight, color: 'text-amber-500' },
  ];

  const sleepData = (trends?.sleep_trend || [])
    .filter(d => d.avg_duration !== null)
    .map(d => ({ date: fmt(d.d), duration: Number(d.avg_duration), loggers: Number(d.loggers) }));

  const weightData = (trends?.weight_trend || [])
    .filter(d => d.avg_weight !== null)
    .map(d => ({ date: fmt(d.d), weight: Number(d.avg_weight), loggers: Number(d.loggers) }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Health Analytics</h1>
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

      <div className="grid lg:grid-cols-2 gap-4">
        {/* BMI Distribution */}
        <Card className="bg-card/70 backdrop-blur-sm border-border/50 rounded-xl shadow-sm">
          <CardContent className="p-5">
            <h2 className="font-semibold mb-4">BMI Distribution</h2>
            {(stats?.bmi_distribution?.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats!.bmi_distribution}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="cnt" radius={[4, 4, 0, 0]}>
                    {stats!.bmi_distribution.map((d, i) => (
                      <Cell key={i} fill={BMI_COLORS[d.category] || '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground">No BMI data yet.</p>}
          </CardContent>
        </Card>

        {/* IF Protocol Distribution */}
        <Card className="bg-card/70 backdrop-blur-sm border-border/50 rounded-xl shadow-sm">
          <CardContent className="p-5">
            <h2 className="font-semibold mb-4">IF Protocol Distribution</h2>
            {(stats?.if_protocol_distribution?.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats!.if_protocol_distribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="protocol" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="cnt" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground">No IF data yet.</p>}
          </CardContent>
        </Card>
      </div>

      {/* Sleep Trend */}
      <Card className="bg-card/70 backdrop-blur-sm border-border/50 rounded-xl shadow-sm">
        <CardContent className="p-5">
          <h2 className="font-semibold mb-4">Average Sleep Duration</h2>
          {sleepData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={sleepData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} unit="h" />
                <Tooltip />
                <Area type="monotone" dataKey="duration" fill="#8b5cf6" stroke="#8b5cf6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-muted-foreground">No sleep data yet.</p>}
        </CardContent>
      </Card>

      {/* Weight Trend */}
      <Card className="bg-card/70 backdrop-blur-sm border-border/50 rounded-xl shadow-sm">
        <CardContent className="p-5">
          <h2 className="font-semibold mb-4">Average Weight (Active Trackers)</h2>
          {weightData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} unit="kg" />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-muted-foreground">No weight data yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHealthAnalytics;
