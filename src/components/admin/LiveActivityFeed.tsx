import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Activity } from 'lucide-react';

type FeedItem = {
  id: string;
  display_name: string;
  module: string;
  action: string;
  created_at: string;
};

export function LiveActivityFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.rpc('admin_live_feed', { _limit: 15 });
      if (data) setItems(data as unknown as FeedItem[]);
    };
    load();
    const i = setInterval(load, 30000);
    return () => clearInterval(i);
  }, []);

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <Card className="bg-card/70 backdrop-blur-sm border-border/50 rounded-xl shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-emerald-500" />
          <h2 className="font-semibold">Live Activity</h2>
        </div>
        {items.length > 0 ? (
          <div className="space-y-2.5 max-h-[320px] overflow-y-auto">
            {items.map(item => (
              <div key={item.id} className="flex items-start gap-2.5 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="truncate">
                    <span className="font-medium">{item.display_name}</span>{' '}
                    <span className="text-muted-foreground">{item.action}</span>{' '}
                    <span className="text-xs text-muted-foreground/70">in {item.module}</span>
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(item.created_at)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No recent activity.</p>
        )}
      </CardContent>
    </Card>
  );
}
