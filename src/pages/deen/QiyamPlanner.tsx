import { useState, useEffect, useMemo } from 'react';
import { Moon, Flame, Clock, Settings2, Check, Plus } from 'lucide-react';
import SubPageLayout from '@/components/SubPageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { usePrayerSettings } from '@/hooks/usePrayerSettings';
import { fetchPrayerTimes } from '@/lib/prayer-times';

const DEEN_SIBLINGS = [
  { path: '/deen/prayer-times', label: 'Prayer Times' },
  { path: '/deen/quran', label: 'Quran' },
  { path: '/deen/dhikr', label: 'Dhikr' },
  { path: '/deen/sunnah', label: 'Sunnah' },
  { path: '/deen/fasting', label: 'Fasting' },
  { path: '/deen/qiyam', label: 'Qiyam' },
  { path: '/deen/ramadan', label: 'Ramadan' },
  { path: '/deen/hajj', label: 'Hajj/Umrah' },
];

interface QiyamSettings {
  default_sleep_time: string;
  default_wake_time: string;
  alarm_enabled: boolean;
  alarm_minutes_before_fajr: number;
}

interface QiyamEntry {
  id: string;
  date: string;
  performed: boolean;
  notes: string | null;
}

const DEFAULT_SETTINGS: QiyamSettings = {
  default_sleep_time: '23:00',
  default_wake_time: '05:00',
  alarm_enabled: false,
  alarm_minutes_before_fajr: 60,
};

function calcTahajjudWindow(sleepTime: string, fajrTime: string): { start: string; end: string } {
  const [sh, sm] = sleepTime.split(':').map(Number);
  const [fh, fm] = fajrTime.split(':').map(Number);
  let sleepMin = sh * 60 + sm;
  let fajrMin = fh * 60 + fm;
  if (fajrMin <= sleepMin) fajrMin += 24 * 60;
  const nightDuration = fajrMin - sleepMin;
  const lastThirdStart = sleepMin + Math.round((nightDuration * 2) / 3);
  const startH = Math.floor(lastThirdStart / 60) % 24;
  const startM = lastThirdStart % 60;
  return {
    start: `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`,
    end: `${String(fh).padStart(2, '0')}:${String(fm).padStart(2, '0')}`,
  };
}

