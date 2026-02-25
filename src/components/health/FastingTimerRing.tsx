import { useState } from 'react';
import { ArrowLeftRight, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  elapsed: number;
  remaining: number;
  progress: number;
  level: number;
  mode: string;
  planLabel?: string;
  onPlanTap?: () => void;
  isActive?: boolean;
}

function getLevelColor(level: number): string {
  if (level <= 3) return 'hsl(142, 70%, 45%)';
  if (level <= 6) return 'hsl(172, 66%, 45%)';
  if (level <= 8) return 'hsl(210, 70%, 50%)';
  return 'hsl(260, 60%, 55%)';
}

function getLevelGlow(level: number): string {
  if (level <= 3) return 'rgba(34, 197, 94, 0.25)';
  if (level <= 6) return 'rgba(20, 184, 166, 0.25)';
  if (level <= 8) return 'rgba(59, 130, 246, 0.25)';
  return 'rgba(139, 92, 246, 0.25)';
}

export default function FastingTimerRing({ elapsed, remaining, progress, level, mode, planLabel, onPlanTap, isActive = true }: Props) {
  const [showRemaining, setShowRemaining] = useState(false);

  const circumference = 2 * Math.PI * 72;
  const dashOffset = circumference - (progress / 100) * circumference;
  const color = getLevelColor(level);
  const glow = getLevelGlow(level);

  const displayMs = showRemaining ? remaining : elapsed;
  const totalSec = Math.floor(displayMs / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-60 h-60">
        {/* Glow effect */}
        <motion.div
          className="absolute inset-2 rounded-full"
          animate={{
            boxShadow: [
              `0 0 20px 4px ${glow}`,
              `0 0 35px 8px ${glow}`,
              `0 0 20px 4px ${glow}`,
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        <svg className="w-60 h-60 -rotate-90" viewBox="0 0 160 160">
          {/* Background track */}
          <circle cx="80" cy="80" r="72" fill="none" stroke="hsl(var(--secondary))" strokeWidth="5" opacity="0.5" />
          {/* Progress arc */}
          <motion.circle
            cx="80" cy="80" r="72" fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            animate={{ strokeDashoffset: dashOffset, stroke: color }}
            transition={{ duration: 1 }}
            filter="url(#ringGlow)"
          />
          <defs>
            <filter id="ringGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-[10px] font-bold px-3 py-1 rounded-full mb-1.5"
            style={{ backgroundColor: `${color}18`, color }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Lv.{level}
          </motion.span>
          {/* Plan label with edit icon */}
          {planLabel && (
            <button
              onClick={!isActive && onPlanTap ? onPlanTap : undefined}
              className={`flex items-center gap-1 text-[10px] font-semibold mb-0.5 px-2 py-0.5 rounded-full ${
                !isActive && onPlanTap ? 'hover:bg-secondary cursor-pointer' : 'cursor-default'
              }`}
            >
              <span>{planLabel}</span>
              {!isActive && onPlanTap && <Pencil className="h-2.5 w-2.5 text-muted-foreground" />}
            </button>
          )}
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
            {showRemaining ? 'Remaining' : 'Elapsed'}
          </p>
          <p className="text-[32px] font-bold font-mono tracking-tight leading-tight">{timeStr}</p>
          <button
            onClick={() => setShowRemaining(!showRemaining)}
            className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5 rounded-full hover:bg-secondary"
          >
            <ArrowLeftRight className="h-3 w-3" />
            {showRemaining ? 'Show elapsed' : 'Show remaining'}
          </button>
        </div>
      </div>
    </div>
  );
}
