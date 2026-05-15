'use client';

import { Card, CardTitle } from '@/components/ui/Card';
import { formatDistanceToNow } from 'date-fns';

interface FastingStatusCardProps {
  startTime: string;
  targetHours: number | null;
  fastingType: string;
}

export function FastingStatusCard({ startTime, targetHours, fastingType }: FastingStatusCardProps) {
  const start = new Date(startTime);
  const now = new Date();
  const elapsedMs = now.getTime() - start.getTime();
  const elapsedHours = elapsedMs / (1000 * 60 * 60);
  const elapsedMins = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
  const progress = targetHours ? Math.min(100, (elapsedHours / targetHours) * 100) : 0;

  const formatType = (t: string) =>
    t
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Card>
      <CardTitle>Fasting</CardTitle>
      <p className="text-sm text-gray-600 mb-2">{formatType(fastingType)}</p>
      <p className="text-lg font-semibold text-primary mb-2">
        {Math.floor(elapsedHours)}h {elapsedMins}m
      </p>
      {targetHours && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </Card>
  );
}
