import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Search, BookMarked, Star, ChevronRight,
  Layers, Settings2, Moon, Sun, Flame, Target, Trophy,
  BarChart3, Brain,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import SubPageLayout from '@/components/SubPageLayout';
import { useQuranPrefs, useQuranBookmarks, useQuranSessions } from '@/hooks/useQuranData';
import { SURAH_NAMES, TOTAL_AYAHS, TRANSLATION_IDS } from '@/lib/quran-api';
import { toast } from 'sonner';

const DEEN_SIBLINGS = [
  { path: '/deen/dhikr', label: 'Dhikr' },
  { path: '/deen/sunnah', label: 'Sunnah' },
  { path: '/deen/quran', label: 'Quran' },
  { path: '/deen/prayer-times', label: 'Prayer' },
  { path: '/deen/zakat', label: 'Zakat' },
];

const QuranReader = () => {
  const navigate = useNavigate();
  const { prefs, savePrefs, loading: prefsLoading, prompted, setPrompted } = useQuranPrefs();
  const { bookmarks } = useQuranBookmarks();
  const { getSessions } = useQuranSessions();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('surah');
  const [sessions, setSessions] = useState<any[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Load sessions for stats
  useEffect(() => {
    getSessions(30).then(s => setSessions(s || []));
  }, []);

  // Show onboarding prompt if first time
  useEffect(() => {
    if (!prefsLoading && !prompted) {
      setShowOnboarding(true);
    }
  }, [prefsLoading, prompted]);

  const handleTrackerChoice = async (enable: boolean) => {
    await savePrefs({ tracker_enabled: enable });
    setPrompted(true);
    setShowOnboarding(false);
    toast.success(enable ? 'Tracker enabled! Your reading will be tracked automatically.' : 'Got it! You can enable tracking later in settings.');
  };

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
    const juzs: { number: number; surahs: string }[] = [];
    // Approximate juz boundaries
    const juzStart = [
      [1,1],[2,142],[2,253],[3,93],[4,24],[4,148],[5,82],[6,111],[7,88],[8,41],
      [9,93],[11,6],[12,53],[15,1],[17,1],[18,75],[21,1],[23,1],[25,21],[27,56],
      [29,46],[33,31],[36,28],[39,32],[41,47],[46,1],[51,31],[58,1],[67,1],[78,1],
    ];
    for (let i = 0; i < 30; i++) {
      const [startS] = juzStart[i];
      const endS = i < 29 ? juzStart[i + 1][0] : 114;
      const surahNames = [];
      for (let s = startS; s <= Math.min(endS, 114); s++) {
        surahNames.push(SURAH_NAMES[s - 1]?.name || '');
      }
      juzs.push({ number: i + 1, surahs: surahNames.slice(0, 3).join(', ') + (surahNames.length > 3 ? '...' : '') });
    }
    return juzs;
  }, []);

  // Stats
  const totalAyahsRead = sessions.reduce((s, r) => s + (r.ayahs_read || 0), 0);
  const completionPercent = Math.min(100, Math.round((totalAyahsRead / TOTAL_AYAHS) * 100));
  const todaySessions = sessions.filter(s => s.date === new Date().toISOString().split('T')[0]);
  const todayPages = todaySessions.reduce((s, r) => s + Number(r.pages_read || 0), 0);
  const streak = (() => {
    const dates = new Set(sessions.map(s => s.date));
    let count = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      const key = d.toISOString().split('T')[0];
      if (dates.has(key)) count++;
      else if (i > 0) break;
      d.setDate(d.getDate() - 1);
    }
    return count;
  })();

  if (prefsLoading) {
    return (
      <SubPageLayout title="Quran" backTo="/deen" siblingRoutes={DEEN_SIBLINGS} currentPath="/deen/quran">
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      </SubPageLayout>
    );
  }

  return (
    <SubPageLayout title="Quran" backTo="/deen" siblingRoutes={DEEN_SIBLINGS} currentPath="/deen/quran">
      <div className="space-y-4">

        {/* Onboarding Prompt */}
        {showOnboarding && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-5 text-center space-y-3">
              <BookOpen className="h-8 w-8 text-primary mx-auto" />
              <h3 className="text-sm font-semibold">Would you like to track your Quran reading?</h3>
              <p className="text-xs text-muted-foreground">
                We'll remember where you left off and help you build a consistent reading habit.
              </p>
              <div className="flex gap-2 justify-center pt-1">
                <Button size="sm" onClick={() => handleTrackerChoice(true)}>
                  Yes, track my progress
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleTrackerChoice(false)}>
                  No thanks, just read
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tracker Stats (when enabled) */}
        {prefs.tracker_enabled && !showOnboarding && (
          <>
            {/* Continue reading */}
            {prefs.last_surah > 0 && (
              <Card
                className="cursor-pointer hover:border-primary/30 transition-all"
                onClick={() => navigate(`/deen/quran/read/${prefs.last_surah}?ayah=${prefs.last_ayah}`)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Continue Reading</p>
                      <p className="text-[11px] text-muted-foreground">
                        {SURAH_NAMES[prefs.last_surah - 1]?.name} · Ayah {prefs.last_ayah}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            )}

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2">
              <Card>
                <CardContent className="p-3 text-center">
                  <Flame className="h-3.5 w-3.5 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold">{streak}</p>
                  <p className="text-[9px] text-muted-foreground">Day Streak</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <Target className="h-3.5 w-3.5 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold">{todayPages.toFixed(1)}</p>
                  <p className="text-[9px] text-muted-foreground">Pages Today</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <BarChart3 className="h-3.5 w-3.5 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold">{completionPercent}%</p>
                  <p className="text-[9px] text-muted-foreground">Complete</p>
                </CardContent>
              </Card>
            </div>

            {/* Daily goal progress */}
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-medium">Daily Goal</p>
                  <span className="text-xs text-primary font-bold">
                    {todayPages.toFixed(1)} / {prefs.daily_goal_pages} pages
                  </span>
                </div>
                <Progress value={Math.min(100, (todayPages / prefs.daily_goal_pages) * 100)} className="h-1.5" />
              </CardContent>
            </Card>
          </>
        )}

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

        {/* Settings button */}
        <div className="flex justify-end">
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
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Reading Tracker</Label>
                  <Switch checked={prefs.tracker_enabled} onCheckedChange={v => savePrefs({ tracker_enabled: v })} />
                </div>
                {prefs.tracker_enabled && (
                  <div>
                    <Label className="text-xs">Daily Goal (pages)</Label>
                    <Input
                      type="number" min={1} max={50}
                      value={prefs.daily_goal_pages}
                      onChange={e => savePrefs({ daily_goal_pages: Number(e.target.value) || 4 })}
                      className="mt-1 h-8"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Memorization Tracker</Label>
                  <Switch checked={prefs.memorization_enabled} onCheckedChange={v => savePrefs({ memorization_enabled: v })} />
                </div>
              </div>
            </DialogContent>
          </Dialog>
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

          {/* Surah List */}
          <TabsContent value="surah" className="mt-3">
            <ScrollArea className="h-[50vh]">
              <div className="space-y-1">
                {filteredSurahs.map(surah => (
                  <Card
                    key={surah.number}
                    className="cursor-pointer hover:border-primary/20 transition-all"
                    onClick={() => navigate(`/deen/quran/read/${surah.number}`)}
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
                      <p className="text-base font-arabic text-right" style={{ fontFamily: 'serif' }}>
                        {surah.arabic}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Juz List */}
          <TabsContent value="juz" className="mt-3">
            <ScrollArea className="h-[50vh]">
              <div className="space-y-1">
                {juzList.map(juz => (
                  <Card
                    key={juz.number}
                    className="cursor-pointer hover:border-primary/20 transition-all"
                    onClick={() => {
                      // Navigate to first surah of juz
                      const juzStarts = [1,2,2,3,4,4,5,6,7,8,9,11,12,15,17,18,21,23,25,27,29,33,36,39,41,46,51,58,67,78];
                      navigate(`/deen/quran/read/${juzStarts[juz.number - 1]}`);
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

          {/* Bookmarks */}
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
                        onClick={() => navigate(`/deen/quran/read/${bm.surah_number}?ayah=${bm.ayah_number}`)}
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
      </div>
    </SubPageLayout>
  );
};

export default QuranReader;