const QiyamPlanner = () => {
  const { user } = useAuth();
  const { settings: prayerSettings, loading: prayerLoading } = usePrayerSettings();
  const [settings, setSettings] = useState<QiyamSettings>(DEFAULT_SETTINGS);
  const [logs, setLogs] = useState<QiyamEntry[]>([]);
  const [fajrTime, setFajrTime] = useState('05:30');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState<QiyamSettings>(DEFAULT_SETTINGS);
  const today = new Date().toISOString().split('T')[0];

  // Load Fajr time
  useEffect(() => {
    if (prayerLoading) return;
    fetchPrayerTimes(prayerSettings).then(data => {
      if (data) {
        const fajr = data.timings.find(t => t.key === 'Fajr');
        if (fajr) setFajrTime(fajr.time);
      }
    });
  }, [prayerSettings, prayerLoading]);

  // Load settings + logs
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: s } = await supabase
        .from('qiyam_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (s) {
        const loaded = {
          default_sleep_time: s.default_sleep_time,
          default_wake_time: s.default_wake_time,
          alarm_enabled: s.alarm_enabled,
          alarm_minutes_before_fajr: s.alarm_minutes_before_fajr,
        };
        setSettings(loaded);
        setTempSettings(loaded);
      }
      const { data: l } = await supabase
        .from('qiyam_log')
        .select('id, date, performed, notes')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(90);
      if (l) setLogs(l);
    };
    load();
  }, [user]);

  const tahajjud = useMemo(
    () => calcTahajjudWindow(settings.default_sleep_time, fajrTime),
    [settings.default_sleep_time, fajrTime]
  );

  const todayLog = logs.find(l => l.date === today);
  const streak = useMemo(() => {
    let count = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      const key = d.toISOString().split('T')[0];
      const entry = logs.find(l => l.date === key);
      if (entry?.performed) count++;
      else if (i > 0) break;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }, [logs]);

  const last30 = useMemo(() => {
    let count = 0;
    const d = new Date();
    for (let i = 0; i < 30; i++) {
      const key = d.toISOString().split('T')[0];
      if (logs.find(l => l.date === key && l.performed)) count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }, [logs]);

  const logQiyam = async () => {
    if (!user) return;
    if (todayLog) {
      await supabase.from('qiyam_log').update({ performed: !todayLog.performed }).eq('id', todayLog.id);
      setLogs(prev => prev.map(l => l.id === todayLog.id ? { ...l, performed: !l.performed } : l));
    } else {
      const { data } = await supabase
        .from('qiyam_log')
        .insert({ user_id: user.id, date: today, performed: true, sleep_time: settings.default_sleep_time, wake_time: settings.default_wake_time, tahajjud_start: tahajjud.start })
        .select()
        .single();
      if (data) setLogs(prev => [data, ...prev]);
    }
    toast.success(todayLog?.performed ? 'Unmarked qiyam' : 'Qiyam logged! 🌙');
  };

  const saveSettings = async () => {
    if (!user) return;
    await supabase.from('qiyam_settings').upsert({
      user_id: user.id,
      ...tempSettings,
    }, { onConflict: 'user_id' });
    setSettings(tempSettings);
    setSettingsOpen(false);
    toast.success('Settings saved');
  };

  // Build 7-day dots
  const weekDots = useMemo(() => {
    const dots = [];
    const d = new Date();
    for (let i = 6; i >= 0; i--) {
      const dd = new Date(d);
      dd.setDate(dd.getDate() - i);
      const key = dd.toISOString().split('T')[0];
      const entry = logs.find(l => l.date === key);
      dots.push({
        day: dd.toLocaleDateString('en', { weekday: 'narrow' }),
        performed: entry?.performed ?? false,
        isToday: key === today,
      });
    }
    return dots;
  }, [logs, today]);

  return (
    <SubPageLayout title="Qiyam Planner" backTo="/deen" siblingRoutes={DEEN_SIBLINGS} currentPath="/deen/qiyam">
      <div className="space-y-5">
        {/* Tahajjud Window Hero */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardContent className="p-5 text-center">
              <Moon className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Optimal Tahajjud Window</p>
              <p className="text-3xl font-bold text-primary mt-1">{tahajjud.start} – {tahajjud.end}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Last third of the night · Fajr at {fajrTime}
              </p>

              <Button
                onClick={logQiyam}
                variant={todayLog?.performed ? 'secondary' : 'default'}
                className="mt-4 w-full"
              >
                {todayLog?.performed ? (
                  <><Check className="h-4 w-4 mr-2" /> Qiyam Performed Tonight</>
                ) : (
                  <><Plus className="h-4 w-4 mr-2" /> Log Tonight's Qiyam</>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Streak & Stats */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <Flame className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                <p className="text-2xl font-bold">{streak}</p>
                <p className="text-[10px] text-muted-foreground">Night Streak</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Moon className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-2xl font-bold">{last30}/30</p>
                <p className="text-[10px] text-muted-foreground">This Month</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* 7-Day Dots */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-3">Last 7 Nights</p>
              <div className="flex items-center justify-between">
                {weekDots.map((dot, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      dot.performed ? 'bg-primary text-primary-foreground' :
                      dot.isToday ? 'border-2 border-primary text-primary' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {dot.performed ? '🌙' : dot.day}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Schedule Info */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Your Schedule</p>
                <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm"><Settings2 className="h-4 w-4" /></Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Qiyam Settings</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Sleep Time</Label>
                          <Input type="time" value={tempSettings.default_sleep_time}
                            onChange={e => setTempSettings(p => ({ ...p, default_sleep_time: e.target.value }))} />
                        </div>
                        <div>
                          <Label className="text-xs">Wake Time</Label>
                          <Input type="time" value={tempSettings.default_wake_time}
                            onChange={e => setTempSettings(p => ({ ...p, default_wake_time: e.target.value }))} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Qiyam Alarm</Label>
                        <Switch checked={tempSettings.alarm_enabled}
                          onCheckedChange={v => setTempSettings(p => ({ ...p, alarm_enabled: v }))} />
                      </div>
                      {tempSettings.alarm_enabled && (
                        <div>
                          <Label className="text-xs">Minutes before Fajr</Label>
                          <Input type="number" min={15} max={120} value={tempSettings.alarm_minutes_before_fajr}
                            onChange={e => setTempSettings(p => ({ ...p, alarm_minutes_before_fajr: parseInt(e.target.value) || 60 }))} />
                        </div>
                      )}
                      <Button onClick={saveSettings} className="w-full">Save Settings</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted/50 rounded-lg p-2.5">
                  <p className="text-[10px] text-muted-foreground">Sleep</p>
                  <p className="text-sm font-bold">{settings.default_sleep_time}</p>
                </div>
                <div className="bg-primary/10 rounded-lg p-2.5">
                  <p className="text-[10px] text-primary">Tahajjud</p>
                  <p className="text-sm font-bold text-primary">{tahajjud.start}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2.5">
                  <p className="text-[10px] text-muted-foreground">Fajr</p>
                  <p className="text-sm font-bold">{fajrTime}</p>
                </div>
              </div>
              {settings.alarm_enabled && (
                <p className="text-xs text-muted-foreground text-center">
                  🔔 Alarm set {settings.alarm_minutes_before_fajr} min before Fajr
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Logs */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-3">Recent Nights</p>
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No qiyam logged yet. Start tonight!</p>
              ) : (
                <div className="space-y-2">
                  {logs.slice(0, 14).map(entry => (
                    <div key={entry.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                      <span className="text-sm">{new Date(entry.date + 'T00:00:00').toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                      <span className={`text-xs font-medium ${entry.performed ? 'text-primary' : 'text-muted-foreground'}`}>
                        {entry.performed ? '🌙 Performed' : 'Missed'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </SubPageLayout>
  );
};

export default QiyamPlanner;
