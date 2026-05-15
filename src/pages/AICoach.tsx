import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, MessageCircle, TrendingUp, TrendingDown, Minus,
  Target, Activity, Loader2, X,
} from 'lucide-react';
import SubPageLayout from '@/components/SubPageLayout';
import DeenCompanionChat from '@/components/ai/DeenCompanionChat';
import { hapticLight } from '@/utils/native/haptics';
import {
  useAIInsights, useGenerateCoaching, useGenerateRecommendations,
  useGenerateAnalysis, useDismissInsight, type AIInsight,
} from '@/hooks/useAIInsights';

type Tab = 'insights' | 'companion';

const TREND = {
  improving: { Icon: TrendingUp, cls: 'text-emerald-500', label: 'Improving' },
  steady: { Icon: Minus, cls: 'text-muted-foreground', label: 'Steady' },
  slipping: { Icon: TrendingDown, cls: 'text-amber-500', label: 'Needs focus' },
};

export default function AICoach() {
  const [tab, setTab] = useState<Tab>('insights');

  return (
    <SubPageLayout title="AI Coach" backTo="/">
      <div className="flex gap-1 p-1 bg-muted rounded-lg mb-4">
        <TabButton active={tab === 'insights'} onClick={() => setTab('insights')}
          icon={<Sparkles className="h-3.5 w-3.5" />} label="Insights" />
        <TabButton active={tab === 'companion'} onClick={() => setTab('companion')}
          icon={<MessageCircle className="h-3.5 w-3.5" />} label="Companion" />
      </div>

      {tab === 'insights' ? <InsightsTab /> : <DeenCompanionChat />}
    </SubPageLayout>
  );
}

