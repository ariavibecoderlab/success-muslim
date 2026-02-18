import { Link } from "react-router-dom";
import {
  Clock,
  CalendarCheck,
  Calculator,
  ChevronRight,
  Flame,
  Target,
  Moon,
  BookOpen,
  Droplets,
  Sun,
  Sunrise,
  Sunset,
  CloudSun,
  TrendingUp,
  CheckCircle2,
  Star,
  Heart,
  Sparkles,
  Megaphone,
  CircleDot,
  CircleAlert,
  CircleX,
  BedDouble,
  Dumbbell,
  ListChecks,
  HandHeart,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { getQadaSetup, getQadaProgress, getRamadhanSetup, getRamadhanProgress, getFidyahHistory } from "@/lib/storage";
import { estimateCompletionDate, getTodayKey } from "@/lib/calculations";
import {
  fetchPrayerTimes,
  formatPrayerTime,
  getNextPrayerIndex,
  getCurrentPrayerIndex,
  type PrayerTimesData,
} from "@/lib/prayer-times";
import { formatHijriDate } from "@/lib/hijri";
import { getSunnahStreak, getDayLog, getSunnahItems } from "@/lib/sunnah-storage";
import { getDailyDhikr } from "@/lib/dhikr-storage";
import {
  getTodaySalah,
  logSalah,
  getTodaySalahCount,
  type SalahStatus,
  type SalahName,
  SALAH_NAMES,
} from "@/lib/salah-storage";
import { motion } from "framer-motion";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import EditableText from "@/components/cms/EditableText";
import OnboardingTooltips from "@/components/OnboardingTooltips";
import { calculateLifeScore, saveCurrentDayScore, getScoreColor, getScoreLabel, getWeeklyScores } from "@/lib/life-score";
import { getHydration } from "@/lib/health-storage";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from "recharts";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }),
};

const PRAYER_ICONS = [Sunrise, Sun, CloudSun, Sunset, Moon];

const STATUS_OPTIONS: { value: SalahStatus; label: string; icon: typeof CheckCircle2; colorClass: string }[] = [
  { value: "ontime", label: "On Time", icon: CheckCircle2, colorClass: "text-primary" },
  { value: "late", label: "Late", icon: CircleDot, colorClass: "text-accent-foreground" },
  { value: "missed", label: "Missed", icon: CircleX, colorClass: "text-destructive" },
  { value: null, label: "Clear", icon: CircleAlert, colorClass: "text-muted-foreground" },
];

// Map API prayer keys to our SalahName type
const API_TO_SALAH: Record<string, SalahName> = {
  Fajr: "Fajr",
  Dhuhr: "Dhuhr",
  Asr: "Asr",
  Maghrib: "Maghrib",
  Isha: "Isha",
};

const DUMMY_HABITS = [
  { label: "Morning Adhkar", streak: 12, done: true },
  { label: "Quran Tilawah", streak: 7, done: true },
  { label: "Evening Adhkar", streak: 5, done: false },
  { label: "Tahajjud", streak: 3, done: false },
];

const QUOTES = [
  { text: '"The best of you are those who learn the Quran and teach it."', source: "— Sahih al-Bukhari" },
  { text: '"Verily, with hardship comes ease."', source: "— Quran 94:6" },
  { text: '"The strongest among you is the one who controls his anger."', source: "— Sahih al-Bukhari" },
];

