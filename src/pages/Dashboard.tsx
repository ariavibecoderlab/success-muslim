import { Link } from "react-router-dom";
import {
  TrendingUp,
  Star,
  BookOpen,
  Droplets,
  Moon,
  BedDouble,
  Dumbbell,
  ListChecks,
  HandHeart,
  Megaphone,
  Heart,
  Settings2,
  Sparkles,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import EditableText from "@/components/cms/EditableText";
import OnboardingTooltips from "@/components/OnboardingTooltips";
import { calculateLifeScore, saveCurrentDayScore, getScoreColor, getScoreLabel, getWeeklyScores } from "@/lib/life-score";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { getTodaySalah } from "@/lib/salah-storage";
import { useWidgetPreferences } from "@/hooks/useWidgetPreferences";
import { WIDGET_REGISTRY, type WidgetSize } from "@/lib/widget-registry";
import { useHijriDate } from "@/hooks/useHijriDate";
import { getActiveIF } from "@/lib/health-storage";
import WidgetShell from "@/components/widgets/WidgetShell";
import WidgetCustomizer from "@/components/widgets/WidgetCustomizer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }),
};

const QUOTES = [
  { text: '"The best of you are those who learn the Quran and teach it."', source: "— Sahih al-Bukhari" },
  { text: '"Verily, with hardship comes ease."', source: "— Quran 94:6" },
  { text: '"The strongest among you is the one who controls his anger."', source: "— Sahih al-Bukhari" },
];

const QUICK_LOGS = [
  { icon: Star, label: 'Prayer', to: '/iman/prayer-times', color: 'bg-primary/10 text-primary' },
  { icon: BookOpen, label: 'Quran', to: '/iman/quran', color: 'bg-primary/10 text-primary' },
  { icon: HandHeart, label: 'Dhikr', to: '/iman/dhikr', color: 'bg-accent/20 text-accent-foreground' },
  { icon: Moon, label: 'Fast', to: '/health/fasting', color: 'bg-secondary text-secondary-foreground' },
  { icon: Droplets, label: 'Water', to: '/health/hydration', color: 'bg-blue-500/10 text-blue-600' },
  { icon: BedDouble, label: 'Sleep', to: '/health/sleep', color: 'bg-secondary text-secondary-foreground' },
  { icon: ListChecks, label: 'Tasks', to: '/productivity/tasks', color: 'bg-accent/20 text-accent-foreground' },
  { icon: Dumbbell, label: 'Habits', to: '/productivity/habits', color: 'bg-primary/10 text-primary' },
];

