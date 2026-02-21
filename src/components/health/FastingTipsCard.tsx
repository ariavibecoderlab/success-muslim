import { Lightbulb, Moon } from 'lucide-react';
import { FASTING_TIPS } from '@/lib/if-educational-content';

export default function FastingTipsCard() {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2.5">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold">During Your Fast</span>
      </div>
      <ul className="space-y-1.5">
        {FASTING_TIPS.map((tip, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
            {tip.islamic ? (
              <Moon className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
            ) : (
              <span className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
            )}
            {tip.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
