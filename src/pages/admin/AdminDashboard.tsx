import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Users, BookOpen, Flame, CalendarCheck } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      const { data: statsData } = await supabase.from('app_stats').select('stat_key, stat_value');
      if (statsData) {
        const map: Record<string, number> = {};
        statsData.forEach(s => { map[s.stat_key] = Number(s.stat_value); });
        setStats(map);
      }

      const { count } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
      setUserCount(count || 0);
    };
    loadStats();
  }, []);

  const cards = [
    { label: 'Total Users', value: userCount, icon: Users, color: 'bg-primary/10 text-primary' },
    { label: 'Prayers Tracked', value: stats.total_prayers || 0, icon: BookOpen, color: 'bg-accent/20 text-accent-foreground' },
    { label: 'Dhikr Counted', value: stats.total_dhikr || 0, icon: Flame, color: 'bg-primary/10 text-primary' },
    { label: 'Fasts Tracked', value: stats.total_fasts || 0, icon: CalendarCheck, color: 'bg-accent/20 text-accent-foreground' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(c => (
          <Card key={c.label}>
            <CardContent className="p-5 flex flex-col gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{c.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4">Recent Activity</h2>
          <p className="text-sm text-muted-foreground">Activity feed will populate as users engage with the app.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
