import { useState, useEffect, useRef } from 'react';
import { CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BackdatePromptProps {
  moduleKey: string;
  onLogPastData: () => void;
}

const DISMISSED_KEY = 'backdate_prompt_dismissed';
const AUTO_DISMISS_MS = 8000;

function isDismissed(moduleKey: string): boolean {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    const map: Record<string, boolean> = raw ? JSON.parse(raw) : {};
    return !!map[moduleKey];
  } catch { return false; }
}

function dismiss(moduleKey: string) {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    const map: Record<string, boolean> = raw ? JSON.parse(raw) : {};
    map[moduleKey] = true;
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(map));
  } catch {}
}

const BackdatePrompt = ({ moduleKey, onLogPastData }: BackdatePromptProps) => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (!isDismissed(moduleKey)) {
      const showTimer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(showTimer);
    }
  }, [moduleKey]);

  // Auto-dismiss with progress bar
  useEffect(() => {
    if (visible) {
      startRef.current = Date.now();
      const tick = () => {
        const elapsed = Date.now() - startRef.current;
        setProgress(Math.min(elapsed / AUTO_DISMISS_MS, 1));
        if (elapsed < AUTO_DISMISS_MS) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };
      rafRef.current = requestAnimationFrame(tick);

      timerRef.current = setTimeout(() => {
        dismiss(moduleKey);
        setVisible(false);
      }, AUTO_DISMISS_MS);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }
  }, [visible, moduleKey]);

  const cleanup = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    dismiss(moduleKey);
    setVisible(false);
  };

  const handleLogPast = () => {
    cleanup();
    onLogPastData();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="mb-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 shadow-sm overflow-hidden"
        >
          <div className="px-4 py-3">
            <div className="flex items-start gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-400/80 to-orange-500/80 flex items-center justify-center shrink-0 mt-0.5">
                <CalendarDays className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Have past data to log?
                </p>
                <p className="text-xs text-amber-600/80 dark:text-amber-300/60 mt-0.5">
                  You can go back up to 90 days.
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleLogPast}
                    className="text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-full transition-colors"
                  >
                    Log past data
                  </button>
                  <button
                    onClick={cleanup}
                    className="text-xs text-amber-600/70 dark:text-amber-400/60 hover:text-amber-700 dark:hover:text-amber-300 px-2 py-1 rounded-full transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-0.5 bg-amber-200/40 dark:bg-amber-800/30">
            <motion.div
              className="h-full bg-amber-400/60 dark:bg-amber-500/40"
              style={{ width: `${(1 - progress) * 100}%` }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BackdatePrompt;