const Dashboard = () => {
  const [, forceUpdate] = useState(0);
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; content: string }[]>([]);
  const [salahLog] = useState(getTodaySalah());
  const [customizerOpen, setCustomizerOpen] = useState(false);

  const { isRamadan } = useHijriDate();
  const activeIF = getActiveIF();

  const {
    preferences,
    loading: widgetLoading,
    isFirstTime,
    toggleWidget,
    resizeWidget,
    reorderWidgets,
    initializeDefaults,
    setIsFirstTime,
  } = useWidgetPreferences();

  useEffect(() => {
    const onFocus = () => forceUpdate((n) => n + 1);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.display_name) setDisplayName(data.display_name);
        });
      supabase
        .from("announcements")
        .select("id, title, content")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(3)
        .then(({ data }) => {
          if (data) setAnnouncements(data);
        });
    }
  }, [user]);

  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  // Life Score
  const lifeScore = useMemo(() => calculateLifeScore(), [salahLog, forceUpdate]);
  useEffect(() => { saveCurrentDayScore(lifeScore); }, [lifeScore]);
  const weeklyScores = useMemo(() => getWeeklyScores(), []);

  // Smart visibility filter for widgets
  const smartVisibilityCheck = (widgetId: string): boolean => {
    switch (widgetId) {
      case 'tarawih':
      case 'ramadan_fasting':
        return isRamadan;
      case 'if_fasting':
        return !!activeIF;
      default:
        return true;
    }
  };

  // Get enabled & visible widgets sorted by position
  const visibleWidgets = preferences
    .filter(p => p.enabled && smartVisibilityCheck(p.widget_id))
    .sort((a, b) => a.position - b.position);

  return (
    <div className="min-h-screen bg-background">
      <OnboardingTooltips />
      <AppHeader showHijriDate showGregorianDate />

      <main className="max-w-4xl mx-auto px-5 py-6 space-y-5">
        {/* Announcements */}
        {announcements.length > 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            {announcements.map((a) => (
              <Card key={a.id} className="bg-accent/10 border-accent/20 mb-2">
                <CardContent className="p-3 flex items-start gap-3">
                  <Megaphone className="h-4 w-4 text-accent-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.content}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {/* Greeting + Customize button */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-0.5">Assalamualaikum{displayName ? `, ${displayName}` : ""} 👋</h1>
              <EditableText
                elementKey="greeting.subtitle"
                defaultText="Your spiritual dashboard"
                tag="p"
                className="text-muted-foreground text-sm"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-8 px-2"
              onClick={() => setCustomizerOpen(true)}
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Life Score Card */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.5}>
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <EditableText elementKey="lifescore.card.title" defaultText="Life Score" tag="h2" className="text-sm font-semibold" />
                    <p className={`text-xs ${getScoreColor(lifeScore.total)}`}>{getScoreLabel(lifeScore.total)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-bold ${getScoreColor(lifeScore.total)}`}>{lifeScore.total}</p>
                  <p className="text-[10px] text-muted-foreground">/ 100</p>
                </div>
              </div>
              <div className="space-y-2">
                {lifeScore.pillars.map(p => (
                  <div key={p.label} className="flex items-center gap-3">
                    <span className="text-[10px] text-muted-foreground w-20">{p.label} ({Math.round(p.weight * 100)}%)</span>
                    <div className="flex-1">
                      <Progress value={p.score} className="h-1.5" />
                    </div>
                    <span className="text-xs font-medium w-8 text-right">{p.score}</span>
                  </div>
                ))}
              </div>
              {weeklyScores.length > 1 && (
                <div className="mt-4">
                  <p className="text-[10px] text-muted-foreground mb-2">7-Day Trend</p>
                  <ResponsiveContainer width="100%" height={60}>
                    <BarChart data={weeklyScores}>
                      <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip />
                      <Bar dataKey="score" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Log Buttons */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.8}>
          <EditableText elementKey="quicklog.title" defaultText="Quick Log" tag="h2" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3" />
          <div className="grid grid-cols-4 gap-2">
            {QUICK_LOGS.map(q => (
              <Link key={q.label} to={q.to}>
                <Card className="hover:shadow-sm transition-shadow active:scale-[0.97]">
                  <CardContent className="p-3 flex flex-col items-center gap-1.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${q.color}`}>
                      <q.icon className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-medium">{q.label}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Dynamic Widget Grid */}
        {!widgetLoading && (
          <div className="grid grid-cols-2 gap-3">
            {visibleWidgets.map((pref, idx) => {
              const def = WIDGET_REGISTRY.find(w => w.id === pref.widget_id);
              if (!def) return null;
              const WidgetComponent = def.component;

              return (
                <WidgetShell
                  key={pref.widget_id}
                  size={pref.size as WidgetSize}
                  index={idx}
                >
                  <WidgetComponent size={pref.size as WidgetSize} />
                </WidgetShell>
              );
            })}
          </div>
        )}

        {/* Inspirational Quote */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="p-5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Heart className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm italic leading-relaxed">{quote.text}</p>
                <p className="text-xs text-muted-foreground mt-1">{quote.source}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="h-4" />
      </main>

      {/* Widget Customizer Drawer */}
      <WidgetCustomizer
        open={customizerOpen}
        onOpenChange={setCustomizerOpen}
        preferences={preferences}
        onToggle={toggleWidget}
        onResize={resizeWidget}
        onReorder={reorderWidgets}
      />

      {/* First-time Dialog */}
      <Dialog open={isFirstTime} onOpenChange={(open) => !open && setIsFirstTime(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Your dashboard is now customizable!
            </DialogTitle>
            <DialogDescription>
              Add widgets from Iman, Health, Wealth and more. Choose what matters most to you.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                initializeDefaults();
              }}
            >
              Maybe Later
            </Button>
            <Button
              onClick={() => {
                initializeDefaults().then(() => {
                  setCustomizerOpen(true);
                });
              }}
            >
              Customize Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
