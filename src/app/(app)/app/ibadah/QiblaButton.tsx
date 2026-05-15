'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { getQiblaDirection } from '@/lib/qibla';

interface QiblaButtonProps {
  lat: number;
  lng: number;
}

export function QiblaButton({ lat, lng }: QiblaButtonProps) {
  const [showDirection, setShowDirection] = useState(false);

  const degrees = getQiblaDirection(lat, lng);
  const cardinal =
    degrees < 22.5
      ? 'N'
      : degrees < 67.5
      ? 'NE'
      : degrees < 112.5
      ? 'E'
      : degrees < 157.5
      ? 'SE'
      : degrees < 202.5
      ? 'S'
      : degrees < 247.5
      ? 'SW'
      : degrees < 292.5
      ? 'W'
      : degrees < 337.5
      ? 'NW'
      : 'N';

  return (
    <Card>
      <button
        onClick={() => setShowDirection(!showDirection)}
        className="w-full py-4 flex flex-col items-center justify-center gap-2 bg-primary text-white rounded-card font-medium hover:bg-primary-600 transition"
      >
        <span className="text-2xl">🕌</span>
        <span>Qibla Direction</span>
        {showDirection && (
          <div className="mt-2 text-lg font-mono">
            {degrees.toFixed(1)}° ({cardinal})
          </div>
        )}
      </button>
    </Card>
  );
}
