import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Moon, BookOpen, Heart, HandCoins, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

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

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const AdminImanAnalytics = () => {
  const [stats, setStats] = useState<ImanStats | null>(null);

  useEffect(() => {
    supabase.rpc('admin_iman_stats').then(({ data }) => {
      if (data) setStats(data as unknown as ImanStats);
    });
  }, []);

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Iman Analytics</h1>

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
        {/* Prayer Status Breakdown */}
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
            <h2 className="font-semibold mb-4">Most Missed (30 Days)</h2>
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
    </div>
  );
};

export default AdminImanAnalytics;
