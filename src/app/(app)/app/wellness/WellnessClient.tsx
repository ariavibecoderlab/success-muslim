'use client';

import { useState } from 'react';
import { FastingTab } from './FastingTab';
import { MovementTab } from './MovementTab';

interface WellnessClientProps {
  activeFasting: Record<string, unknown> | null;
  fastingHistory: Record<string, unknown>[];
  movementLogs: Record<string, unknown>[];
  userId: string;
}

export function WellnessClient({
  activeFasting,
  fastingHistory,
  movementLogs,
  userId,
}: WellnessClientProps) {
  const [tab, setTab] = useState<'fasting' | 'movement'>('fasting');

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('fasting')}
          className={`flex-1 py-2 rounded-card font-medium ${
            tab === 'fasting'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          Fasting
        </button>
        <button
          onClick={() => setTab('movement')}
          className={`flex-1 py-2 rounded-card font-medium ${
            tab === 'movement'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          Movement
        </button>
      </div>

      {tab === 'fasting' ? (
        <FastingTab
          activeFasting={activeFasting}
          fastingHistory={fastingHistory}
          userId={userId}
        />
      ) : (
        <MovementTab movementLogs={movementLogs} userId={userId} />
      )}
    </div>
  );
}
