import { useState, useEffect, useRef } from 'react';
import { CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BackdatePromptProps {
  moduleKey: string;
  onLogPastData: () => void;
}

const DISMISSED_KEY = 'backdate_prompt_dismissed';

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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isDismissed(moduleKey)) {
      const showTimer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(showTimer);
    }
  }, [moduleKey]);

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (visible) {
      timerRef.current = setTimeout(() => {
        dismiss(moduleKey);
        setVisible(false);
      }, 8000);
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }
  }, [visible, moduleKey]);

  const handleDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    dismiss(moduleKey);
    setVisible(false);
  };

  const handleLogPast = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    dismiss(moduleKey);
    setVisible(false);
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
          className="mb-4 rounded-lg border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 shadow-sm"
        >
          <div className="flex items-start gap-2.5">
            <CalendarDays className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Have past data to log? You can go back up to 90 days.
              </p>
              <div className="flex gap-3 mt-1.5">
                <button
                  onClick={handleLogPast}
                  className="text-xs font-medium text-amber-700 dark:text-amber-300 hover:underline"
                >
                  Log past data
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-xs text-amber-600/60 dark:text-amber-400/60 hover:underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BackdatePrompt;
