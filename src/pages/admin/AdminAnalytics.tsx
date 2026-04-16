import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(142,71%,35%)', 'hsl(45,100%,51%)', 'hsl(200,70%,50%)', 'hsl(280,60%,50%)', 'hsl(0,84%,60%)', 'hsl(30,90%,50%)'];

type Cohort = { cohort_week: string; cohort_size: number; d1: number; d3: number; d7: number; d14: number; d30: number };

const AdminAnalytics = () => {
  const [breakdown, setBreakdown] = useState<any>(null);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);

  useEffect(() => {
    const load = async () => {
      const bd = await api('api-admin', { params: { resource: 'user-breakdown' } });
      if (bd) setBreakdown(bd);

      const co = await api<Cohort[]>('api-admin', { params: { resource: 'retention-cohorts' } });
      if (co) setCohorts(co);
    };
    load();
    const i = setInterval(load, 60000);
    return () => clearInterval(i);
  }, []);

  const focusData = breakdown?.focus_areas?.map((f: any) => ({ name: f.area?.replace(/"/g, ''), value: Number(f.cnt) })) || [];
  const consistencyData = breakdown?.consistency_levels?.map((c: any) => ({ name: c.level, value: Number(c.cnt) })) || [];
  const countries = breakdown?.top_countries || [];
  const cities = breakdown?.top_cities || [];

  const retColor = (v: number | null) => {
    if (v === null || v === undefined) return '';
    if (v > 50) return 'bg-emerald-500/20 text-emerald-700';
    if (v > 20) return 'bg-amber-500/20 text-amber-700';
    return 'bg-red-500/20 text-red-700';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-5">
            <h2 className="font-semibold mb-3">Focus Areas</h2>
            {focusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={focusData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground">No data</p>}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="font-semibold mb-3">Consistency Level</h2>
            {consistencyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={consistencyData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {consistencyData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground">No data</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-5">
            <h2 className="font-semibold mb-3">Top Countries</h2>
            <div className="space-y-2">
              {countries.map((c: any, i: number) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{c.country}</span>
                  <span className="font-medium">{c.cnt}</span>
                </div>
              ))}
              {countries.length === 0 && <p className="text-sm text-muted-foreground">No data</p>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <h2 className="font-semibold mb-3">Top Cities</h2>
            <div className="space-y-2">
              {cities.map((c: any, i: number) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{c.city}</span>
                  <span className="font-medium">{c.cnt}</span>
                </div>
              ))}
              {cities.length === 0 && <p className="text-sm text-muted-foreground">No data</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <h2 className="font-semibold mb-3">Retention Cohorts</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4">Week</th>
                  <th className="text-right px-2">Size</th>
                  <th className="text-right px-2">D1</th>
                  <th className="text-right px-2">D3</th>
                  <th className="text-right px-2">D7</th>
                  <th className="text-right px-2">D14</th>
                  <th className="text-right px-2">D30</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((c, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 pr-4 whitespace-nowrap">{new Date(c.cohort_week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                    <td className="text-right px-2">{c.cohort_size}</td>
                    {[c.d1, c.d3, c.d7, c.d14, c.d30].map((v, j) => (
                      <td key={j} className="text-right px-2">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-xs ${retColor(v)}`}>
                          {v !== null && v !== undefined ? `${v}%` : '—'}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
                {cohorts.length === 0 && (
                  <tr><td colSpan={7} className="py-4 text-center text-muted-foreground">No data yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
