import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { WidgetSize } from '@/lib/widget-registry';

export default function SadaqahWidget({ size }: { size: WidgetSize }) {
  const { user } = useAuth();
  const [monthTotal, setMonthTotal] = useState(0);
  const [goal, setGoal] = useState(500);
  const [currency, setCurrency] = useState('MYR');

  useEffect(() => {
    if (!user) return;
    const now = new Date();
    const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    Promise.all([
      supabase
        .from('sadaqah_donations')
        .select('amount')
        .eq('user_id', user.id)
        .gte('date', startOfMonth),
      supabase
        .from('sadaqah_goals')
        .select('monthly_target, currency')
        .eq('user_id', user.id)
        .maybeSingle(),
    ]).then(([donationsRes, goalRes]) => {
      if (donationsRes.data) {
        setMonthTotal(donationsRes.data.reduce((s, d) => s + Number(d.amount), 0));
      }
      if (goalRes.data) {
        setGoal(Number(goalRes.data.monthly_target) || 500);
        setCurrency(goalRes.data.currency || 'MYR');
      }
    });
  }, [user]);

  const pct = goal > 0 ? Math.round((monthTotal / goal) * 100) : 0;

  if (size === 'small') {
    return (
      <Link to="/iman/sadaqah">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3 text-center">
            <Heart className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-sm font-bold">{currency} {monthTotal}</p>
            <p className="text-[9px] text-muted-foreground">Sadaqah</p>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link to="/iman/sadaqah">
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Heart className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Sadaqah This Month</p>
              <p className="text-xs text-muted-foreground">{currency} {monthTotal} / {currency} {goal} goal</p>
            </div>
          </div>
          <Progress value={Math.min(pct, 100)} className="h-1.5" />
          <p className="text-[10px] text-muted-foreground mt-1 text-right">{pct}%</p>
        </CardContent>
      </Card>
    </Link>
  );
}
