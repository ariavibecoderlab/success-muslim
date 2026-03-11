import { Link } from 'react-router-dom';
import { Star, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getSunnahItems } from '@/lib/sunnah-storage';
import { useSunnahLog } from '@/hooks/useSunnahQuery';
import type { WidgetSize } from '@/lib/widget-registry';

export default function SolatSunatWidget({ size }: { size: WidgetSize }) {
  const items = getSunnahItems().filter(i => i.enabled && i.category === 'prayer');
  const { data: log } = useSunnahLog();
  
  const prayerItems = [
    { id: 'dhuha', label: 'Dhuha' },
    { id: 'rawatib-dhuhr-before', label: 'Rawatib' },
    { id: 'witr', label: 'Witir' },
  ];

  if (size === 'small') {
    const done = prayerItems.filter(p => log.completed.includes(p.id)).length;
    return (
      <Link to="/iman/sunnah">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3 text-center">
            <Star className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-sm font-bold">{done}/{prayerItems.length}</p>
            <p className="text-[9px] text-muted-foreground">Sunat</p>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link to="/iman/sunnah">
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Star className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm font-semibold">Solat Sunat</p>
          </div>
          <div className="flex items-center gap-3">
            {prayerItems.map(p => {
              const done = log.completed.includes(p.id);
              return (
                <div key={p.id} className="flex items-center gap-1.5">
                  <span className="text-xs">{p.label}</span>
                  {done ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <div className="h-3.5 w-3.5 rounded border border-border" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