function TabButton({ active, onClick, icon, label }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string;
}) {
  return (
    <button
      onClick={() => { hapticLight(); onClick(); }}
      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
        active ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
      }`}
    >
      {icon}{label}
    </button>
  );
}

function InsightsTab() {
  const { data: insights, isLoading } = useAIInsights();
  const genCoaching = useGenerateCoaching();
  const genRecs = useGenerateRecommendations();
  const genAnalysis = useGenerateAnalysis();

  const coaching = insights?.filter((i) => i.kind === 'coaching') ?? [];
  const recs = insights?.find((i) => i.kind === 'recommendation') ?? null;
  const analysis = insights?.find((i) => i.kind === 'analysis') ?? null;

  return (
    <div className="space-y-5">
      {/* Generate row */}
      <div className="grid grid-cols-3 gap-2">
        <GenButton label="Coaching" icon={<Sparkles className="h-4 w-4" />}
          pending={genCoaching.isPending} onClick={() => genCoaching.mutate('weekly')} />
        <GenButton label="Goals" icon={<Target className="h-4 w-4" />}
          pending={genRecs.isPending} onClick={() => genRecs.mutate()} />
        <GenButton label="Analysis" icon={<Activity className="h-4 w-4" />}
          pending={genAnalysis.isPending} onClick={() => genAnalysis.mutate()} />
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
        </div>
      )}

      {!isLoading && coaching.length === 0 && !recs && !analysis && (
        <div className="text-center py-10 px-6">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm font-semibold">Strava-grade insights for your whole life</p>
          <p className="text-xs text-muted-foreground mt-1">
            Claude reads your prayer, Quran, fasting, sleep and step data to spot
            trends and tell you exactly what to focus on. Tap a button above to start.
          </p>
        </div>
      )}

      {coaching.map((i) => <CoachingCard key={i.id} insight={i} />)}
      {recs && <RecommendationsCard insight={recs} />}
      {analysis && <AnalysisCard insight={analysis} />}
    </div>
  );
}

function GenButton({ label, icon, pending, onClick }: {
  label: string; icon: React.ReactNode; pending: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={() => { hapticLight(); onClick(); }}
      disabled={pending}
      className="flex flex-col items-center gap-1 py-2.5 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors disabled:opacity-60"
    >
      <span className="text-primary">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}</span>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

function CardShell({ children, onDismiss }: { children: React.ReactNode; onDismiss?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="relative rounded-xl border border-border bg-card p-3.5"
    >
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss"
          className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      {children}
    </motion.div>
  );
}

function CoachingCard({ insight }: { insight: AIInsight }) {
  const dismiss = useDismissInsight();
  const trend = TREND[insight.data.trend ?? 'steady'];
  return (
    <CardShell onDismiss={() => dismiss.mutate(insight.id)}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {insight.period} coaching
        </span>
        <span className={`ml-auto mr-5 flex items-center gap-1 text-[10px] font-medium ${trend.cls}`}>
          <trend.Icon className="h-3.5 w-3.5" />{trend.label}
        </span>
      </div>
      <p className="text-sm font-semibold leading-snug">{insight.title}</p>
      <p className="text-xs text-muted-foreground leading-relaxed mt-1">{insight.body}</p>

      {(insight.data.highlights?.length ?? 0) > 0 && (
        <div className="mt-2.5 space-y-1">
          {insight.data.highlights!.map((h, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs">
              <span className="text-emerald-500 mt-0.5">✓</span>
              <span className="text-foreground">{h}</span>
            </div>
          ))}
        </div>
      )}

      {(insight.data.actions?.length ?? 0) > 0 && (
        <div className="mt-2.5 pt-2.5 border-t border-border space-y-1.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Next actions
          </p>
          {insight.data.actions!.map((a, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary capitalize flex-shrink-0">
                {a.pillar}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium">{a.label}</p>
                {a.why && <p className="text-[10px] text-muted-foreground">{a.why}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </CardShell>
  );
}

function RecommendationsCard({ insight }: { insight: AIInsight }) {
  const dismiss = useDismissInsight();
  const goals = insight.data.goals ?? [];
  const habits = insight.data.habits ?? [];
  return (
    <CardShell onDismiss={() => dismiss.mutate(insight.id)}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Target className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Recommended goals & habits
        </span>
      </div>
      {insight.data.summary && (
        <p className="text-xs text-muted-foreground leading-relaxed mb-2.5">{insight.data.summary}</p>
      )}
      {goals.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {goals.map((g, i) => (
            <div key={i} className="rounded-lg bg-muted/50 p-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary capitalize">{g.pillar}</span>
                <p className="text-xs font-medium flex-1">{g.title}</p>
                <span className="text-[10px] text-muted-foreground capitalize">{g.difficulty}</span>
              </div>
              <p className="text-[11px] text-foreground mt-1">🎯 {g.target}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{g.rationale}</p>
            </div>
          ))}
        </div>
      )}
      {habits.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Habits</p>
          {habits.map((h, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="text-primary">+</span>
              <span className="font-medium">{h.title}</span>
              <span className="text-[10px] text-muted-foreground ml-auto">{h.cadence} · {h.anchor}</span>
            </div>
          ))}
        </div>
      )}
    </CardShell>
  );
}

function AnalysisCard({ insight }: { insight: AIInsight }) {
  const dismiss = useDismissInsight();
  const patterns = insight.data.patterns ?? [];
  const correlations = insight.data.correlations ?? [];
  const anomalies = insight.data.anomalies ?? [];
  return (
    <CardShell onDismiss={() => dismiss.mutate(insight.id)}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Activity className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Activity analysis
        </span>
      </div>
      <p className="text-sm font-semibold leading-snug">{insight.title}</p>
      <p className="text-xs text-muted-foreground leading-relaxed mt-1">{insight.body}</p>

      {patterns.length > 0 && (
        <div className="mt-2.5 space-y-1.5">
          {patterns.map((p, i) => (
            <div key={i} className="rounded-lg bg-muted/50 p-2">
              <div className="flex items-start gap-1.5">
                <p className="text-xs font-medium flex-1">{p.finding}</p>
                <span className="text-[9px] px-1 py-0.5 rounded bg-secondary text-secondary-foreground capitalize">
                  {p.confidence}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{p.evidence}</p>
            </div>
          ))}
        </div>
      )}
      {correlations.length > 0 && (
        <div className="mt-2 space-y-1">
          {correlations.map((c, i) => (
            <p key={i} className="text-[11px] text-foreground">
              <span className={c.direction === 'positive' ? 'text-emerald-500' : 'text-amber-500'}>
                {c.direction === 'positive' ? '↑' : '↓'}
              </span>{' '}
              <span className="font-medium">{c.between}</span> — {c.note}
            </p>
          ))}
        </div>
      )}
      {anomalies.length > 0 && (
        <div className="mt-2 pt-2 border-t border-border">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
            Worth a look
          </p>
          {anomalies.map((a, i) => (
            <p key={i} className="text-[11px] text-muted-foreground">• {a}</p>
          ))}
        </div>
      )}
    </CardShell>
  );
}
