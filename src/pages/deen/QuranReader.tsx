import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Search, BookMarked, ChevronRight, Settings2,
  CheckCircle2, Flame, Calendar, Trophy, Star, Sparkles,
  Crown, Layers, FileText, Leaf, Hash, Zap, Award, Medal, RotateCcw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import SubPageLayout from '@/components/SubPageLayout';
import { useQuranDailyTarget, useQuranBookmarks } from '@/hooks/useQuranData';
import { SURAH_NAMES, TRANSLATION_IDS } from '@/lib/quran-api';
import { toast } from 'sonner';

const IMAN_SIBLINGS = [
  { path: '/iman/dhikr', label: 'Dhikr' },
  { path: '/iman/sunnah', label: 'Sunnah' },
  { path: '/iman/quran', label: 'Quran' },
  { path: '/iman/prayer-times', label: 'Prayer' },
  { path: '/iman/zakat', label: 'Zakat' },
];

// ─── Target definitions ───────────────────────────────────────────────────────

interface TargetOption {
  key: string;
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  dailyAmount: string;
  completionDays: number | null; // null = ongoing
}

const TARGETS: TargetOption[] = [
  { key: 'khatam_30',  icon: <Crown className="h-5 w-5 text-primary" />,   label: 'Khatam 30 Juz',  sublabel: 'Complete in 30 days',   dailyAmount: '1 juz/day',      completionDays: 30   },
  { key: 'khatam_60',  icon: <Star className="h-5 w-5 text-primary" />,    label: 'Khatam 15 Juz',  sublabel: 'Complete in 60 days',   dailyAmount: '½ juz/day',      completionDays: 60   },
  { key: 'khatam_90',  icon: <BookOpen className="h-5 w-5 text-primary" />, label: 'Khatam 10 Juz', sublabel: 'Complete in 90 days',   dailyAmount: '~3 pages/day',   completionDays: 90   },
  { key: 'khatam_180', icon: <Layers className="h-5 w-5 text-primary" />,  label: 'Khatam 5 Juz',   sublabel: 'Complete in 180 days',  dailyAmount: '~1.5 pages/day', completionDays: 180  },
  { key: 'khatam_365', icon: <FileText className="h-5 w-5 text-primary" />, label: 'Khatam 1 Juz',  sublabel: 'Complete in 1 year',    dailyAmount: '~⅓ page/day',    completionDays: 365  },
  { key: 'page_10',    icon: <Zap className="h-5 w-5 text-primary" />,     label: '10 Pages/day',   sublabel: 'Complete in ~60 days',  dailyAmount: '10 pages',       completionDays: 60   },
  { key: 'page_1',     icon: <Leaf className="h-5 w-5 text-primary" />,    label: '1 Page/day',     sublabel: 'Complete in ~600 days', dailyAmount: '1 page',         completionDays: 600  },
  { key: 'ayah_1',     icon: <Hash className="h-5 w-5 text-primary" />,    label: '1 Ayah/day',     sublabel: 'Small but consistent',  dailyAmount: '1 ayah',         completionDays: null },
];

