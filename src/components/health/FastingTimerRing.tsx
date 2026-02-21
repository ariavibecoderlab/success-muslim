import { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  elapsed: number;
  remaining: number;
  progress: number;
  level: number;
  mode: string;
}

function getLevelColor(level: number): string {
  if (level <= 3) return 'hsl(142, 70%, 45%)';
  if (level <= 6) return 'hsl(172, 66%, 45%)';
  return 'hsl(210, 70%, 50%)';
}

export default function FastingTimerRing({ elapsed, remaining, progress, level, mode }: Props) {
  const [showRemaining, setShowRemaining] = useState(false);

  const circumference = 2 * Math.PI * 72;
  const dashOffset = circumference - (progress / 100) * circumference;
  const color = getLevelColor(level);

  const displayMs = showRemaining ? remaining : elapsed;
  const totalSec = Math.floor(displayMs / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-56 h-56">
        <svg className="w-56 h-56 -rotate-90" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="72" fill="none" stroke="hsl(var(--secondary))" strokeWidth="6" />
          <motion.circle
            cx="80" cy="80" r="72" fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            animate={{ strokeDashoffset: dashOffset, stroke: color }}
            transition={{ duration: 1 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-1"
            style={{ backgroundColor: `${color}20`, color }}
          >
            Lv.{level}
          </span>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {showRemaining ? 'Remaining' : 'Elapsed'}
          </p>
          <p className="text-3xl font-bold font-mono tracking-tight">{timeStr}</p>
          <button
            onClick={() => setShowRemaining(!showRemaining)}
            className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeftRight className="h-3 w-3" />
            {showRemaining ? 'Show elapsed' : 'Show remaining'}
          </button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{mode}</p>
    </div>
  );
}
