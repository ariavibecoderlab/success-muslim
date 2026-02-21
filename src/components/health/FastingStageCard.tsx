import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FASTING_STAGES, getCurrentStage, getNextStage, getStageProgress, type FastingStage } from '@/lib/fasting-stages';

interface FastingStageCardProps {
  elapsedHours: number;
}

export default function FastingStageCard({ elapsedHours }: FastingStageCardProps) {
  const stage = getCurrentStage(elapsedHours);
  const next = getNextStage(elapsedHours);
  const progress = getStageProgress(elapsedHours);
  const Icon = stage.icon;

  const formatHoursMinutes = (h: number) => {
    const hrs = Math.floor(h);
    const mins = Math.round((h - hrs) * 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  return (
    <Card className="border-primary/20">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                Lv.{stage.level}
              </span>
              <p className="text-sm font-bold">{stage.name}</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">{stage.description}</p>

        <p className="text-xs text-emerald-600 dark:text-emerald-400 leading-relaxed italic">
          🕌 {stage.islamicFraming}
        </p>

        {next && (
          <div className="space-y-1.5">
            <Progress value={progress} className="h-1.5" />
            <p className="text-[10px] text-muted-foreground">
              Next: <span className="font-medium text-foreground">{next.stage.name}</span> in {formatHoursMinutes(next.hoursUntil)}
            </p>
          </div>
        )}

        {!next && (
          <div className="space-y-1.5">
            <Progress value={100} className="h-1.5" />
            <p className="text-[10px] font-medium text-primary">Maximum fasting stage reached!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StagesTimelineProps {
  elapsedHours: number;
}

export function StagesTimeline({ elapsedHours }: StagesTimelineProps) {
  const currentStage = getCurrentStage(elapsedHours);
  const [preview, setPreview] = useState<FastingStage | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
        {FASTING_STAGES.map((s) => {
          const isCompleted = elapsedHours >= s.endHours;
          const isCurrent = s.level === currentStage.level;
          const isFuture = !isCompleted && !isCurrent;
          const Icon = s.icon;

          return (
            <button
              key={s.level}
              onClick={() => setPreview(preview?.level === s.level ? null : s)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all min-w-[52px] ${
                isCurrent
                  ? 'bg-primary/10'
                  : preview?.level === s.level
                  ? 'bg-secondary'
                  : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-primary text-primary-foreground'
                    : isCurrent
                    ? 'bg-primary text-primary-foreground animate-pulse'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className={`text-[9px] font-medium ${isFuture ? 'text-muted-foreground/50' : 'text-foreground'}`}>
                Lv.{s.level}
              </span>
            </button>
          );
        })}
      </div>

      {preview && (
        <Card className="bg-secondary/50">
          <CardContent className="p-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                Lv.{preview.level}
              </span>
              <p className="text-sm font-semibold">{preview.name}</p>
              <span className="text-[10px] text-muted-foreground ml-auto">{preview.startHours}–{preview.endHours}h</span>
            </div>
            <p className="text-xs text-muted-foreground">{preview.description}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 italic">🕌 {preview.islamicFraming}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
