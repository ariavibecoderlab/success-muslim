import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { Moon, Sun, BookOpen, HandHeart, Star, Flame, Settings2, Calendar, Trophy, Check } from 'lucide-react';
import SubPageLayout from '@/components/SubPageLayout';
import BackdateDatePicker from '@/components/BackdateDatePicker';
import BackdatePrompt from '@/components/BackdatePrompt';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useHijriDate } from '@/hooks/useHijriDate';
import { usePrayerSettings } from '@/hooks/usePrayerSettings';
import { fetchPrayerTimes, formatPrayerTime } from '@/lib/prayer-times';

const IMAN_SIBLINGS = [
  { path: '/iman/prayer-times', label: 'Prayer Times' },
  { path: '/iman/quran', label: 'Quran' },
  { path: '/iman/dhikr', label: 'Dhikr' },
  { path: '/iman/sunnah', label: 'Sunnah' },
  { path: '/iman/fasting', label: 'Fasting' },
  { path: '/iman/qiyam', label: 'Qiyam' },
  { path: '/iman/ramadan', label: 'Ramadan' },
  { path: '/iman/hajj', label: 'Hajj/Umrah' },
];

interface RamadanSettings {
  suhoor_minutes_before_fajr: number;
  daily_quran_goal: number;
  daily_dhikr_goal: number;
  tarawih_target: number;
  suhoor_alarm: boolean;
  iftar_alarm: boolean;
}

interface DailyLog {
  id: string;
  date: string;
  fasted: boolean;
  quran_pages: number;
  tarawih_rakaat: number;
  dhikr_count: number;
  charity_amount: number;
  notes: string | null;
  selawat_count: number;
  sunnah_solat: string[];
}

const DEFAULT_SETTINGS: RamadanSettings = {
  suhoor_minutes_before_fajr: 30,
  daily_quran_goal: 4,
  daily_dhikr_goal: 100,
  tarawih_target: 8,
  suhoor_alarm: true,
  iftar_alarm: true,
};

const SUNNAH_SOLAT_LIST = [
  { id: 'witir', label: 'Witir' },
  { id: 'rawatib', label: 'Rawatib' },
  { id: 'taubat', label: 'Taubat' },
  { id: 'hajat', label: 'Hajat' },
  { id: 'dhuha', label: 'Dhuha' },
];

const SELAWAT_TARGET = 1000;
const DZIKIR_TARGET = 1000;

