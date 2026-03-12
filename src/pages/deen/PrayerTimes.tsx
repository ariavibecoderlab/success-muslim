import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  MapPin,
  RefreshCw,
  Settings2,
  Building2,
  Bell,
  BellOff,
  Vibrate,
  Navigation,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  Volume2,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  Circle,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import SubPageLayout from "@/components/SubPageLayout";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { usePrayerSettings } from "@/hooks/usePrayerSettings";
import {
  usePrayerNotifications,
  getNotificationPermission,
  requestNotificationPermission,
} from "@/hooks/usePrayerNotifications";
import { formatHijriDate } from "@/lib/hijri";
import { useSalahLog, useSalahMutation, useTodaySalahCount } from "@/hooks/useSalahQuery";
import { getTodayKey } from "@/lib/calculations";
import { SALAH_NAMES, type SalahName } from "@/lib/salah-storage";
import {
  fetchPrayerTimes,
  getCurrentPrayerIndex,
  getNextPrayerIndex,
  formatPrayerTime,
  getEffectiveTime,
  getCountdownToNextPrayer,
  detectLocation,
  reverseGeocode,
  CALCULATION_METHODS,
  ADHAN_OPTIONS,
  type PrayerTimesData,
  type PrayerTime as PrayerTimeType,
  type AdhanConfig,
} from "@/lib/prayer-times";
import { toast } from "sonner";

const IMAN_SIBLINGS = [
  { path: "/iman/dhikr", label: "Dhikr" },
  { path: "/iman/sunnah", label: "Sunnah" },
  { path: "/iman/quran", label: "Quran" },
  { path: "/iman/prayer-times", label: "Prayer" },
  { path: "/iman/zakat", label: "Zakat" },
];

const PRAYER_ICONS: Record<string, React.ReactNode> = {
  Fajr: <Sunrise className="h-4 w-4" />,
  Dhuhr: <Sun className="h-4 w-4" />,
  Asr: <Sun className="h-4 w-4" />,
  Maghrib: <Sunset className="h-4 w-4" />,
  Isha: <Moon className="h-4 w-4" />,
};

const PRAYER_KEY_TO_SALAH: Record<string, SalahName> = {
  Fajr: "Fajr",
  Dhuhr: "Dhuhr",
  Asr: "Asr",
  Maghrib: "Maghrib",
  Isha: "Isha",
};

const PRE_REMINDER_OPTIONS = [0, 5, 10, 15, 20, 30];

function getMinutesUntil(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
  return Math.round((target.getTime() - now.getTime()) / 60000);
}

