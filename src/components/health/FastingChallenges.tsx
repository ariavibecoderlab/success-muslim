import { useState, useEffect } from 'react';
import { Trophy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FASTING_CHALLENGES, type FastingChallenge } from '@/lib/if-educational-content';
import type { IFSession } from '@/lib/health-storage';

interface JoinedChallenge {
  id: string;
  joinedAt: string;
}

const STORAGE_KEY = 'if_challenges_joined';

function getJoined(): JoinedChallenge[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

function joinChallenge(id: string) {
  const joined = getJoined();
  if (!joined.find(j => j.id === id)) {
    joined.push({ id, joinedAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(joined));
  }
}

function getChallengeProgress(challenge: FastingChallenge, joined: JoinedChallenge | undefined, sessions: IFSession[]): number {
  if (!joined) return 0;
  const start = new Date(joined.joinedAt).getTime();
  const end = start + challenge.durationDays * 86400000;

  if (challenge.targetHours === 0) {
    // Count consecutive days with completed fasts
    let days = 0;
    const now = Date.now();
    for (let d = start; d < Math.min(now, end); d += 86400000) {
      const dayStr = new Date(d).toISOString().slice(0, 10);
      const hasFast = sessions.some(s => s.completed && s.startTime?.slice(0, 10) === dayStr);
      if (hasFast) days++;
    }
    return Math.min(100, (days / challenge.durationDays) * 100);
  }

  const totalHours = sessions
    .filter(s => s.completed && s.startTime && s.endTime)
    .filter(s => {
      const t = new Date(s.startTime).getTime();
      return t >= start && t <= end;
    })
    .reduce((acc, s) => {
      const dur = (new Date(s.endTime!).getTime() - new Date(s.startTime).getTime()) / 3600000;
      return acc + dur;
    }, 0);

  return Math.min(100, (totalHours / challenge.targetHours) * 100);
}

export default function FastingChallenges({ sessions }: { sessions: IFSession[] }) {
  const [joined, setJoined] = useState(getJoined);

  const handleJoin = (id: string) => {
    joinChallenge(id);
    setJoined(getJoined());
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Trophy className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Fasting Challenges</span>
      </div>
      {FASTING_CHALLENGES.map(ch => {
        const j = joined.find(jj => jj.id === ch.id);
        const prog = getChallengeProgress(ch, j, sessions);
        return (
          <div key={ch.id} className="rounded-xl border border-border bg-card p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold">{ch.title}</p>
                <p className="text-[10px] text-muted-foreground">{ch.description}</p>
              </div>
              {!j ? (
                <Button size="sm" variant="outline" className="text-xs h-7 px-3" onClick={() => handleJoin(ch.id)}>
                  Join
                </Button>
              ) : (
                <span className="text-[10px] text-primary font-medium">{Math.round(prog)}%</span>
              )}
            </div>
            {j && <Progress value={prog} className="h-1.5" />}
          </div>
        );
      })}
    </div>
  );
}
