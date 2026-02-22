import { useState, useEffect } from 'react';
import { CalendarDays, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface BackdatePromptProps {
  moduleKey: string; // unique key per module, e.g. 'prayer', 'quran'
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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isDismissed(moduleKey)) {
      // Show after a short delay so it doesn't flash
      const timer = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, [moduleKey]);

  const handleStartFresh = () => {
    dismiss(moduleKey);
    setOpen(false);
  };

  const handleLogPast = () => {
    dismiss(moduleKey);
    setOpen(false);
    onLogPastData();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleStartFresh(); else setOpen(v); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Log past entries?
          </DialogTitle>
          <DialogDescription>
            Did you do this before joining? You can log past entries going back 90 days.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="outline" onClick={handleStartFresh}>
            Start Fresh Today
          </Button>
          <Button onClick={handleLogPast} className="gap-1.5">
            <CalendarDays className="h-4 w-4" />
            Log Past Data
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BackdatePrompt;
