'use client';

import type { PrayerTimeEntry } from '@/lib/prayer-times';
import { Card } from '@/components/ui/Card';

interface IbadahClientProps {
  prayers: PrayerTimeEntry[];
}

export function IbadahClient({ prayers }: IbadahClientProps) {
  const nextPrayer = prayers.find((p) => p.time > new Date());
  const countdown = nextPrayer
    ? Math.max(
        0,
        Math.floor((nextPrayer.time.getTime() - Date.now()) / 60000)
      )
    : 0;
  const hours = Math.floor(countdown / 60);
  const mins = countdown % 60;

  return (
    <Card className="mb-4 p-4">
      {nextPrayer ? (
        <div>
          <p className="text-sm text-gray-600">Next prayer</p>
          <p className="text-xl font-bold text-primary">{nextPrayer.name}</p>
          <p className="text-2xl font-mono text-gray-900 mt-1">
            {hours}h {mins}m
          </p>
        </div>
      ) : (
        <p className="text-gray-600">All prayers for today completed.</p>
      )}
    </div>
  );
}
