import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api-client';
import type { WidgetSize } from '@/lib/widget-registry';

export default function DakwahWidget({ size }: { size: WidgetSize }) {
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    api<{ id: string; date: string }[]>('api-misc', {
      params: { resource: 'dakwah' },
    }).then((data) => {
      if (data?.length) {
        const today = new Date().toISOString().split('T')[0];
        setHasNew(data[0].date === today);
      }
    }).catch(() => {});
  }, []);

  if (size === 'small') {
    return (
      <Link to="/iman/dakwah">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3 text-center">
            <Megaphone className="h-4 w-4 mx-auto text-accent-foreground mb-1" />
            <p className="text-[10px] font-medium">{hasNew ? 'New!' : "Da'wah"}</p>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link to="/iman/dakwah">
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
            <Megaphone className="h-4 w-4 text-accent-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Da'wah Today</p>
            <p className="text-xs text-muted-foreground">
              {hasNew ? 'New poster available' : 'Check for new content'}
            </p>
          </div>
          <span className="text-[10px] text-primary font-medium">View →</span>
        </CardContent>
      </Card>
    </Link>
  );
}
