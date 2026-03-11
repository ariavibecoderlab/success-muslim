import { Droplets, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useHydration, useHydrationMutation } from '@/hooks/useHealthQuery';
import type { WidgetSize } from '@/lib/widget-registry';

export default function HydrationWidget({ size }: { size: WidgetSize }) {
  const { data: hydration } = useHydration();
  const { addCup: addCupMutation } = useHydrationMutation();
  const pct = Math.round((hydration.cups / hydration.goal) * 100);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addCupMutation.mutate(undefined);
  };

  if (size === 'small') {
    return (
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-3 text-center">
          <Droplets className="h-4 w-4 mx-auto text-blue-500 mb-1" />
          <p className="text-sm font-bold">{hydration.cups}/{hydration.goal}</p>
          <p className="text-[9px] text-muted-foreground">Water</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Droplets className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold">Hydration</p>
              <p className="text-xs text-muted-foreground">{hydration.cups} / {hydration.goal} glasses · {pct}%</p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={handleAdd}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        <Progress value={Math.min(pct, 100)} className="h-1.5" />
      </CardContent>
    </Card>
  );
}
