'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardTitle } from '@/components/ui/Card';
import { format } from 'date-fns';

interface MovementTabProps {
  movementLogs: Record<string, unknown>[];
  userId: string;
}

export function MovementTab({ movementLogs, userId }: MovementTabProps) {
  const [activityType, setActivityType] = useState<'walk' | 'run'>('walk');
  const [durationMin, setDurationMin] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!durationMin) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('movement_logs').insert({
        user_id: userId,
        activity_type: activityType,
        duration_min: parseInt(durationMin, 10),
        distance_km: distanceKm ? parseFloat(distanceKm) : null,
        notes: notes || null,
      });
      if (error) throw error;
      setDurationMin('');
      setDistanceKm('');
      setNotes('');
      setShowForm(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowForm(true)}
        className="w-full py-4 bg-primary text-white rounded-card font-medium hover:bg-primary-600"
      >
        Log Walk/Run
      </button>

      {showForm && (
        <Card>
          <CardTitle>Log Movement</CardTitle>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as 'walk' | 'run')}
                className="w-full px-4 py-3 rounded-card border border-gray-300"
              >
                <option value="walk">Walk</option>
                <option value="run">Run</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes) *
              </label>
              <input
                type="number"
                min={1}
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-card border border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distance (km) - optional
              </label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                className="w-full px-4 py-3 rounded-card border border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes - optional
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
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
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 border border-gray-300 rounded-card font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {movementLogs.length > 0 && (
        <Card>
          <CardTitle>Recent Activity</CardTitle>
          <ul className="space-y-2 mt-2">
            {movementLogs.map((m: Record<string, unknown>) => (
              <li
                key={m.id as string}
                className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-0"
              >
                <span className="capitalize">
                  {m.activity_type as string} - {m.duration_min} min
                  {m.distance_km && ` (${m.distance_km} km)`}
                </span>
                <span className="text-gray-600">
                  {format(new Date(m.created_at as string), 'MMM d')}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
