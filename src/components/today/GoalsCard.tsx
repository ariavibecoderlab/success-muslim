'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardTitle } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/client';
import { AiCoachModal } from './AiCoachModal';

type GoalStatus = 'done' | 'partial' | 'missed';

interface Goal {
  index: 1 | 2 | 3;
  text: string;
  status: GoalStatus | null;
  note?: string | null;
}

interface GoalsCardProps {
  goals: Goal[];
  planId: string | null;
  userId: string;
  date: string;
}

export function GoalsCard({ goals, planId, userId, date }: GoalsCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<number | null>(null);
  const [aiMessage, setAiMessage] = useState<{ message: string; suggested_next?: string } | null>(null);
  const supabase = createClient();

  const handleStatus = async (goalIndex: number, status: GoalStatus) => {
    if (!planId) return;
    setLoading(goalIndex);
    try {
      const { error } = await supabase.from('habit_check_ins').upsert(
        {
          user_id: userId,
          plan_id: planId,
          check_in_date: date,
          goal_index: goalIndex,
          status,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,check_in_date,goal_index' }
      );
      if (error) throw error;

      const goal = goals.find((g) => g.index === goalIndex);
      if (goal && (status === 'done' || status === 'missed')) {
        try {
          const res = await fetch('/api/ai-coach', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ goal: goal.text, status }),
          });
          const data = await res.json();
          if (data.message) setAiMessage(data);
        } catch {
          // AI optional - don't block
        }
      }

      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  const filteredGoals = goals.filter((g) => g.text);

  return (
    <>
      <Card>
        <CardTitle>Today&apos;s Goals</CardTitle>
        <div className="space-y-3">
          {filteredGoals.map((goal) => (
            <div
              key={goal.index}
              className="flex items-center justify-between gap-2 py-2 border-b border-gray-100 last:border-0"
            >
              <span className="text-gray-700 flex-1 truncate">{goal.text}</span>
              <div className="flex gap-1 shrink-0">
                {(['done', 'partial', 'missed'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatus(goal.index, s)}
                    disabled={loading !== null}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                      goal.status === s
                        ? s === 'done'
                          ? 'bg-green-100 text-green-700'
                          : s === 'partial'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    title={s === 'done' ? 'Done' : s === 'partial' ? 'Partial' : 'Missed'}
                  >
                    {s === 'done' ? '✓' : s === 'partial' ? '−' : '✗'}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {aiMessage && (
        <AiCoachModal
          message={aiMessage.message}
          suggestedNext={aiMessage.suggested_next}
          onClose={() => setAiMessage(null)}
        />
      )}
    </>
  );
}
