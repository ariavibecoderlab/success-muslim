import { useState, useEffect, useMemo } from 'react';
import { Moon, Sun, BookOpen, HandHeart, Star, Flame, Settings2, Calendar, Trophy } from 'lucide-react';
import SubPageLayout from '@/components/SubPageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { gregorianToHijri } from '@/lib/hijri';
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
}

const DEFAULT_SETTINGS: RamadanSettings = {
  suhoor_minutes_before_fajr: 30,
  daily_quran_goal: 4,
  daily_dhikr_goal: 100,
  tarawih_target: 8,
  suhoor_alarm: true,
  iftar_alarm: true,
};

const RamadanOptimizer = () => {
  const { user } = useAuth();
  const { settings: prayerSettings, loading: prayerLoading } = usePrayerSettings();
  const [settings, setSettings] = useState<RamadanSettings>(DEFAULT_SETTINGS);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState<RamadanSettings>(DEFAULT_SETTINGS);
  const [fajrTime, setFajrTime] = useState('05:30');
  const [maghribTime, setMaghribTime] = useState('19:15');
  const today = new Date().toISOString().split('T')[0];
  const hijri = gregorianToHijri(new Date());
  const isRamadan = hijri.month === 9;
  const ramadanDay = isRamadan ? hijri.day : 0;
  const isLastTenNights = isRamadan && hijri.day >= 21;

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
      if (l) setLogs(l as DailyLog[]);
    };
    load();
  }, [user]);

  const todayLog = logs.find(l => l.date === today);

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

  const logToday = async (field: string, value: any) => {
    if (!user) return;
    if (todayLog) {
      await supabase.from('ramadan_daily_log').update({ [field]: value }).eq('id', todayLog.id);
      setLogs(prev => prev.map(l => l.id === todayLog.id ? { ...l, [field]: value } : l));
    } else {
      const entry = { user_id: user.id, date: today, [field]: value };
      const { data } = await supabase.from('ramadan_daily_log').insert(entry).select().single();
      if (data) setLogs(prev => [data as DailyLog, ...prev]);
    }
    toast.success('Updated!');
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
    return { totalFasts, totalQuran, totalTarawih, totalDhikr, totalCharity };
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
        {/* Status Hero */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={`border-primary/20 ${isRamadan ? 'bg-gradient-to-br from-primary/15 via-primary/5 to-transparent' : 'bg-gradient-to-br from-muted/50 to-transparent'}`}>
            <CardContent className="p-5 text-center">
              {isRamadan ? (
                <>
                  <Moon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-xs text-primary uppercase tracking-wider font-semibold">Ramadan Mubarak</p>
                  <p className="text-3xl font-bold mt-1">Day {ramadanDay} of 30</p>
                  <Progress value={(ramadanDay / 30) * 100} className="h-1.5 mt-2" />
                  {isLastTenNights && (
                    <div className="mt-3 bg-primary/10 rounded-lg p-2">
                      <p className="text-xs font-bold text-primary">🌟 Last 10 Nights — Seek Laylatul Qadr!</p>
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
            <Card>
              <CardContent className="p-4 text-center">
                <Moon className="h-5 w-5 text-indigo-400 mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground uppercase">Suhoor</p>
                <p className="text-lg font-bold">{suhoorTime}</p>
                <p className="text-[9px] text-muted-foreground">Fajr: {fajrTime}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Sun className="h-5 w-5 text-orange-400 mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground uppercase">Iftar</p>
                <p className="text-lg font-bold">{maghribTime}</p>
                <p className="text-[9px] text-primary font-medium">{iftarCountdown}</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Daily Ibadah Log */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold">Today's Ibadah</p>

              {/* Fasted */}
              <div className="flex items-center justify-between">
                <span className="text-sm">Fasted Today</span>
                <Switch checked={todayLog?.fasted ?? false}
                  onCheckedChange={v => logToday('fasted', v)} />
              </div>

              {/* Quran Pages */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> Quran Pages
                  </span>
                  <span className="text-xs font-bold">{todayLog?.quran_pages ?? 0}/{settings.daily_quran_goal}</span>
                </div>
                <div className="flex gap-2">
                  <Progress value={((todayLog?.quran_pages ?? 0) / settings.daily_quran_goal) * 100} className="h-2 flex-1" />
                  <Button size="sm" variant="outline" className="h-6 text-xs px-2"
                    onClick={() => logToday('quran_pages', (todayLog?.quran_pages ?? 0) + 1)}>+1</Button>
                </div>
              </div>

              {/* Tarawih */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Star className="h-3 w-3" /> Tarawih
                  </span>
                  <span className="text-xs font-bold">{todayLog?.tarawih_rakaat ?? 0}/{settings.tarawih_target} rakaat</span>
                </div>
                <div className="flex gap-2">
                  <Progress value={((todayLog?.tarawih_rakaat ?? 0) / settings.tarawih_target) * 100} className="h-2 flex-1" />
                  <Button size="sm" variant="outline" className="h-6 text-xs px-2"
                    onClick={() => logToday('tarawih_rakaat', Math.min((todayLog?.tarawih_rakaat ?? 0) + 2, settings.tarawih_target))}>+2</Button>
                </div>
              </div>

              {/* Dhikr */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <HandHeart className="h-3 w-3" /> Dhikr
                  </span>
                  <span className="text-xs font-bold">{todayLog?.dhikr_count ?? 0}/{settings.daily_dhikr_goal}</span>
                </div>
                <div className="flex gap-2">
                  <Progress value={((todayLog?.dhikr_count ?? 0) / settings.daily_dhikr_goal) * 100} className="h-2 flex-1" />
                  <Button size="sm" variant="outline" className="h-6 text-xs px-2"
                    onClick={() => logToday('dhikr_count', (todayLog?.dhikr_count ?? 0) + 33)}>+33</Button>
                </div>
              </div>
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
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Days Fasted', value: summary.totalFasts, icon: '🌙' },
                  { label: 'Quran Pages', value: summary.totalQuran, icon: '📖' },
                  { label: 'Tarawih Nights', value: summary.totalTarawih, icon: '🕌' },
                  { label: 'Total Dhikr', value: summary.totalDhikr, icon: '📿' },
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
