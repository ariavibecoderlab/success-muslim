'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardTitle } from '@/components/ui/Card';
import { format } from 'date-fns';

const FASTING_TYPES = [
  { value: 'ramadan', label: 'Ramadan', hours: null },
  { value: 'sunnah', label: 'Sunnah (Mon/Thu)', hours: null },
  { value: 'ayyamul_bidh', label: 'Ayyamul Bidh', hours: null },
  { value: 'if_16_8', label: 'IF 16:8', hours: 16 },
  { value: 'if_18_6', label: 'IF 18:6', hours: 18 },
  { value: 'omad', label: 'OMAD', hours: 23 },
  { value: 'custom', label: 'Custom', hours: null },
];

interface FastingTabProps {
  activeFasting: Record<string, unknown> | null;
  fastingHistory: Record<string, unknown>[];
  userId: string;
}

export function FastingTab({
  activeFasting,
  fastingHistory,
  userId,
}: FastingTabProps) {
  const [showStart, setShowStart] = useState(false);
  const [type, setType] = useState('if_16_8');
  const [customHours, setCustomHours] = useState(16);
  const [confirm24h, setConfirm24h] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const selectedType = FASTING_TYPES.find((t) => t.value === type);
  const targetHours = selectedType?.hours ?? customHours;
  const is24hPlus = targetHours >= 24;

  const handleStartFast = async () => {
    if (is24hPlus && !confirm24h) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('fasting_sessions').insert({
        user_id: userId,
        fasting_type: type,
        start_time: new Date().toISOString(),
        target_hours: targetHours,
      });
      if (error) throw error;
      setShowStart(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEndFast = async () => {
    if (!activeFasting?.id) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('fasting_sessions')
        .update({ end_time: new Date().toISOString() })
        .eq('id', activeFasting.id);
      if (error) throw error;
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {activeFasting ? (
        <>
          <FastingTimer
            startTime={activeFasting.start_time as string}
            targetHours={activeFasting.target_hours as number | null}
            fastingType={activeFasting.fasting_type as string}
          />
          <button
            onClick={handleEndFast}
            disabled={loading}
            className="w-full py-3 border border-red-300 text-red-700 rounded-card font-medium hover:bg-red-50 disabled:opacity-50"
          >
            End Fast
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => setShowStart(true)}
            className="w-full py-4 bg-primary text-white rounded-card font-medium hover:bg-primary-600"
          >
            Start Fast
          </button>

          {showStart && (
            <Card className="mt-4">
              <CardTitle>Start Fasting</CardTitle>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fasting Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-3 rounded-card border border-gray-300"
                  >
                    {FASTING_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                {type === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hours
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={48}
                      value={customHours}
                      onChange={(e) => setCustomHours(parseInt(e.target.value, 10))}
                      className="w-full px-4 py-3 rounded-card border border-gray-300"
                    />
                  </div>
                )}
                {is24hPlus && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-card">
                    <p className="text-sm text-amber-800 font-medium mb-2">
                      Extended fasting notice
                    </p>
                    <p className="text-sm text-amber-700 mb-3">
                      Fasts of 24 hours or more should be done under medical supervision. Consult your doctor before starting.
                    </p>
                    <label className="flex items-center gap-2 text-sm text-amber-800">
                      <input
                        type="checkbox"
                        checked={confirm24h}
                        onChange={(e) => setConfirm24h(e.target.checked)}
                      />
                      I have consulted my doctor or understand the risks
                    </label>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleStartFast}
                    disabled={loading || (is24hPlus && !confirm24h)}
                    className="flex-1 py-3 bg-primary text-white rounded-card font-medium disabled:opacity-50"
                  >
                    {loading ? 'Starting...' : 'Start'}
                  </button>
                  <button
                    onClick={() => setShowStart(false)}
                    className="flex-1 py-3 border border-gray-300 rounded-card font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Card>
          )}

          <Card className="mt-4">
            <p className="text-sm text-gray-600 italic">
              &quot;Fasting is a shield; so when one of you fasts, let him not speak obscenely...&quot;
              — Prophet Muhammad ﷺ
            </p>
          </Card>
        </>
      )}

      {fastingHistory.length > 0 && (
        <Card>
          <CardTitle>Recent Fasts</CardTitle>
          <ul className="space-y-2 mt-2">
            {fastingHistory.map((f: Record<string, unknown>) => (
              <li
                key={f.id as string}
                className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-0"
              >
                <span className="capitalize">
                  {(f.fasting_type as string).replace(/_/g, ' ')}
                </span>
                <span className="text-gray-600">
                  {format(new Date(f.start_time as string), 'MMM d')}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function FastingTimer({
  startTime,
  targetHours,
  fastingType,
}: {
  startTime: string;
  targetHours: number | null;
  fastingType: string;
}) {
  const [elapsed, setElapsed] = useState(() => {
    const start = new Date(startTime).getTime();
    return Math.floor((Date.now() - start) / 1000);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const start = new Date(startTime).getTime();
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const hours = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  const secs = elapsed % 60;
  const progress = targetHours ? Math.min(100, (hours + mins / 60) / targetHours * 100) : 0;

  return (
    <Card>
      <CardTitle>Fasting: {(fastingType as string).replace(/_/g, ' ')}</CardTitle>
      <p className="text-3xl font-mono font-bold text-primary my-4">
        {hours}h {mins}m {secs}s
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
