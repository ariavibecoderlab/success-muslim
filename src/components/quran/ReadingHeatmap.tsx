import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ReadingHeatmapProps {
  sessions: { date: string; pages_read?: number; ayahs_read?: number }[];
}

const ReadingHeatmap = ({ sessions }: ReadingHeatmapProps) => {
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    const days: { date: string; level: number }[] = [];

    // Group sessions by date
    const dateMap = new Map<string, number>();
    sessions.forEach(s => {
      const key = s.date;
      dateMap.set(key, (dateMap.get(key) || 0) + Number(s.pages_read || 0));
    });

    // Generate last 90 days
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const pages = dateMap.get(key) || 0;
      const level = pages === 0 ? 0 : pages < 1 ? 1 : pages < 3 ? 2 : pages < 5 ? 3 : 4;
      days.push({ date: key, level });
    }

    // Pad start to align to Sunday
    const firstDay = new Date(days[0].date).getDay();
    const padded = [...Array(firstDay).fill({ date: '', level: -1 }), ...days];

    // Split into weeks (columns)
    const w: typeof padded[] = [];
    for (let i = 0; i < padded.length; i += 7) {
      w.push(padded.slice(i, i + 7));
    }

    // Month labels
    const ml: { label: string; col: number }[] = [];
    let lastMonth = -1;
    w.forEach((week, col) => {
      const validDay = week.find(d => d.date);
      if (validDay?.date) {
        const month = new Date(validDay.date).getMonth();
        if (month !== lastMonth) {
          ml.push({ label: new Date(validDay.date).toLocaleString('en', { month: 'short' }), col });
          lastMonth = month;
        }
      }
    });

    return { weeks: w, monthLabels: ml };
  }, [sessions]);

  const levelColors = [
    'bg-secondary',           // 0 - no reading
    'bg-primary/20',          // 1 - light
    'bg-primary/40',          // 2 - moderate
    'bg-primary/60',          // 3 - good
    'bg-primary',             // 4 - excellent
  ];

  return (
    <Card>
      <CardContent className="p-3">
        <p className="text-xs font-medium mb-2">Reading Activity (90 days)</p>

        {/* Month labels */}
        <div className="flex gap-[3px] mb-1 ml-0">
          {monthLabels.map((m, i) => (
            <span
              key={i}
              className="text-[9px] text-muted-foreground"
              style={{ position: 'relative', left: m.col * 13 }}
            >
              {i === 0 || monthLabels[i - 1]?.col !== m.col ? m.label : ''}
            </span>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-[3px] overflow-x-auto">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => (
                <div
                  key={`${wi}-${di}`}
                  className={`w-[10px] h-[10px] rounded-sm ${day.level < 0 ? 'bg-transparent' : levelColors[day.level]}`}
                  title={day.date ? `${day.date}: ${day.level > 0 ? 'Read' : 'No reading'}` : ''}
                />
              ))}
              {/* Pad to 7 if week is short */}
              {week.length < 7 && [...Array(7 - week.length)].map((_, pi) => (
                <div key={`pad-${pi}`} className="w-[10px] h-[10px] rounded-sm bg-transparent" />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1 mt-2 justify-end">
          <span className="text-[9px] text-muted-foreground mr-1">Less</span>
          {levelColors.map((c, i) => (
            <div key={i} className={`w-[10px] h-[10px] rounded-sm ${c}`} />
          ))}
          <span className="text-[9px] text-muted-foreground ml-1">More</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReadingHeatmap;