const RamadanOptimizer = () => {
  const { user } = useAuth();
  const { settings: prayerSettings, loading: prayerLoading } = usePrayerSettings();
  const [settings, setSettings] = useState<RamadanSettings>(DEFAULT_SETTINGS);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState<RamadanSettings>(DEFAULT_SETTINGS);
  const [fajrTime, setFajrTime] = useState('05:30');
  const [maghribTime, setMaghribTime] = useState('19:15');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
  const today = new Date().toISOString().split('T')[0];
  const isSelectedToday = selectedDateKey === today;
  const { isRamadan, ramadanDay } = useHijriDate();
  const isLastTenNights = isRamadan && ramadanDay >= 21;

  // Load prayer times
  useEffect(() => {
    if (prayerLoading) return;
    fetchPrayerTimes(prayerSettings).then(data => {
      if (data) {
        const fajr = data.timings.find(t => t.key === 'Fajr');
        const maghrib = data.timings.find(t => t.key === 'Maghrib');
        if (fajr) setFajrTime(fajr.time);
        if (maghrib) setMaghribTime(maghrib.time);
      }
    });
  }, [prayerSettings, prayerLoading]);

  // Load settings + logs
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: s } = await supabase
        .from('ramadan_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (s) {
        const loaded: RamadanSettings = {
          suhoor_minutes_before_fajr: s.suhoor_minutes_before_fajr,
          daily_quran_goal: s.daily_quran_goal,
          daily_dhikr_goal: s.daily_dhikr_goal,
          tarawih_target: s.tarawih_target,
          suhoor_alarm: s.suhoor_alarm,
          iftar_alarm: s.iftar_alarm,
        };
        setSettings(loaded);
        setTempSettings(loaded);
      }
      const { data: l } = await supabase
        .from('ramadan_daily_log')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30);
      if (l) {
        setLogs(l.map((row: any) => ({
          ...row,
          selawat_count: row.selawat_count ?? 0,
          sunnah_solat: Array.isArray(row.sunnah_solat) ? row.sunnah_solat : [],
        })));
      }
    };
    load();
  }, [user]);

  const selectedLog = logs.find(l => l.date === selectedDateKey);

  // Iftar countdown
  const [iftarCountdown, setIftarCountdown] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const [mh, mm] = maghribTime.split(':').map(Number);
      const target = new Date(now);
      target.setHours(mh, mm, 0, 0);
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setIftarCountdown('Iftar time! 🌙');
      } else {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setIftarCountdown(`${h}h ${m}m ${s}s`);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [maghribTime]);

  // Suhoor time
  const suhoorTime = useMemo(() => {
    const [fh, fm] = fajrTime.split(':').map(Number);
    let totalMin = fh * 60 + fm - settings.suhoor_minutes_before_fajr;
    if (totalMin < 0) totalMin += 24 * 60;
    return `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;
  }, [fajrTime, settings.suhoor_minutes_before_fajr]);

  const logForDate = async (field: string, value: any) => {
    if (!user) return;
    if (selectedLog) {
      await supabase.from('ramadan_daily_log').update({ [field]: value }).eq('id', selectedLog.id);
      setLogs(prev => prev.map(l => l.id === selectedLog.id ? { ...l, [field]: value } : l));
    } else {
      const entry = { user_id: user.id, date: selectedDateKey, [field]: value };
      const { data } = await supabase.from('ramadan_daily_log').insert(entry).select().single();
      if (data) {
        setLogs(prev => [{
          ...(data as any),
          selawat_count: (data as any).selawat_count ?? 0,
          sunnah_solat: Array.isArray((data as any).sunnah_solat) ? (data as any).sunnah_solat : [],
        }, ...prev]);
      }
    }
    toast.success('Updated!');
  };

  const toggleSunnahSolat = async (solatId: string) => {
    const current = selectedLog?.sunnah_solat ?? [];
    const updated = current.includes(solatId)
      ? current.filter((id: string) => id !== solatId)
      : [...current, solatId];
    await logForDate('sunnah_solat', updated);
  };

  const saveSettings = async () => {
    if (!user) return;
    await supabase.from('ramadan_settings').upsert({ user_id: user.id, ...tempSettings }, { onConflict: 'user_id' });
    setSettings(tempSettings);
    setSettingsOpen(false);
    toast.success('Settings saved');
  };

  // Summary stats
  const summary = useMemo(() => {
    const totalFasts = logs.filter(l => l.fasted).length;
    const totalQuran = logs.reduce((s, l) => s + Number(l.quran_pages), 0);
    const totalTarawih = logs.filter(l => l.tarawih_rakaat > 0).length;
    const totalDhikr = logs.reduce((s, l) => s + l.dhikr_count, 0);
    const totalCharity = logs.reduce((s, l) => s + Number(l.charity_amount), 0);
    const totalSelawat = logs.reduce((s, l) => s + (l.selawat_count ?? 0), 0);
    return { totalFasts, totalQuran, totalTarawih, totalDhikr, totalCharity, totalSelawat };
  }, [logs]);

  // Laylatul Qadr nights (odd nights of last 10)
  const lqNights = [21, 23, 25, 27, 29];

  return (
    <SubPageLayout title="Ramadan Optimizer" backTo="/iman" siblingRoutes={IMAN_SIBLINGS} currentPath="/iman/ramadan"
      headerRight={
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm"><Settings2 className="h-4 w-4" /></Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Ramadan Settings</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label className="text-xs">Suhoor alert (min before Fajr)</Label>
                <Input type="number" min={10} max={90} value={tempSettings.suhoor_minutes_before_fajr}
                  onChange={e => setTempSettings(p => ({ ...p, suhoor_minutes_before_fajr: parseInt(e.target.value) || 30 }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Daily Quran (pages)</Label>
                  <Input type="number" min={1} max={30} value={tempSettings.daily_quran_goal}
                    onChange={e => setTempSettings(p => ({ ...p, daily_quran_goal: parseInt(e.target.value) || 4 }))} />
                </div>
                <div>
                  <Label className="text-xs">Tarawih (rakaat)</Label>
                  <Input type="number" min={4} max={20} value={tempSettings.tarawih_target}
                    onChange={e => setTempSettings(p => ({ ...p, tarawih_target: parseInt(e.target.value) || 8 }))} />
                </div>
              </div>
              <div>
                <Label className="text-xs">Daily Dhikr Goal</Label>
                <Input type="number" min={10} max={1000} value={tempSettings.daily_dhikr_goal}
                  onChange={e => setTempSettings(p => ({ ...p, daily_dhikr_goal: parseInt(e.target.value) || 100 }))} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Suhoor Alarm</Label>
                <Switch checked={tempSettings.suhoor_alarm}
                  onCheckedChange={v => setTempSettings(p => ({ ...p, suhoor_alarm: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Iftar Alarm</Label>
                <Switch checked={tempSettings.iftar_alarm}
                  onCheckedChange={v => setTempSettings(p => ({ ...p, iftar_alarm: v }))} />
              </div>
              <Button onClick={saveSettings} className="w-full">Save Settings</Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-5">
        {/* Backdate */}
        <BackdatePrompt moduleKey="ramadan" onLogPastData={() => {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          setSelectedDate(yesterday);
        }} />
        <BackdateDatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />

        {/* Status Hero */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={`border-0 rounded-xl shadow-md ${isRamadan ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white' : 'bg-gradient-to-br from-muted/50 to-transparent'}`}>
            <CardContent className="p-5 text-center">
              {isRamadan ? (
                <>
                   <Moon className="h-8 w-8 text-white/80 mx-auto mb-2" />
                  <p className="text-xs text-white/70 uppercase tracking-wider font-semibold">Ramadan Mubarak</p>
                  <p className="text-3xl font-bold mt-1">Day {ramadanDay} of 30</p>
                  <Progress value={(ramadanDay / 30) * 100} className="h-1.5 mt-2" />
                  {isLastTenNights && (
                    <div className="mt-3 bg-white/10 rounded-lg p-2">
                      <p className="text-xs font-bold">🌟 Last 10 Nights — Seek Laylatul Qadr!</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Ramadan has not started yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Prepare your goals — they'll activate automatically in Ramadan</p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Suhoor / Iftar Times */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <div className="grid grid-cols-2 gap-3">
             <Card className="rounded-xl border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <Moon className="h-5 w-5 text-indigo-400 mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground uppercase">Suhoor</p>
                <p className="text-lg font-bold">{suhoorTime}</p>
                <p className="text-[9px] text-muted-foreground">Fajr: {fajrTime}</p>
              </CardContent>
            </Card>
            <Card className="rounded-xl border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <Sun className="h-5 w-5 text-orange-400 mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground uppercase">Iftar</p>
                <p className="text-lg font-bold">{maghribTime}</p>
                <p className="text-[9px] text-primary font-medium">{iftarCountdown}</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Selawat & Dzikir Counters */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
           <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-4 space-y-4">
              <p className="text-sm font-semibold">Selawat & Dzikir Counter</p>

              {/* Selawat */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    🤲 Selawat
                  </span>
                  <span className="text-xs font-bold">{selectedLog?.selawat_count ?? 0}/{SELAWAT_TARGET}</span>
                </div>
                <Progress value={((selectedLog?.selawat_count ?? 0) / SELAWAT_TARGET) * 100} className="h-2 mb-1.5" />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs px-3"
                    onClick={() => logForDate('selawat_count', (selectedLog?.selawat_count ?? 0) + 10)}>+10</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs px-3"
                    onClick={() => logForDate('selawat_count', (selectedLog?.selawat_count ?? 0) + 33)}>+33</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs px-3"
                    onClick={() => logForDate('selawat_count', (selectedLog?.selawat_count ?? 0) + 100)}>+100</Button>
                </div>
              </div>

              {/* Dzikir (target 1000) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    📿 Dzikir
                  </span>
                  <span className="text-xs font-bold">{selectedLog?.dhikr_count ?? 0}/{DZIKIR_TARGET}</span>
                </div>
                <Progress value={((selectedLog?.dhikr_count ?? 0) / DZIKIR_TARGET) * 100} className="h-2 mb-1.5" />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs px-3"
                    onClick={() => logForDate('dhikr_count', (selectedLog?.dhikr_count ?? 0) + 10)}>+10</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs px-3"
                    onClick={() => logForDate('dhikr_count', (selectedLog?.dhikr_count ?? 0) + 33)}>+33</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs px-3"
                    onClick={() => logForDate('dhikr_count', (selectedLog?.dhikr_count ?? 0) + 100)}>+100</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Ibadah Log */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
           <Card className="rounded-xl border-0 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold">{isSelectedToday ? "Today's Ibadah" : format(selectedDate, 'd MMM yyyy')}</p>

              {/* Fasted */}
              <div className="flex items-center justify-between">
                <span className="text-sm">Fasted</span>
                <Switch checked={selectedLog?.fasted ?? false}
                  onCheckedChange={v => logForDate('fasted', v)} />
              </div>

              {/* Quran Pages */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> Quran Pages
                  </span>
                  <span className="text-xs font-bold">{selectedLog?.quran_pages ?? 0}/{settings.daily_quran_goal}</span>
                </div>
                <div className="flex gap-2">
                  <Progress value={((selectedLog?.quran_pages ?? 0) / settings.daily_quran_goal) * 100} className="h-2 flex-1" />
                  <Button size="sm" variant="outline" className="h-6 text-xs px-2"
                    onClick={() => logForDate('quran_pages', (selectedLog?.quran_pages ?? 0) + 1)}>+1</Button>
                </div>
              </div>

              {/* Tarawih with 8/20 selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Star className="h-3 w-3" /> Tarawih
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">{selectedLog?.tarawih_rakaat ?? 0}/{settings.tarawih_target} rakaat</span>
                  </div>
                </div>
                <div className="flex gap-2 mb-1.5">
                  <Button size="sm" variant={settings.tarawih_target === 8 ? 'default' : 'outline'} className="h-6 text-xs px-2"
                    onClick={async () => {
                      setTempSettings(p => ({ ...p, tarawih_target: 8 }));
                      setSettings(p => ({ ...p, tarawih_target: 8 }));
                      if (user) await supabase.from('ramadan_settings').upsert({ user_id: user.id, ...settings, tarawih_target: 8 }, { onConflict: 'user_id' });
                    }}>8 Rakaat</Button>
                  <Button size="sm" variant={settings.tarawih_target === 20 ? 'default' : 'outline'} className="h-6 text-xs px-2"
                    onClick={async () => {
                      setTempSettings(p => ({ ...p, tarawih_target: 20 }));
                      setSettings(p => ({ ...p, tarawih_target: 20 }));
                      if (user) await supabase.from('ramadan_settings').upsert({ user_id: user.id, ...settings, tarawih_target: 20 }, { onConflict: 'user_id' });
                    }}>20 Rakaat</Button>
                </div>
                <div className="flex gap-2">
                  <Progress value={((selectedLog?.tarawih_rakaat ?? 0) / settings.tarawih_target) * 100} className="h-2 flex-1" />
                  <Button size="sm" variant="outline" className="h-6 text-xs px-2"
                    onClick={() => logForDate('tarawih_rakaat', Math.min((selectedLog?.tarawih_rakaat ?? 0) + 2, settings.tarawih_target))}>+2</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Solat Sunnah Checklist */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold">Solat Sunnah</p>
              <div className="space-y-2">
                {SUNNAH_SOLAT_LIST.map(solat => {
                  const isChecked = (selectedLog?.sunnah_solat ?? []).includes(solat.id);
                  return (
                    <button
                      key={solat.id}
                      onClick={() => toggleSunnahSolat(solat.id)}
                      className={`flex items-center gap-3 w-full p-2.5 rounded-lg border transition-all ${
                        isChecked ? 'border-primary/30 bg-primary/5' : 'border-border'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        isChecked ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                      }`}>
                        {isChecked && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <span className={`text-sm ${isChecked ? 'line-through text-muted-foreground' : ''}`}>{solat.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                {(selectedLog?.sunnah_solat ?? []).length}/{SUNNAH_SOLAT_LIST.length} completed
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Laylatul Qadr Tracker */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-semibold mb-3 flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" /> Laylatul Qadr — Last 10 Nights
              </p>
              <div className="grid grid-cols-5 gap-2">
                {lqNights.map(night => {
                  const isCurrentNight = isRamadan && ramadanDay === night;
                  const isPast = isRamadan && ramadanDay > night;
                  return (
                    <div key={night}
                      className={`rounded-lg p-2.5 text-center border ${
                        isCurrentNight ? 'border-yellow-500 bg-yellow-500/10' :
                        isPast ? 'border-primary/30 bg-primary/5' :
                        'border-border'
                      }`}>
                      <p className="text-lg font-bold">{night}</p>
                      <p className="text-[9px] text-muted-foreground">Night</p>
                      {isCurrentNight && <p className="text-[8px] text-yellow-600 font-bold mt-0.5">TONIGHT</p>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Ramadan Summary */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-semibold mb-3 flex items-center gap-1">
                <Trophy className="h-4 w-4 text-primary" /> Ramadan Summary
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Days Fasted', value: summary.totalFasts, icon: '🌙' },
                  { label: 'Quran Pages', value: summary.totalQuran, icon: '📖' },
                  { label: 'Tarawih Nights', value: summary.totalTarawih, icon: '🕌' },
                  { label: 'Total Dzikir', value: summary.totalDhikr, icon: '📿' },
                  { label: 'Total Selawat', value: summary.totalSelawat, icon: '🤲' },
                  { label: 'Charity (RM)', value: summary.totalCharity, icon: '💝' },
                ].map(stat => (
                  <div key={stat.label} className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-lg">{stat.icon}</p>
                    <p className="text-lg font-bold">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </SubPageLayout>
  );
};

export default RamadanOptimizer;
