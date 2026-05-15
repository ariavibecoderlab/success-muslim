'use client';

import { Card, CardTitle } from '@/components/ui/Card';
import type { PrayerTimeEntry } from '@/lib/prayer-times';
import { getNextPrayer } from '@/lib/prayer-times';

interface PrayerTimelineCardProps {
  prayers: PrayerTimeEntry[];
}

export function PrayerTimelineCard({ prayers }: PrayerTimelineCardProps) {
  const next = getNextPrayer(prayers);

  return (
    <Card>
      <CardTitle>Prayer Times</CardTitle>
      {next && (
        <p className="text-sm text-primary font-medium mb-3">
          Next: {next.prayer.name} in {next.countdown}
        </p>
      )}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {prayers.map((p) => (
          <div
            key={p.name}
            className={`shrink-0 px-3 py-2 rounded-lg text-center ${
              next?.prayer.name === p.name ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <div className="text-xs font-medium">{p.name}</div>
            <div className="text-sm">{p.formatted}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
