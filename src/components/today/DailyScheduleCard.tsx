'use client';

import Link from 'next/link';
import { Card, CardTitle } from '@/components/ui/Card';

interface DailyScheduleCardProps {
  wakeTime: string;
  sleepTime: string;
}

function formatTime(time: string): string {
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

export function DailyScheduleCard({ wakeTime, sleepTime }: DailyScheduleCardProps) {
  return (
    <Card>
      <div className="flex justify-between items-center">
        <CardTitle>Daily Schedule</CardTitle>
        <Link
          href="/app/settings"
          className="text-sm text-primary hover:underline"
        >
          Edit
        </Link>
      </div>
      <div className="flex gap-6 text-gray-600">
        <div>
          <span className="text-xs text-gray-500 block">Wake</span>
          <span className="font-medium">{formatTime(wakeTime)}</span>
        </div>
        <div>
          <span className="text-xs text-gray-500 block">Sleep</span>
          <span className="font-medium">{formatTime(sleepTime)}</span>
        </div>
      </div>
    </Card>
  );
}
