import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown, Minus, ChevronRight, Loader2 } from 'lucide-react';
import { fadeUp } from '@/components/dashboard/constants';
import { useTodayCoaching, useGenerateCoaching } from '@/hooks/useAIInsights';
import { hapticLight } from '@/utils/native/haptics';

const TREND_ICON = {
  improving: { Icon: TrendingUp, cls: 'text-emerald-500' },
  steady: { Icon: Minus, cls: 'text-muted-foreground' },
  slipping: { Icon: TrendingDown, cls: 'text-amber-500' },
};

/**
 * Dashboard card surfacing today's AI coaching insight.
 * If none exists yet it shows a one-tap "Generate" CTA.
 */
export default function AIInsightCard() {
  const navigate = useNavigate();
  const { insight, isLoading } = useTodayCoaching('daily');
  const generate = useGenerateCoaching();

  const open = () => { hapticLight(); navigate('/ai-coach'); };

  // Loading skeleton
  if (isLoading) {
    return (
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
        <div className="rounded-xl border border-border bg-card p-3 animate-pulse h-[88px]" />
      </motion.div>
    );
  }

  // Empty state — prompt to generate
  if (!insight) {
    return (
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
        <button
          onClick={() => { hapticLight(); generate.mutate('daily'); }}
          disabled={generate.isPending}
          className="w-full rounded-xl border border-primary/30 bg-primary/5 p-3 text-left flex items-center gap-3 hover:bg-primary/10 transition-colors disabled:opacity-60"
        >
          <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
            {generate.isPending
              ? <Loader2 className="h-4 w-4 text-primary animate-spin" />
              : <Sparkles className="h-4 w-4 text-primary" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold">
              {generate.isPending ? 'Reading your week…' : 'Get your AI coaching insight'}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Claude reviews your ibadah + health and finds what to focus on
            </p>
          </div>
        </button>
      </motion.div>
    );
  }

  const trend = TREND_ICON[insight.data.trend ?? 'steady'];
  const actions = insight.data.actions ?? [];

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
      <button
        onClick={open}
        className="w-full rounded-xl border border-border bg-card p-3 text-left hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            AI Coach
          </span>
          <trend.Icon className={`h-3.5 w-3.5 ml-auto ${trend.cls}`} />
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold leading-snug">{insight.title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed mt-1 line-clamp-2">
          {insight.body}
        </p>
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {actions.slice(0, 2).map((a, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
              >
                {a.label}
              </span>
            ))}
          </div>
        )}
      </button>
    </motion.div>
  );
}
