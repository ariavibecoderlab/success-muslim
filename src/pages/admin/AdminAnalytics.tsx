import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(120,61%,24%)', 'hsl(45,100%,51%)', 'hsl(0,84%,60%)', 'hsl(200,70%,50%)', 'hsl(280,60%,50%)'];

const AdminAnalytics = () => {
  const [moduleData, setModuleData] = useState<{ name: string; value: number }[]>([]);
  const [signupData, setSignupData] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      // Module breakdown from activity
      const { data: activity } = await supabase.from('user_activity').select('module');
      if (activity) {
        const counts: Record<string, number> = {};
        activity.forEach(a => { counts[a.module] = (counts[a.module] || 0) + 1; });
        setModuleData(Object.entries(counts).map(([name, value]) => ({ name, value })));
      }

      // Signups over time
      const { data: profiles } = await supabase.from('profiles').select('created_at').order('created_at');
      if (profiles) {
        const byDate: Record<string, number> = {};
        profiles.forEach(p => {
          const d = new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          byDate[d] = (byDate[d] || 0) + 1;
        });
        setSignupData(Object.entries(byDate).slice(-14).map(([date, count]) => ({ date, count })));
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold mb-4">User Signups</h2>
            {signupData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={signupData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(120,61%,24%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">No signup data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold mb-4">Module Usage</h2>
            {moduleData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={moduleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {moduleData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">No activity data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