const Dashboard = () => {
  const [, forceUpdate] = useState(0);
  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null);
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const [displayName, setDisplayName] = useState("");
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; content: string }[]>([]);
  const [salahLog, setSalahLog] = useState(getTodaySalah());

  const handleSalahStatus = useCallback((prayer: SalahName, status: SalahStatus) => {
    const updated = logSalah(prayer, status);
    setSalahLog(updated);
  }, []);

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

  useEffect(() => {
    fetchPrayerTimes().then((data) => {
      if (data) setPrayerData(data);
    });
  }, []);

  const qadaSetup = getQadaSetup();
  const qadaProgress = getQadaProgress();
  const ramadhanSetup = getRamadhanSetup();
  const ramadhanProgress = getRamadhanProgress();
  const fidyahHistory = getFidyahHistory();

  const todayQada = useMemo(() => {
    const today = getTodayKey();
    const log = qadaProgress.dailyLogs[today];
    if (!log) return 0;
    return Object.values(log).reduce((s, v) => s + v, 0);
  }, [qadaProgress]);

  const hasQada = !!qadaSetup;
  const hasRamadhan = !!ramadhanSetup;
  const hasFidyah = fidyahHistory.length > 0;

  const sunnahItems = getSunnahItems().filter((i) => i.enabled);
  const sunnahLog = getDayLog();
  const sunnahDone = sunnahLog.completed.filter((id) => sunnahItems.find((i) => i.id === id)).length;
  const sunnahStreak = getSunnahStreak();
  const dailyDhikr = getDailyDhikr();

  const habits =
    sunnahItems.length > 0
      ? sunnahItems.slice(0, 4).map((i) => ({
          label: i.label,
          streak: sunnahStreak,
          done: sunnahLog.completed.includes(i.id),
        }))
      : DUMMY_HABITS;
  const habitsDone = habits.filter((h) => h.done).length;

  const prayers = prayerData
    ? prayerData.timings.map((t, i) => ({
        name: t.name,
        key: t.key as SalahName,
        time: formatPrayerTime(t.time),
        icon: PRAYER_ICONS[i],
        passed: i <= getCurrentPrayerIndex(prayerData.timings),
        current: i === getNextPrayerIndex(prayerData.timings),
        status: salahLog.prayers[API_TO_SALAH[t.key]]?.status ?? null,
      }))
    : SALAH_NAMES.map((key, i) => ({
        name: ["Subuh", "Zohor", "Asar", "Maghrib", "Isyak"][i],
        key,
        time: "—",
        icon: PRAYER_ICONS[i],
        passed: false,
        current: false,
        status: salahLog.prayers[key]?.status ?? null,
      }));

  const salahCount = getTodaySalahCount();
  const hijriDate = formatHijriDate(new Date());
  const gregorianDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  // Life Score
  const lifeScore = useMemo(() => calculateLifeScore(), [salahLog, forceUpdate]);
  useEffect(() => { saveCurrentDayScore(lifeScore); }, [lifeScore]);
  const weeklyScores = useMemo(() => getWeeklyScores(), []);
  const hydration = getHydration();

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

        {/* Greeting */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <h1 className="text-2xl font-bold mb-0.5">Assalamualaikum{displayName ? `, ${displayName}` : ""} 👋</h1>
          <EditableText
            elementKey="greeting.subtitle"
            defaultText="Your spiritual dashboard"
            tag="p"
            className="text-muted-foreground text-sm"
          />
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
              {/* Pillar bars */}
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
              {/* Weekly trend */}
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

        {/* Today Overview */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.9} className="grid grid-cols-4 gap-2">
          <Card><CardContent className="p-3 text-center">
            <Droplets className="h-3.5 w-3.5 mx-auto text-blue-500 mb-1" />
            <p className="text-sm font-bold">{hydration.cups}/{hydration.goal}</p>
            <p className="text-[9px] text-muted-foreground">Water</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <ListChecks className="h-3.5 w-3.5 mx-auto text-accent-foreground mb-1" />
            <p className="text-sm font-bold">{salahCount.logged}/5</p>
            <p className="text-[9px] text-muted-foreground">Prayers</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <HandHeart className="h-3.5 w-3.5 mx-auto text-primary mb-1" />
            <p className="text-sm font-bold">{dailyDhikr.totalCount}</p>
            <p className="text-[9px] text-muted-foreground">Dhikr</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <Flame className="h-3.5 w-3.5 mx-auto text-accent-foreground mb-1" />
            <p className="text-sm font-bold">{sunnahStreak}</p>
            <p className="text-[9px] text-muted-foreground">Streak</p>
          </CardContent></Card>
        </motion.div>

        {/* Daily Prayer Widget */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Star className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <EditableText
                      elementKey="prayer.title"
                      defaultText="Today's Prayers"
                      tag="h2"
                      className="text-sm font-semibold"
                    />
                    <p className="text-xs text-muted-foreground">
                      {salahCount.logged}/5 logged
                      {salahCount.onTime > 0 && <span className="text-primary"> · {salahCount.onTime} on time</span>}
                      {salahCount.late > 0 && <span className="text-accent-foreground"> · {salahCount.late} late</span>}
                      {salahCount.missed > 0 && <span className="text-destructive"> · {salahCount.missed} missed</span>}
                    </p>
                  </div>
                </div>
                {prayerData && <span className="text-[10px] text-muted-foreground">{prayerData.city}</span>}
              </div>
              <div className="flex items-center gap-1">
                {prayers.map((p) => {
                  const statusColor =
                    p.status === "ontime"
                      ? "text-primary"
                      : p.status === "late"
                        ? "text-accent-foreground"
                        : p.status === "missed"
                          ? "text-destructive"
                          : "text-muted-foreground";
                  const StatusIcon =
                    p.status === "ontime"
                      ? CheckCircle2
                      : p.status === "late"
                        ? CircleDot
                        : p.status === "missed"
                          ? CircleX
                          : null;

                  return (
                    <Popover key={p.name}>
                      <PopoverTrigger asChild>
                        <button
                          className={`flex-1 flex flex-col items-center gap-1.5 py-2 rounded-xl transition-colors cursor-pointer hover:bg-secondary/80 ${
                            p.status === "ontime"
                              ? "bg-primary/10 ring-1 ring-primary/20"
                              : p.status === "late"
                                ? "bg-accent/10 ring-1 ring-accent/20"
                                : p.status === "missed"
                                  ? "bg-destructive/5 ring-1 ring-destructive/20"
                                  : p.current
                                    ? "bg-primary/5 ring-1 ring-primary/10"
                                    : ""
                          }`}
                        >
                          <p.icon
                            className={`h-4 w-4 ${p.status ? statusColor : p.current ? "text-primary" : "text-muted-foreground"}`}
                          />
                          <span
                            className={`text-[10px] font-medium ${p.status ? statusColor : "text-muted-foreground"}`}
                          >
                            {p.name}
                          </span>
                          <span className="text-[9px] text-muted-foreground">{p.time}</span>
                          {StatusIcon && <StatusIcon className={`h-3 w-3 ${statusColor}`} />}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-36 p-1.5" align="center" side="bottom">
                        <p className="text-[10px] font-medium text-muted-foreground px-2 py-1">{p.name}</p>
                        {STATUS_OPTIONS.map((opt) => (
                          <button
                            key={String(opt.value)}
                            onClick={() => handleSalahStatus(p.key, opt.value)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-secondary transition-colors ${
                              p.status === opt.value ? "bg-secondary font-medium" : ""
                            }`}
                          >
                            <opt.icon className={`h-3.5 w-3.5 ${opt.colorClass}`} />
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </PopoverContent>
                    </Popover>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats Row */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 flex flex-col items-center text-center gap-1">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Flame className="h-4 w-4 text-primary" />
              </div>
              <span className="text-lg font-bold">{sunnahStreak || 0}</span>
              <EditableText
                elementKey="stat.sunnah"
                defaultText="Sunnah Streak"
                tag="span"
                className="text-[10px] text-muted-foreground leading-tight"
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center text-center gap-1">
              <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-accent-foreground" />
              </div>
              <span className="text-lg font-bold">{dailyDhikr.totalCount}</span>
              <EditableText
                elementKey="stat.dhikr"
                defaultText="Dhikr Today"
                tag="span"
                className="text-[10px] text-muted-foreground leading-tight"
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center text-center gap-1">
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                <Droplets className="h-4 w-4 text-secondary-foreground" />
              </div>
              <span className="text-lg font-bold">
                {sunnahDone}/{sunnahItems.length || "—"}
              </span>
              <EditableText
                elementKey="stat.sunnahdone"
                defaultText="Sunnah Done"
                tag="span"
                className="text-[10px] text-muted-foreground leading-tight"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Habits */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <EditableText
                    elementKey="habits.title"
                    defaultText="Daily Habits"
                    tag="h2"
                    className="text-sm font-semibold"
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {habitsDone}/{habits.length} done
                </span>
              </div>
              <div className="space-y-2.5">
                {habits.map((h) => (
                  <div key={h.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          h.done ? "bg-primary border-primary" : "border-border"
                        }`}
                      >
                        {h.done && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <span className={`text-sm ${h.done ? "line-through text-muted-foreground" : ""}`}>{h.label}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Flame className="h-3 w-3" />
                      <span>{h.streak}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Qada / Ramadhan / Fidyah Progress */}
        {hasQada && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}>
            <Link to="/qada-solat/track">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <EditableText
                          elementKey="qada.title"
                          defaultText="Qada Solat"
                          tag="h3"
                          className="font-semibold text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          {qadaSetup!.totalPrayers - qadaProgress.totalCompleted} prayers remaining
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Progress
                    value={(qadaProgress.totalCompleted / qadaSetup!.totalPrayers) * 100}
                    className="h-2 mb-3"
                  />
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" /> Today: {todayQada}/{qadaSetup!.dailyTarget}
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="h-3 w-3" /> Streak: {qadaProgress.currentStreak}d
                    </span>
                    <span>Est. {estimateCompletionDate(qadaSetup!, qadaProgress.totalCompleted)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        )}

        {hasRamadhan && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}>
            <Link to="/ramadhan-qada/track">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                        <CalendarCheck className="h-5 w-5 text-accent-foreground" />
                      </div>
                      <div>
                        <EditableText
                          elementKey="ramadhan.title"
                          defaultText="Ramadhan Qada"
                          tag="h3"
                          className="font-semibold text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          {ramadhanSetup!.totalDays - ramadhanProgress.completedDates.length} days remaining
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Progress
                    value={(ramadhanProgress.completedDates.length / ramadhanSetup!.totalDays) * 100}
                    className="h-2"
                  />
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        )}

        {hasFidyah && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6}>
            <Link to="/fidyah">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Calculator className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <EditableText
                          elementKey="fidyah.title"
                          defaultText="Fidyah"
                          tag="h3"
                          className="font-semibold text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          Last: {fidyahHistory[0].currency} {fidyahHistory[0].total.toFixed(2)} ({fidyahHistory[0].days}{" "}
                          days)
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        )}

        {/* Inspirational Quote */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={7}>
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

        {/* Quick Actions */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={8}>
          <EditableText
            elementKey="quickactions.title"
            defaultText="Quick Actions"
            tag="h2"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3"
          />
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Clock, title: "Qada Solat", to: hasQada ? "/qada-solat/track" : "/qada-solat/setup" },
              {
                icon: CalendarCheck,
                title: "Ramadhan",
                to: hasRamadhan ? "/ramadhan-qada/track" : "/ramadhan-qada/setup",
              },
              { icon: Calculator, title: "Fidyah", to: "/fidyah" },
            ].map((item) => (
              <Link key={item.title} to={item.to}>
                <Card className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    <span className="text-xs font-medium">{item.title}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Weekly Progress */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={9}>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-secondary-foreground" />
                  </div>
                  <EditableText
                    elementKey="weekly.title"
                    defaultText="This Week"
                    tag="h2"
                    className="text-sm font-semibold"
                  />
                </div>
              </div>
              <div className="flex items-end gap-1.5 h-20">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                  const heights = [65, 80, 45, 90, 100, 70, 0];
                  const isToday = new Date().getDay() === (i + 1) % 7;
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-md transition-colors ${
                          isToday ? "bg-primary" : heights[i] >= 80 ? "bg-primary/80" : "bg-primary/30"
                        }`}
                        style={{ height: `${Math.max(heights[i], 8)}%` }}
                      />
                      <span className={`text-[9px] ${isToday ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                        {day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="h-4" />
      </main>
    </div>
  );
};

export default Dashboard;
