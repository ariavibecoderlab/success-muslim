'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const [wakeTime, setWakeTime] = useState('06:00');
  const [sleepTime, setSleepTime] = useState('22:30');
  const [goal1, setGoal1] = useState('');
  const [goal2, setGoal2] = useState('');
  const [goal3, setGoal3] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
      }
    };
    checkUser();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal1.trim()) {
      setMessage({ type: 'error', text: 'Please add at least one goal.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('daily_plans').upsert(
        {
          user_id: user.id,
          wake_time: wakeTime,
          sleep_time: sleepTime,
          goal_1: goal1.trim(),
          goal_2: goal2.trim() || null,
          goal_3: goal3.trim() || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
      if (error) throw error;

      await supabase.from('profiles').update({
        updated_at: new Date().toISOString(),
      }).eq('id', user.id);

      router.push('/app/today');
      router.refresh();
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">Set Your Daily Structure</h1>
          <p className="text-gray-600">Win the day — one small step at a time.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="wakeTime" className="block text-sm font-medium text-gray-700 mb-1">
                Wake Time
              </label>
              <input
                id="wakeTime"
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-card border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="sleepTime" className="block text-sm font-medium text-gray-700 mb-1">
                Sleep Time
              </label>
              <input
                id="sleepTime"
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-card border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your 3 Daily Goals <span className="text-gray-500">(at least 1 required)</span>
            </label>
            <input
              type="text"
              value={goal1}
              onChange={(e) => setGoal1(e.target.value)}
              placeholder="e.g. Read Quran 10 min"
              required
              className="w-full px-4 py-3 rounded-card border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary mb-2"
            />
            <input
              type="text"
              value={goal2}
              onChange={(e) => setGoal2(e.target.value)}
              placeholder="e.g. Exercise 20 min"
              className="w-full px-4 py-3 rounded-card border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary mb-2"
            />
            <input
              type="text"
              value={goal3}
              onChange={(e) => setGoal3(e.target.value)}
              placeholder="e.g. Family time 30 min"
              className="w-full px-4 py-3 rounded-card border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded-card text-sm ${
                message.type === 'success' ? 'bg-primary-50 text-primary' : 'bg-red-50 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-primary text-white font-medium rounded-card hover:bg-primary-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Get Started'}
          </button>
        </form>
      </div>
    </div>
  );
}
