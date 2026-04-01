import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, Scale, Moon, Weight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

type HealthStats = {
  health_profiles_count: number;
  bmi_distribution: { category: string; cnt: number }[];
  if_protocol_distribution: { protocol: string; cnt: number }[];
  avg_sleep_duration: number | null;
  sleep_loggers_30d: number;
  weight_trackers: number;
};

const BMI_COLORS: Record<string, string> = {
  Underweight: '#3b82f6',
  Normal: '#10b981',
  Overweight: '#f59e0b',
  Obese: '#ef4444',
};

const AdminHealthAnalytics = () => {
  const [stats, setStats] = useState<HealthStats | null>(null);

  useEffect(() => {
    supabase.rpc('admin_health_stats').then(({ data }) => {
      if (data) setStats(data as unknown as HealthStats);
    });
  }, []);

  const kpis = [
    { label: 'Health Profiles', value: stats?.health_profiles_count ?? 0, icon: Activity, color: 'text-primary' },
    { label: 'Avg Sleep (30d)', value: stats?.avg_sleep_duration ? `${stats.avg_sleep_duration}h` : '—', icon: Moon, color: 'text-blue-500' },
    { label: 'Sleep Loggers (30d)', value: stats?.sleep_loggers_30d ?? 0, icon: Moon, color: 'text-violet-500' },
    { label: 'Weight Trackers', value: stats?.weight_trackers ?? 0, icon: Weight, color: 'text-amber-500' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Health Analytics</h1>

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
    </div>
  );
};

export default AdminHealthAnalytics;
