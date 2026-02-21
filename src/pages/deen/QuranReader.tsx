import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Search, BookMarked, ChevronRight, Settings2,
  CheckCircle2, Flame, Calendar, Trophy, Star, Sparkles,
  Crown, Layers, FileText, Leaf, Hash, Zap, Award, Medal, RotateCcw,
  Plus, Pencil, Trash2, ChevronDown,
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import SubPageLayout from '@/components/SubPageLayout';
import { useQuranPrefs, useQuranBookmarks } from '@/hooks/useQuranData';
import { useQuranReadingLog, type ReadingLogEntry } from '@/hooks/useQuranReadingLog';
import { SURAH_NAMES, TRANSLATION_IDS } from '@/lib/quran-api';
import {
  ayahCountInRange, pageCountInRange, juzSegmentsInRange,
  globalAyahIndex, pageToSurahAyah, lastAyahOnPage, pageForAyah,
  advanceByAyahs, endOfSurah, advanceByOnePage, advanceByOneHizb,
  isValidSurahAyah,
} from '@/lib/quran-mapping';
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
  completionDays: number | null;
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

// ─── Log entry row ────────────────────────────────────────────────────────────

function LogEntryRow({ entry, onEdit, onDelete }: {
  entry: ReadingLogEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const startName = SURAH_NAMES[entry.start_surah - 1]?.name ?? '';
  const endName = SURAH_NAMES[entry.end_surah - 1]?.name ?? '';
  const time = new Date(entry.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const isPageMode = entry.log_type === 'page';
  const unitLabel = isPageMode ? 'Page' : 'Ayah';
  const rangeLabel = entry.start_surah === entry.end_surah
    ? `${startName} · ${unitLabel} ${entry.start_ayah}–${entry.end_ayah}`
    : `${startName} ${unitLabel} ${entry.start_ayah} → ${endName} ${unitLabel} ${entry.end_ayah}`;

  return (
    <div className="flex items-center justify-between py-2 px-1 group">
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onEdit}>
        <p className="text-sm font-medium truncate">{rangeLabel}</p>
        <p className="text-[10px] text-muted-foreground">
          {time} · {entry.ayah_count} ayah · {Number(entry.page_count)} pages
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
          <Pencil className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onDelete}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const QuranReader = () => {
  const navigate = useNavigate();
  const { prefs, savePrefs, loading: prefsLoading } = useQuranPrefs();
  const {
    todayLogs, todayTotalAyahs, todayTotalPages,
    allTimeTotalAyahs, allTimeTotalPages,
    hasDoneToday, streak, lastPosition, last7DaysLogs,
    loading: logLoading, addLog, updateLog, deleteLog, checkOverlap, logs,
  } = useQuranReadingLog();
  const { bookmarks } = useQuranBookmarks();

  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [logSheetOpen, setLogSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('surah');
  const [last7Open, setLast7Open] = useState(false);

  // Log sheet state
  const [logMode, setLogMode] = useState<'continue' | 'manual'>('continue');
  const [inputTab, setInputTab] = useState<'ayah' | 'page'>('ayah');
  const [editingLog, setEditingLog] = useState<ReadingLogEntry | null>(null);

  // Ayah inputs
  const [fromSurah, setFromSurah] = useState(1);
  const [fromAyah, setFromAyah] = useState(1);
  const [toSurah, setToSurah] = useState(1);
  const [toAyah, setToAyah] = useState(1);

  // Page inputs
  const [fromPage, setFromPage] = useState(1);
  const [toPage, setToPage] = useState(1);

  const loading = prefsLoading || logLoading;
  const targetSelected = !!prefs.target_selected_at;

  // Filtered surah list
  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return SURAH_NAMES;
    const q = searchQuery.toLowerCase();
    return SURAH_NAMES.filter(s =>
      s.name.toLowerCase().includes(q) || s.arabic.includes(q) || String(s.number).includes(q)
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

  // Khatam progress (based on total ayahs / 6236)
  const khatamPercent = Math.min(100, (allTimeTotalAyahs / 6236) * 100);

  // Open log sheet
  const openLogSheet = useCallback((editEntry?: ReadingLogEntry) => {
    if (editEntry) {
      setEditingLog(editEntry);
      setLogMode('manual');
      setInputTab('ayah');
      setFromSurah(editEntry.start_surah);
      setFromAyah(editEntry.start_ayah);
      setToSurah(editEntry.end_surah);
      setToAyah(editEntry.end_ayah);
    } else {
      setEditingLog(null);
      setLogMode('continue');
      setInputTab('ayah');
      setFromSurah(lastPosition.surah);
      setFromAyah(lastPosition.ayah);
      // Default "To" = same as from (user will adjust)
      setToSurah(lastPosition.surah);
      setToAyah(lastPosition.ayah);
      setFromPage(pageForAyah(lastPosition.surah, lastPosition.ayah));
      setToPage(pageForAyah(lastPosition.surah, lastPosition.ayah));
    }
    setLogSheetOpen(true);
  }, [lastPosition]);

  // Live summary calculation
  const liveSummary = useMemo(() => {
    let sS: number, sA: number, eS: number, eA: number;
    if (inputTab === 'page') {
      const from = pageToSurahAyah(fromPage);
      const to = lastAyahOnPage(toPage);
      sS = from.surah; sA = from.ayah; eS = to.surah; eA = to.ayah;
    } else {
      sS = logMode === 'continue' ? lastPosition.surah : fromSurah;
      sA = logMode === 'continue' ? lastPosition.ayah : fromAyah;
      eS = toSurah; eA = toAyah;
    }

    // Auto-swap if from > to
    const fromGi = globalAyahIndex(sS, sA);
    const toGi = globalAyahIndex(eS, eA);
    if (fromGi > toGi) {
      [sS, sA, eS, eA] = [eS, eA, sS, sA];
    }

    const ayahs = ayahCountInRange(sS, sA, eS, eA);
    const pages = pageCountInRange(sS, sA, eS, eA);
    const juz = juzSegmentsInRange(sS, sA, eS, eA);
    return { ayahs, pages, juz, startS: sS, startA: sA, endS: eS, endA: eA };
  }, [inputTab, fromPage, toPage, logMode, lastPosition, fromSurah, fromAyah, toSurah, toAyah]);

  // Quick buttons
  const applyQuick = useCallback((fn: (s: number, a: number) => { surah: number; ayah: number }) => {
    const from = logMode === 'continue' ? lastPosition : { surah: fromSurah, ayah: fromAyah };
    const result = fn(from.surah, from.ayah);
    setToSurah(result.surah);
    setToAyah(result.ayah);
  }, [logMode, lastPosition, fromSurah, fromAyah]);

  // Save handler
  const handleSave = async () => {
    const { startS, startA, endS, endA, ayahs, pages, juz } = liveSummary;
    if (ayahs <= 0) {
      toast.error('Please select a valid range');
      return;
    }

    // Check overlap
    const overlaps = checkOverlap(startS, startA, endS, endA);
    const editId = editingLog?.id;
    const realOverlaps = overlaps.filter(o => o.id !== editId);

    if (realOverlaps.length > 0) {
      // For now, keep both (user can delete manually)
      toast.info('Note: This range overlaps with an existing log entry.');
    }

    const logType = inputTab === 'page' ? 'page' : logMode;

    if (editingLog) {
      await updateLog(editingLog.id, {
        start_surah: startS,
        start_ayah: startA,
        end_surah: endS,
        end_ayah: endA,
        log_type: logType,
      });
      toast.success(`Updated: ${ayahs} ayah, ${pages} pages`);
    } else {
      await addLog({
        log_type: logType,
        start_surah: startS,
        start_ayah: startA,
        end_surah: endS,
        end_ayah: endA,
      });
      const streakMsg = streak > 0 ? ` · ${streak + 1}-day streak 🔥` : '';
      toast.success(`MashaAllah! You read ${ayahs} ayah${streakMsg}`);
    }

    setLogSheetOpen(false);
  };

  // Delete with undo
  const handleDelete = (entry: ReadingLogEntry) => {
    deleteLog(entry.id);
    toast('Log deleted', {
      action: {
        label: 'Undo',
        onClick: () => {
          addLog({
            log_type: entry.log_type,
            start_surah: entry.start_surah,
            start_ayah: entry.start_ayah,
            end_surah: entry.end_surah,
            end_ayah: entry.end_ayah,
          });
        },
      },
      duration: 5000,
    });
  };

  const handleBeginJourney = async () => {
    if (!selectedTarget) {
      toast.error('Please select a target first');
      return;
    }
    await savePrefs({
      daily_target_type: selectedTarget,
      target_selected_at: new Date().toISOString(),
    });
    toast.success('Your Quran journey begins! Bismillah 🤲');
  };

  // Stats
  const achievements = [
    { label: 'First Day', icon: <CheckCircle2 className="h-5 w-5" />, earned: allTimeTotalAyahs >= 1 },
    { label: '7 Day Streak', icon: <Flame className="h-5 w-5" />, earned: streak >= 7 },
    { label: '30 Day Streak', icon: <Award className="h-5 w-5" />, earned: streak >= 30 },
    { label: 'Khatam', icon: <Medal className="h-5 w-5" />, earned: allTimeTotalAyahs >= 6236 },
  ];

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
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-4 text-center">
              <Sparkles className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                "The deeds Allah loves most are those that are consistent, even if they are small."
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">— Prophet Muhammad ﷺ (Bukhari)</p>
            </CardContent>
          </Card>

          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold">Start your daily Quran journey</h2>
            <p className="text-sm text-muted-foreground">Choose a target you can commit to — every single day</p>
          </div>

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

          <Button className="w-full" disabled={!selectedTarget} onClick={handleBeginJourney}>
            Begin My Journey
          </Button>

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

  // Group last 7 days logs by date
  const last7ByDate = last7DaysLogs.reduce<Record<string, ReadingLogEntry[]>>((acc, l) => {
    (acc[l.date] = acc[l.date] || []).push(l);
    return acc;
  }, {});

  return (
    <SubPageLayout title="Quran" backTo="/iman" siblingRoutes={IMAN_SIBLINGS} currentPath="/iman/quran">
      <div className="space-y-4">

        {/* Khatam Progress Ring */}
        <div className="flex justify-center py-2">
          <ProgressRing
            percent={khatamPercent}
            label="Khatam Progress"
            sublabel={`${allTimeTotalAyahs} of 6,236 ayahs read`}
          />
        </div>

        {/* Log Reading Button */}
        <Button className="w-full flex items-center gap-2" size="lg" onClick={() => openLogSheet()}>
          <Plus className="h-4 w-4" /> Log Reading
        </Button>

        {/* Today's Reading Summary */}
        <Card className={hasDoneToday ? 'border-primary/30 bg-gradient-to-br from-primary/5 to-transparent' : ''}>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Today's Reading
            </p>
            {hasDoneToday ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">{todayTotalAyahs} ayah · {todayTotalPages} pages</p>
                    {streak > 0 && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Flame className="h-3 w-3" /> {streak} day streak
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-0.5 border-t pt-2">
                  {todayLogs.map(entry => (
                    <LogEntryRow
                      key={entry.id}
                      entry={entry}
                      onEdit={() => openLogSheet(entry)}
                      onDelete={() => handleDelete(entry)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No reading logged yet today. Tap "Log Reading" to start!</p>
            )}
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          <Card>
            <CardContent className="p-3 text-center">
              <BookOpen className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">{allTimeTotalAyahs}</p>
              <p className="text-[10px] text-muted-foreground">Total Ayahs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <FileText className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">{allTimeTotalPages}</p>
              <p className="text-[10px] text-muted-foreground">Total Pages</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Flame className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">{streak}</p>
              <p className="text-[10px] text-muted-foreground">Streak</p>
            </CardContent>
          </Card>
        </div>

        {/* Last Read / Continue */}
        {lastPosition.surah > 0 && (
          <Card
            className="cursor-pointer hover:border-primary/30 transition-all"
            onClick={() => navigate(`/iman/quran/read/${lastPosition.surah}?ayah=${lastPosition.ayah}`)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Read</p>
                  <p className="text-sm font-semibold">
                    {SURAH_NAMES[lastPosition.surah - 1]?.name} · Ayah {lastPosition.ayah}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-primary font-medium">
                Continue <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Last 7 Days (collapsible) */}
        {Object.keys(last7ByDate).length > 0 && (
          <Collapsible open={last7Open} onOpenChange={setLast7Open}>
            <Card>
              <CardContent className="p-4">
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Last 7 Days
                  </p>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${last7Open ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-3">
                  {Object.entries(last7ByDate).sort(([a], [b]) => b.localeCompare(a)).map(([date, entries]) => (
                    <div key={date}>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        {new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                      {entries.map(entry => (
                        <LogEntryRow
                          key={entry.id}
                          entry={entry}
                          onEdit={() => openLogSheet(entry)}
                          onDelete={() => handleDelete(entry)}
                        />
                      ))}
                    </div>
                  ))}
                </CollapsibleContent>
              </CardContent>
            </Card>
          </Collapsible>
        )}

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

        {/* Settings */}
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

        {/* ── Log Reading Sheet ─────────────────────────────────────────────── */}
        <Sheet open={logSheetOpen} onOpenChange={setLogSheetOpen}>
          <SheetContent side="bottom" className="rounded-t-2xl pb-8 max-h-[85vh] overflow-y-auto">
            <SheetHeader className="mb-3">
              <SheetTitle>{editingLog ? 'Edit Reading Log' : 'Log Reading'}</SheetTitle>
            </SheetHeader>

            {/* Input tabs: By Ayah / By Page */}
            <Tabs value={inputTab} onValueChange={v => setInputTab(v as any)} className="mb-3">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="ayah">📖 By Ayah</TabsTrigger>
                <TabsTrigger value="page">📄 By Page</TabsTrigger>
              </TabsList>
            </Tabs>

            {inputTab === 'ayah' ? (
              <>
                {/* Mode toggle */}
                {!editingLog && (
                  <div className="flex gap-2 mb-4">
                    <Button
                      variant={logMode === 'continue' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => setLogMode('continue')}
                    >
                      Continue
                    </Button>
                    <Button
                      variant={logMode === 'manual' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => setLogMode('manual')}
                    >
                      Manual Range
                    </Button>
                  </div>
                )}

                {/* From */}
                <div className="mb-3">
                  <Label className="text-xs text-muted-foreground">From</Label>
                  {logMode === 'continue' && !editingLog ? (
                    <div className="bg-secondary/60 rounded-lg p-2.5 mt-1">
                      <p className="text-sm font-medium">
                        {SURAH_NAMES[lastPosition.surah - 1]?.name} · Ayah {lastPosition.ayah}
                      </p>
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-1">
                      <Select value={String(fromSurah)} onValueChange={v => { setFromSurah(Number(v)); setFromAyah(1); }}>
                        <SelectTrigger className="flex-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent className="max-h-60">
                          {SURAH_NAMES.map(s => (
                            <SelectItem key={s.number} value={String(s.number)}>
                              {s.number}. {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-col">
                        <Input
                          type="number"
                          min={1}
                          max={SURAH_NAMES[fromSurah - 1]?.ayahs ?? 1}
                          value={fromAyah}
                          onChange={e => setFromAyah(Math.max(1, Number(e.target.value)))}
                          className="w-20 h-9 text-xs"
                          placeholder="Ayah"
                        />
                        <span className="text-[10px] text-muted-foreground mt-0.5 text-center">Ayah</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* To */}
                <div className="mb-3">
                  <Label className="text-xs text-muted-foreground">To</Label>
                  <div className="flex gap-2 mt-1">
                    <Select value={String(toSurah)} onValueChange={v => { setToSurah(Number(v)); setToAyah(1); }}>
                      <SelectTrigger className="flex-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent className="max-h-60">
                        {SURAH_NAMES.map(s => (
                          <SelectItem key={s.number} value={String(s.number)}>
                            {s.number}. {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-col">
                      <Input
                        type="number"
                        min={1}
                        max={SURAH_NAMES[toSurah - 1]?.ayahs ?? 1}
                        value={toAyah}
                        onChange={e => setToAyah(Math.max(1, Number(e.target.value)))}
                        className="w-20 h-9 text-xs"
                        placeholder="Ayah"
                      />
                      <span className="text-[10px] text-muted-foreground mt-0.5 text-center">Ayah</span>
                    </div>
                  </div>
                </div>

                {/* Quick buttons */}
                {!editingLog && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <Button variant="outline" size="sm" className="text-[10px] h-7 px-2"
                      onClick={() => applyQuick((s, a) => advanceByAyahs(s, a, 5))}>+5 ayah</Button>
                    <Button variant="outline" size="sm" className="text-[10px] h-7 px-2"
                      onClick={() => applyQuick((s, a) => advanceByAyahs(s, a, 10))}>+10 ayah</Button>
                    <Button variant="outline" size="sm" className="text-[10px] h-7 px-2"
                      onClick={() => applyQuick((s, _a) => endOfSurah(s))}>End of surah</Button>
                    <Button variant="outline" size="sm" className="text-[10px] h-7 px-2"
                      onClick={() => applyQuick(advanceByOnePage)}>1 page</Button>
                    <Button variant="outline" size="sm" className="text-[10px] h-7 px-2"
                      onClick={() => applyQuick(advanceByOneHizb)}>1 hizb</Button>
                  </div>
                )}
              </>
            ) : (
              /* By Page tab */
              <div className="mb-4 space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">From Page</Label>
                  <Input
                    type="number"
                    min={1}
                    max={604}
                    value={fromPage}
                    onChange={e => setFromPage(Math.max(1, Math.min(604, Number(e.target.value))))}
                    className="mt-1 h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">To Page</Label>
                  <Input
                    type="number"
                    min={1}
                    max={604}
                    value={toPage}
                    onChange={e => setToPage(Math.max(1, Math.min(604, Number(e.target.value))))}
                    className="mt-1 h-9"
                  />
                </div>
              </div>
            )}

            {/* Live Summary */}
            <Card className="mb-4 border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <p className="text-xs font-semibold text-muted-foreground mb-1.5">Reading Summary</p>
                <div className="space-y-1">
                  <p className="text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> {liveSummary.ayahs} ayah
                  </p>
                  <p className="text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> {liveSummary.pages} pages
                  </p>
                  <p className="text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    Juz {liveSummary.juz.join(', ')} {liveSummary.juz.length > 1 ? '' : '(partial)'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full" size="lg" onClick={handleSave} disabled={liveSummary.ayahs <= 0}>
              {editingLog ? 'Update Reading' : 'Save Reading'}
            </Button>
          </SheetContent>
        </Sheet>

      </div>
    </SubPageLayout>
  );
};

export default QuranReader;
