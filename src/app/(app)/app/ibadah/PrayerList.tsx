'use client';

import type { PrayerTimeEntry } from '@/lib/prayer-times';
import { getNextPrayer } from '@/lib/prayer-times';

interface PrayerListProps {
  prayers: PrayerTimeEntry[];
}

export function PrayerList({ prayers }: PrayerListProps) {
  const next = getNextPrayer(prayers);

  return (
    <ul className="space-y-2">
      {prayers.map((p) => (
        <li
          key={p.name}
          className={`flex justify-between items-center py-2 px-3 rounded-lg ${
            next?.prayer.name === p.name ? 'bg-primary-50 text-primary' : 'bg-gray-50'
          }`}
        >
          <span className="font-medium">{p.name}</span>
          <span className="text-sm">{p.formatted}</span>
        </li>
      ))}
    </ul>
  );
}