const PrayerTimes = () => {
  const { settings, saveSettings, loading: settingsLoading } = usePrayerSettings();
  const [data, setData] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState("");
  const [detectingGps, setDetectingGps] = useState(false);
  const [settingsTab, setSettingsTab] = useState("location");
  const [notifPermission, setNotifPermission] = useState<string>(getNotificationPermission);

  const todayKey = getTodayKey();
  const { data: salahLog } = useSalahLog(todayKey);
  const salahMutation = useSalahMutation();
  const salahCount = useTodaySalahCount();

  usePrayerNotifications(data?.timings ?? null, settings);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchPrayerTimes(settings);
    setData(result);
    setLoading(false);
  }, [settings]);

  useEffect(() => {
    if (!settingsLoading) load();
  }, [settingsLoading, load]);

  const currentIdx = data ? getCurrentPrayerIndex(data.timings) : -1;
  const nextIdx = data ? getNextPrayerIndex(data.timings) : 0;

  useEffect(() => {
    if (!data) return;
    const tick = () => setCountdown(getCountdownToNextPrayer(data.timings, nextIdx));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data, nextIdx]);

  const handleDetectGps = async () => {
    setDetectingGps(true);
    const loc = await detectLocation();
    if (!loc) {
      toast.error("Unable to detect location. Please enable GPS or enter manually.");
      setDetectingGps(false);
      return;
    }
    const geo = await reverseGeocode(loc.lat, loc.lng);
    await saveSettings({
      latitude: loc.lat,
      longitude: loc.lng,
      city: geo?.city || settings.city,
      country: geo?.country || settings.country,
      location_method: "gps",
    });
    toast.success(`Location detected: ${geo?.city || "Unknown"}`);
    setDetectingGps(false);
  };

  const handleToggleSalah = (prayerKey: string) => {
    const salahName = PRAYER_KEY_TO_SALAH[prayerKey];
    if (!salahName || !salahLog) return;
    const current = salahLog.prayers[salahName].status;
    const newStatus = current ? null : "ontime" as const;
    salahMutation.mutate({ prayer: salahName, status: newStatus, date: todayKey });
  };

  const hijriDate = data?.hijriDate || formatHijriDate(new Date());
  const nextPrayer = data?.timings[nextIdx];
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const methodName = CALCULATION_METHODS.find((m) => m.id === settings.calculation_method)?.name || "MWL";

  // Progress ring
  const prayedCount = salahCount.logged;
  const totalPrayers = 5;
  const progressPct = (prayedCount / totalPrayers) * 100;
  const circumference = 2 * Math.PI * 36;
  const strokeOffset = circumference - (progressPct / 100) * circumference;

  return (
    <SubPageLayout title="Prayer Times" backTo="/iman" siblingRoutes={IMAN_SIBLINGS} currentPath="/iman/prayer-times">
      <div className="space-y-4">
        {/* Notification Permission Banner */}
        {notifPermission === "default" && (
          <Card className="border-0 rounded-xl shadow-sm bg-primary/5">
            <CardContent className="p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Bell className="h-4 w-4 text-primary shrink-0" />
                <p className="text-xs text-foreground">Enable adhan notifications?</p>
              </div>
              <Button
                size="sm"
                variant="default"
                className="shrink-0 text-xs h-7"
                onClick={async () => {
                  const result = await requestNotificationPermission();
                  setNotifPermission(result);
                  if (result === "granted") toast.success("Adhan notifications enabled!");
                  else if (result === "denied") toast.error("Notifications blocked. Enable in browser settings.");
                }}
              >
                Enable
              </Button>
            </CardContent>
          </Card>
        )}
        {notifPermission === "denied" && (
          <Card className="border-0 rounded-xl shadow-sm bg-destructive/5">
            <CardContent className="p-3 flex items-center gap-2">
              <BellOff className="h-4 w-4 text-destructive shrink-0" />
              <p className="text-[11px] text-muted-foreground">
                Notifications blocked. Enable in your browser settings to receive adhan alerts.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Date Header */}
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-foreground">{dateStr}</h2>
          {hijriDate && <p className="text-xs text-muted-foreground">{hijriDate}</p>}
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge variant="secondary" className="text-[10px] font-medium gap-1">
              <MapPin className="h-2.5 w-2.5" />
              {settings.city}
            </Badge>
            <Badge variant="outline" className="text-[10px] font-medium">
              {methodName.length > 20 ? methodName.substring(0, 18) + "…" : methodName}
            </Badge>
            <div className="flex gap-0.5">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={load}>
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Settings2 className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Prayer Settings</DialogTitle>
                  </DialogHeader>
                  <Tabs value={settingsTab} onValueChange={setSettingsTab}>
                    <TabsList className="grid grid-cols-4 w-full">
                      <TabsTrigger value="location">Location</TabsTrigger>
                      <TabsTrigger value="method">Method</TabsTrigger>
                      <TabsTrigger value="adhan">Adhan</TabsTrigger>
                      <TabsTrigger value="mosque">Mosque</TabsTrigger>
                    </TabsList>

                    {/* LOCATION TAB */}
                    <TabsContent value="location" className="space-y-4 mt-4">
                      <Button onClick={handleDetectGps} disabled={detectingGps} className="w-full" variant="outline">
                        <Navigation className="h-4 w-4 mr-2" />
                        {detectingGps ? "Detecting..." : "Auto-detect Location (GPS)"}
                      </Button>
                      <Separator />
                      <div className="space-y-3">
                        <p className="text-xs text-muted-foreground font-medium">Or enter manually:</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">City</Label>
                            <Input
                              value={settings.city}
                              onChange={(e) =>
                                saveSettings({
                                  city: e.target.value,
                                  location_method: "manual",
                                  latitude: undefined,
                                  longitude: undefined,
                                })
                              }
                              placeholder="Kuala Lumpur"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Country</Label>
                            <Input
                              value={settings.country}
                              onChange={(e) => saveSettings({ country: e.target.value, location_method: "manual" })}
                              placeholder="Malaysia"
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* METHOD TAB */}
                    <TabsContent value="method" className="space-y-4 mt-4">
                      <div>
                        <Label className="text-xs font-medium">Calculation Method</Label>
                        <Select
                          value={String(settings.calculation_method)}
                          onValueChange={(v) => saveSettings({ calculation_method: Number(v) })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-64">
                            {CALCULATION_METHODS.map((m) => (
                              <SelectItem key={m.id} value={String(m.id)}>
                                <div>
                                  <span className="text-sm">{m.name}</span>
                                  <span className="text-[10px] text-muted-foreground ml-2">({m.region})</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs font-medium">Madhab (Asr Calculation)</Label>
                        <Select
                          value={settings.madhab}
                          onValueChange={(v) => saveSettings({ madhab: v as "shafi" | "hanafi" })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="shafi">Shafi'i / Maliki / Hanbali</SelectItem>
                            <SelectItem value="hanafi">Hanafi</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {settings.madhab === "hanafi"
                            ? "Asr begins when shadow is 2× object length"
                            : "Asr begins when shadow equals object length"}
                        </p>
                      </div>
                    </TabsContent>

                    {/* ADHAN TAB */}
                    <TabsContent value="adhan" className="space-y-4 mt-4">
                      {["fajr", "dhuhr", "asr", "maghrib", "isha"].map((key) => {
                        const config: AdhanConfig = { mode: "full", audio: "makkah", preReminder: 0, enabled: true, days: [0,1,2,3,4,5,6], ...settings.adhan_settings[key] };
                        const updateAdhan = (patch: Partial<AdhanConfig>) => {
                          saveSettings({
                            adhan_settings: {
                              ...settings.adhan_settings,
                              [key]: { ...config, ...patch } as AdhanConfig,
                            },
                          });
                        };
                        const displayName = key.charAt(0).toUpperCase() + key.slice(1);
                        return (
                          <Card key={key}>
                            <CardContent className="p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold">{displayName}</span>
                                <div className="flex gap-1">
                                  {(["full", "vibrate", "silent"] as const).map((mode) => (
                                    <Button
                                      key={mode}
                                      variant={config.mode === mode ? "default" : "outline"}
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => updateAdhan({ mode })}
                                    >
                                      {mode === "full" && <Volume2 className="h-3.5 w-3.5" />}
                                      {mode === "vibrate" && <Vibrate className="h-3.5 w-3.5" />}
                                      {mode === "silent" && <BellOff className="h-3.5 w-3.5" />}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                              {config.mode === "full" && (
                                <Select value={config.audio} onValueChange={(v) => updateAdhan({ audio: v })}>
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ADHAN_OPTIONS.map((a) => (
                                      <SelectItem key={a.id} value={a.id}>
                                        {a.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] text-muted-foreground">Pre-reminder</span>
                                <Select
                                  value={String(config.preReminder)}
                                  onValueChange={(v) => updateAdhan({ preReminder: Number(v) })}
                                >
                                  <SelectTrigger className="h-7 w-24 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {PRE_REMINDER_OPTIONS.map((m) => (
                                      <SelectItem key={m} value={String(m)}>
                                        {m === 0 ? "Off" : `${m} min`}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </TabsContent>

                    {/* MOSQUE TAB */}
                    <TabsContent value="mosque" className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-sm font-medium">Mosque Times</p>
                            <p className="text-[10px] text-muted-foreground">Override with local mosque schedule</p>
                          </div>
                        </div>
                        <Switch checked={settings.mosque_enabled} onCheckedChange={(v) => saveSettings({ mosque_enabled: v })} />
                      </div>
                      {settings.mosque_enabled && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Mosque Prayer Times (24h format)</p>
                          {(["fajr", "dhuhr", "asr", "maghrib", "isha"] as const).map((key) => {
                            const field = `mosque_${key}` as keyof typeof settings;
                            return (
                              <div key={key} className="flex items-center gap-3">
                                <span className="text-xs w-16 capitalize">{key}</span>
                                <Input
                                  type="time"
                                  className="h-8 text-xs flex-1"
                                  value={(settings[field] as string) || ""}
                                  onChange={(e) => saveSettings({ [field]: e.target.value || null })}
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Hero Card — Split Layout */}
        {data && !loading && nextPrayer && (
          <Card className="bg-gradient-to-br from-emerald-700 to-teal-800 text-white border-0 rounded-xl shadow-md overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                {/* Left — Next Prayer Info */}
                <div className="space-y-1 flex-1">
                  <p className="text-[10px] text-white/60 uppercase tracking-[0.15em] font-medium">Next Prayer</p>
                  <div className="flex items-center gap-2">
                    <div className="text-white/80">{PRAYER_ICONS[nextPrayer.key]}</div>
                    <p className="text-xl font-bold">{nextPrayer.name}</p>
                  </div>
                  <p className="text-2xl font-bold tabular-nums tracking-tight">
                    {formatPrayerTime(getEffectiveTime(nextPrayer))}
                  </p>
                  <p className="text-xs text-white/70 tabular-nums">{countdown}</p>
                  {nextPrayer.mosqueTime && (
                    <span className="inline-flex items-center text-[9px] bg-white/10 px-1.5 py-0.5 rounded-full mt-1">
                      <Building2 className="h-2.5 w-2.5 mr-0.5" />
                      Mosque
                    </span>
                  )}
                </div>

                {/* Right — Progress Ring */}
                <div className="relative flex items-center justify-center">
                  <svg width="88" height="88" viewBox="0 0 88 88">
                    <circle
                      cx="44"
                      cy="44"
                      r="36"
                      fill="none"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="5"
                    />
                    <circle
                      cx="44"
                      cy="44"
                      r="36"
                      fill="none"
                      stroke="rgba(255,255,255,0.9)"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeOffset}
                      transform="rotate(-90 44 44)"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold">{prayedCount}/{totalPrayers}</span>
                    <span className="text-[9px] text-white/60">prayed</span>
                  </div>
                </div>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-1.5 mt-3">
                {data.timings.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-6 rounded-full transition-all ${
                      i <= currentIdx ? "bg-white" : i === nextIdx ? "bg-white/40" : "bg-white/15"
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Prayer List — Checklist Style */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Today's Schedule</h2>
            <span className="text-[10px] text-muted-foreground">
              {settings.madhab === "hanafi" ? "Hanafi" : "Shafi'i"}
            </span>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : data ? (
            <div className="space-y-2">
              {data.timings.map((prayer, i) => {
                const isCurrent = i === currentIdx;
                const isNext = i === nextIdx;
                const isPast = i < nextIdx && currentIdx >= 0;
                const effectiveTime = getEffectiveTime(prayer);
                const adhanMode = settings.adhan_settings[prayer.key.toLowerCase()]?.mode;
                const salahName = PRAYER_KEY_TO_SALAH[prayer.key];
                const salahStatus = salahLog?.prayers[salahName]?.status;
                const isLogged = !!salahStatus;
                const minutesUntil = getMinutesUntil(effectiveTime);

                return (
                  <Card
                    key={prayer.key}
                    className={`rounded-xl border shadow-sm transition-all duration-200 ${
                      isCurrent
                        ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
                        : "border-border"
                    }`}
                  >
                    <CardContent className="p-3.5 flex items-center gap-3">
                      {/* Check Circle */}
                      <button
                        onClick={() => handleToggleSalah(prayer.key)}
                        className="shrink-0 transition-transform active:scale-90"
                      >
                        {isLogged ? (
                          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                        ) : (
                          <Circle className={`h-6 w-6 ${isPast ? "text-muted-foreground/40" : "text-muted-foreground/25"}`} />
                        )}
                      </button>

                      {/* Prayer Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${isCurrent ? "text-emerald-700 dark:text-emerald-400" : isLogged ? "text-muted-foreground line-through" : "text-foreground"}`}>
                            {prayer.name}
                          </span>
                          {isCurrent && (
                            <Badge className="text-[9px] h-4 px-1.5 bg-emerald-500 text-white border-0 font-medium">
                              Now
                            </Badge>
                          )}
                          {isNext && !isCurrent && minutesUntil > 0 && minutesUntil <= 60 && (
                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 font-medium">
                              in {minutesUntil}m
                            </Badge>
                          )}
                          {prayer.mosqueTime && (
                            <span className="text-[9px] bg-primary/10 text-primary px-1 py-0.5 rounded">Mosque</span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">{prayer.key}</p>
                      </div>

                      {/* Time + Adhan */}
                      <div className="text-right shrink-0 flex items-center gap-2">
                        <div>
                          <p className={`text-sm font-bold tabular-nums ${isCurrent ? "text-emerald-700 dark:text-emerald-400" : ""}`}>
                            {formatPrayerTime(effectiveTime)}
                          </p>
                          {prayer.mosqueTime && prayer.mosqueTime !== prayer.time && (
                            <p className="text-[9px] text-muted-foreground line-through">
                              {formatPrayerTime(prayer.time)}
                            </p>
                          )}
                        </div>
                        {adhanMode === "full" && <Bell className="h-3 w-3 text-muted-foreground/40" />}
                        {adhanMode === "vibrate" && <Vibrate className="h-3 w-3 text-muted-foreground/40" />}
                        {adhanMode === "silent" && <BellOff className="h-3 w-3 text-muted-foreground/40" />}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="rounded-xl border-0 shadow-sm">
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                Unable to fetch prayer times. Check your location and try again.
              </CardContent>
            </Card>
          )}
        </div>

        {/* Salah Log Link */}
        <Link to="/iman/salah-log" className="flex items-center justify-center gap-2 py-2.5 text-primary hover:underline transition-colors">
          <BookOpen className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">View salah history</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>

        {/* Source note */}
        <p className="text-[10px] text-muted-foreground text-center">
          Source: {data?.source === "jakim" ? "JAKIM e-Solat" : "Aladhan API"} · Times may vary ±1-2 min
        </p>
      </div>
    </SubPageLayout>
  );
};

export default PrayerTimes;