function getEstimatedDate(days: number | null): string {
  if (!days) return 'Ongoing journey';
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `Est. complete: ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

function getTargetDailyLabel(key: string): string {
  return TARGETS.find(t => t.key === key)?.dailyAmount ?? 'your daily reading';
}

function getTargetLabel(key: string): string {
  return TARGETS.find(t => t.key === key)?.label ?? 'your target';
}

// ─── Calendar component ───────────────────────────────────────────────────────

function QuranCalendar({ log }: { log: { date: string; target_met: boolean }[] }) {
  const days = useMemo(() => {
    const result = [];
    const today = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const entry = log.find(e => e.date === dateStr);
      result.push({
        dateStr,
        day: d.getDate(),
        met: entry?.target_met ?? false,
        hasEntry: !!entry,
      });
    }
    return result;
  }, [log]);

  const DOW_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 mb-1">
        {DOW_HEADERS.map((h, i) => (
          <div key={i} className="text-center text-[10px] font-semibold text-muted-foreground">{h}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map(d => (
          <div
            key={d.dateStr}
            title={d.dateStr}
            className={`aspect-square rounded text-[11px] flex items-center justify-center font-medium
              ${d.met
                ? 'bg-primary text-primary-foreground'
                : d.hasEntry
                ? 'bg-destructive/30 text-destructive-foreground'
                : 'bg-secondary text-muted-foreground'
              }`}
          >
            {d.day}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Progress Ring ────────────────────────────────────────────────────────────

function ProgressRing({ percent, label, sublabel }: { percent: number; label: string; sublabel: string }) {
  const size = 160;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="-rotate-90" width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <BookOpen className="h-5 w-5 text-primary mb-1" />
          <span className="text-2xl font-bold">{Math.round(percent)}%</span>
        </div>
      </div>
      <p className="text-sm font-semibold mt-2">{label}</p>
      <p className="text-xs text-muted-foreground">{sublabel}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const QuranReader = () => {
  const navigate = useNavigate();
  const {
    prefs, savePrefs, loading,
    log, isDoneToday, streak, daysDone,
    markTodayDone, selectTarget,
  } = useQuranDailyTarget();
  const { bookmarks } = useQuranBookmarks();

  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [markSheetOpen, setMarkSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('surah');

  const targetSelected = !!prefs.target_selected_at;

  // Filtered surah list
  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return SURAH_NAMES;
    const q = searchQuery.toLowerCase();
    return SURAH_NAMES.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.arabic.includes(q) ||
      String(s.number).includes(q)
    );
  }, [searchQuery]);

  // Juz grouping
  const juzList = useMemo(() => {
    const juzStarts = [
      [1,1],[2,142],[2,253],[3,93],[4,24],[4,148],[5,82],[6,111],[7,88],[8,41],
      [9,93],[11,6],[12,53],[15,1],[17,1],[18,75],[21,1],[23,1],[25,21],[27,56],
      [29,46],[33,31],[36,28],[39,32],[41,47],[46,1],[51,31],[58,1],[67,1],[78,1],
    ];
    return juzStarts.map(([startS], i) => {
      const endS = i < 29 ? juzStarts[i + 1][0] : 114;
      const names: string[] = [];
      for (let s = startS; s <= Math.min(endS, 114); s++) {
        names.push(SURAH_NAMES[s - 1]?.name || '');
      }
      return { number: i + 1, surahs: names.slice(0, 3).join(', ') + (names.length > 3 ? '...' : '') };
    });
  }, []);

  // Stats
  const targetDays = TARGETS.find(t => t.key === prefs.daily_target_type)?.completionDays ?? null;
  const progressPercent = targetDays ? Math.min(100, (daysDone / targetDays) * 100) : 0;
  const daysRemaining = targetDays ? Math.max(0, targetDays - daysDone) : null;

  // Achievements
  const achievements = [
    { label: 'First Day',     icon: <CheckCircle2 className="h-5 w-5" />, earned: daysDone >= 1 },
    { label: '7 Day Streak',  icon: <Flame className="h-5 w-5" />,        earned: streak >= 7 },
    { label: '30 Day Streak', icon: <Award className="h-5 w-5" />,        earned: streak >= 30 },
    { label: 'Khatam',        icon: <Medal className="h-5 w-5" />,        earned: targetDays !== null && daysDone >= (targetDays ?? Infinity) },
  ];

  const handleBeginJourney = async () => {
    if (!selectedTarget) {
      toast.error('Please select a target first');
      return;
    }
    await selectTarget(selectedTarget);
    toast.success('Your Quran journey begins! Bismillah 🤲');
  };

  const handleMarkDone = async () => {
    // Use auto-filled last position from prefs — no manual input needed
    const surahNum = prefs.last_surah > 0 ? prefs.last_surah : undefined;
    const ayahNum = prefs.last_ayah > 0 ? prefs.last_ayah : undefined;
    await markTodayDone(surahNum, ayahNum);
    setMarkSheetOpen(false);
    toast.success('Barakallah! Keep it up 🌟');
  };

  if (loading) {
    return (
      <SubPageLayout title="Quran" backTo="/iman" siblingRoutes={IMAN_SIBLINGS} currentPath="/iman/quran">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      </SubPageLayout>
    );
  }

  // ── View A: Target Onboarding ──────────────────────────────────────────────
  if (!targetSelected) {
    return (
      <SubPageLayout title="Quran" backTo="/iman" siblingRoutes={IMAN_SIBLINGS} currentPath="/iman/quran">
        <div className="space-y-5">
          {/* Quote */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-4 text-center">
              <Sparkles className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                "The deeds Allah loves most are those that are consistent, even if they are small."
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">— Prophet Muhammad ﷺ (Bukhari)</p>
            </CardContent>
          </Card>

          {/* Title */}
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold">Start your daily Quran journey</h2>
            <p className="text-sm text-muted-foreground">Choose a target you can commit to — every single day</p>
          </div>

          {/* Target cards */}
          <div className="grid grid-cols-2 gap-2.5">
            {TARGETS.map(t => (
              <Card
                key={t.key}
                className={`cursor-pointer transition-all ${
                  selectedTarget === t.key
                    ? 'border-primary ring-2 ring-primary/30 bg-primary/5'
                    : 'hover:border-primary/30'
                }`}
                onClick={() => setSelectedTarget(t.key)}
              >
                <CardContent className="p-3 text-center space-y-1">
                  <div className="flex justify-center">{t.icon}</div>
                  <p className="text-xs font-semibold leading-tight">{t.label}</p>
                  <p className="text-[10px] text-muted-foreground">{t.dailyAmount}</p>
                  <p className="text-[10px] text-muted-foreground/70 line-clamp-1">{getEstimatedDate(t.completionDays)}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3" /> Small but consistent is beloved by Allah
          </p>

          <Button
            className="w-full"
            disabled={!selectedTarget}
            onClick={handleBeginJourney}
          >
            Begin My Journey
          </Button>

          {/* Skip to reader */}
          <div className="border-t pt-4">
            <p className="text-xs text-center text-muted-foreground mb-3">Or go straight to reading</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search surah..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            {searchQuery && (
              <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                {filteredSurahs.slice(0, 8).map(surah => (
                  <Card
                    key={surah.number}
                    className="cursor-pointer hover:border-primary/20 transition-all"
                    onClick={() => navigate(`/iman/quran/read/${surah.number}`)}
                  >
                    <CardContent className="p-2 flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-secondary flex items-center justify-center text-xs font-bold shrink-0">
                        {surah.number}
                      </span>
                      <span className="text-sm">{surah.name}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </SubPageLayout>
    );
  }

  // ── View B: Main Tracker Dashboard ─────────────────────────────────────────
  return (
    <SubPageLayout title="Quran" backTo="/iman" siblingRoutes={IMAN_SIBLINGS} currentPath="/iman/quran">
      <div className="space-y-4">

        {/* Hero Progress Ring */}
        <div className="flex justify-center py-2">
          <ProgressRing
            percent={progressPercent}
            label={getTargetLabel(prefs.daily_target_type!)}
            sublabel={targetDays
              ? `${daysDone} of ${targetDays} days completed`
              : `${daysDone} days completed`}
          />
        </div>

        {/* Today's Target Card */}
        <Card className={isDoneToday
          ? 'border-primary/30 bg-gradient-to-br from-primary/5 to-transparent'
          : ''}>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Today's Target
            </p>
            <p className="text-sm font-medium mb-3">
              {getTargetDailyLabel(prefs.daily_target_type!)}
            </p>
            {isDoneToday ? (
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Barakallah! See you tomorrow.</p>
                  {streak > 0 && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Flame className="h-3 w-3" /> {streak} day streak</p>
                  )}
                </div>
              </div>
            ) : (
              <Button className="w-full flex items-center gap-2" size="lg" onClick={() => setMarkSheetOpen(true)}>
                <CheckCircle2 className="h-4 w-4" /> Mark Today as Done
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          <Card>
            <CardContent className="p-3 text-center">
              <Calendar className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">{daysRemaining ?? '∞'}</p>
              <p className="text-[10px] text-muted-foreground">Days Left</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Flame className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">{streak}</p>
              <p className="text-[10px] text-muted-foreground">Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Star className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">{daysDone}</p>
              <p className="text-[10px] text-muted-foreground">Days Done</p>
            </CardContent>
          </Card>
        </div>

        {/* Last Read / Continue Reading */}
        {prefs.last_surah > 0 && (
          <Card
            className="cursor-pointer hover:border-primary/30 transition-all"
            onClick={() => navigate(`/iman/quran/read/${prefs.last_surah}?ayah=${prefs.last_ayah}`)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Read</p>
                  <p className="text-sm font-semibold">
                    {SURAH_NAMES[prefs.last_surah - 1]?.name} · Ayah {prefs.last_ayah}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-primary font-medium">
                Continue <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monthly Calendar (30-day) */}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Last 30 Days
            </p>
            <QuranCalendar log={log} />
            <div className="flex gap-4 mt-3 justify-end">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-primary" />
                <span className="text-[10px] text-muted-foreground">Done</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-secondary" />
                <span className="text-[10px] text-muted-foreground">Not yet</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Achievements
            </p>
            <div className="grid grid-cols-4 gap-2">
              {achievements.map(a => (
                <div key={a.label} className={`text-center p-2 rounded-lg min-h-[60px] flex flex-col items-center justify-center ${a.earned ? 'bg-primary/10 text-primary' : 'bg-secondary/50 text-muted-foreground opacity-50'}`}>
                  <div className="flex justify-center">{a.icon}</div>
                  <p className="text-[10px] mt-1 leading-tight font-medium break-words text-center">{a.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Settings + Change Target */}
        <div className="flex items-center justify-between">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs">
                <Settings2 className="h-3.5 w-3.5 mr-1" /> Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>Quran Settings</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs">Translation</Label>
                  <Select value={prefs.translation_lang} onValueChange={v => savePrefs({ translation_lang: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(TRANSLATION_IDS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Arabic Font Size: {prefs.font_size}px</Label>
                  <Slider
                    value={[prefs.font_size]}
                    onValueChange={([v]) => savePrefs({ font_size: v })}
                    min={18} max={40} step={2}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-2 block">Change Daily Target</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {TARGETS.map(t => (
                      <Button
                        key={t.key}
                        variant={prefs.daily_target_type === t.key ? 'default' : 'outline'}
                        size="sm"
                        className="text-xs h-auto py-1.5 justify-start gap-1.5"
                        onClick={() => savePrefs({ daily_target_type: t.key })}
                      >
                        {t.icon} {t.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="border-t pt-4">
                  <Label className="text-xs text-muted-foreground mb-2 block">Danger Zone</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => savePrefs({ daily_target_type: null as any, target_selected_at: null as any })}
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset My Target
                  </Button>
                  <p className="text-[10px] text-muted-foreground/70 mt-1.5 text-center">
                    Returns you to target selection. Your reading history is kept.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Trophy className="h-4 w-4 text-muted-foreground/40" />
        </div>

        {/* Divider */}
        <div className="border-t pt-2">
          <p className="text-xs text-muted-foreground text-center mb-3">Browse & Read</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search surah by name or number..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Tabs: Surah / Juz / Bookmarks */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="surah">Surah</TabsTrigger>
            <TabsTrigger value="juz">Juz</TabsTrigger>
            <TabsTrigger value="bookmarks">
              <BookMarked className="h-3.5 w-3.5 mr-1" />
              {bookmarks.length > 0 && <span className="text-[10px]">({bookmarks.length})</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="surah" className="mt-3">
            <ScrollArea className="h-[50vh]">
              <div className="space-y-1">
                {filteredSurahs.map(surah => (
                  <Card
                    key={surah.number}
                    className="cursor-pointer hover:border-primary/20 transition-all"
                    onClick={() => navigate(`/iman/quran/read/${surah.number}`)}
                  >
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                          <span className="text-xs font-bold">{surah.number}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{surah.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {surah.type} · {surah.ayahs} ayahs
                          </p>
                        </div>
                      </div>
                      <p className="text-base text-right" style={{ fontFamily: 'serif' }}>
                        {surah.arabic}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="juz" className="mt-3">
            <ScrollArea className="h-[50vh]">
              <div className="space-y-1">
                {juzList.map(juz => (
                  <Card
                    key={juz.number}
                    className="cursor-pointer hover:border-primary/20 transition-all"
                    onClick={() => {
                      const juzStarts = [1,2,2,3,4,4,5,6,7,8,9,11,12,15,17,18,21,23,25,27,29,33,36,39,41,46,51,58,67,78];
                      navigate(`/iman/quran/read/${juzStarts[juz.number - 1]}`);
                    }}
                  >
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">{juz.number}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Juz {juz.number}</p>
                          <p className="text-[10px] text-muted-foreground">{juz.surahs}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="bookmarks" className="mt-3">
            {bookmarks.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-sm text-muted-foreground">
                  <BookMarked className="h-6 w-6 mx-auto mb-2 opacity-40" />
                  <p>No bookmarks yet</p>
                  <p className="text-[10px] mt-1">Tap the bookmark icon while reading to save your favorite ayahs.</p>
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className="h-[50vh]">
                <div className="space-y-1">
                  {bookmarks.map(bm => {
                    const surah = SURAH_NAMES[bm.surah_number - 1];
                    return (
                      <Card
                        key={bm.id}
                        className="cursor-pointer hover:border-primary/20 transition-all"
                        onClick={() => navigate(`/iman/quran/read/${bm.surah_number}?ayah=${bm.ayah_number}`)}
                      >
                        <CardContent className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <BookMarked className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-sm font-semibold">{surah?.name} : {bm.ayah_number}</p>
                              {bm.note && <p className="text-[10px] text-muted-foreground">{bm.note}</p>}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>

        {/* Mark as Done Sheet — auto-filled from last saved position */}
        <Sheet open={markSheetOpen} onOpenChange={setMarkSheetOpen}>
          <SheetContent side="bottom" className="rounded-t-2xl pb-8">
            <SheetHeader className="mb-4">
              <SheetTitle>Tandai hari ini selesai?</SheetTitle>
            </SheetHeader>

            {prefs.last_surah > 0 ? (
              <div className="bg-secondary/60 rounded-xl p-4 mb-5 text-center">
                <p className="text-xs text-muted-foreground mb-1">Posisi terakhir</p>
                <p className="text-base font-semibold text-foreground">
                  {SURAH_NAMES[prefs.last_surah - 1]?.name ?? `Surah ${prefs.last_surah}`}
                  {' '}·{' '}
                  Ayat {prefs.last_ayah}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-5 text-center">
                Belum ada posisi tersimpan — target hari ini akan ditandai selesai.
              </p>
            )}

            <Button className="w-full flex items-center gap-2" size="lg" onClick={handleMarkDone}>
              <CheckCircle2 className="h-4 w-4" /> Confirm ✓
            </Button>
          </SheetContent>
        </Sheet>

      </div>
    </SubPageLayout>
  );
};

export default QuranReader;
