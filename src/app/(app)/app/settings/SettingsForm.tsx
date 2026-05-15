'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface SettingsFormProps {
  planId: string;
  wakeTime: string;
  sleepTime: string;
  goal1: string;
  goal2: string;
  goal3: string;
}

export function SettingsForm({
  planId,
  wakeTime,
  sleepTime,
  goal1,
  goal2,
  goal3,
}: SettingsFormProps) {
  const router = useRouter();
  const [w, setW] = useState(wakeTime);
  const [s, setS] = useState(sleepTime);
  const [g1, setG1] = useState(goal1);
  const [g2, setG2] = useState(goal2);
  const [g3, setG3] = useState(goal3);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('daily_plans')
        .update({
          wake_time: w,
          sleep_time: s,
          goal_1: g1,
          goal_2: g2 || null,
          goal_3: g3 || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', planId);
      if (error) throw error;
      router.push('/app/today');
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Wake Time</label>
          <input
            type="time"
            value={w}
            onChange={(e) => setW(e.target.value)}
            className="w-full px-4 py-3 rounded-card border border-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sleep Time</label>
          <input
            type="time"
            value={s}
            onChange={(e) => setS(e.target.value)}
            className="w-full px-4 py-3 rounded-card border border-gray-300"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Goal 1</label>
        <input
          type="text"
          value={g1}
          onChange={(e) => setG1(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-card border border-gray-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Goal 2</label>
        <input
          type="text"
          value={g2}
          onChange={(e) => setG2(e.target.value)}
          className="w-full px-4 py-3 rounded-card border border-gray-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Goal 3</label>
        <input
          type="text"
          value={g3}
          onChange={(e) => setG3(e.target.value)}
          className="w-full px-4 py-3 rounded-card border border-gray-300"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 bg-primary text-white rounded-card font-medium disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
        <Link
          href="/app/today"
          className="flex-1 py-3 border border-gray-300 rounded-card font-medium text-center"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
