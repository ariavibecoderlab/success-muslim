import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  MapPin,
  RefreshCw,
  ChevronDown,
  Settings2,
  Building2,
  Bell,
  BellOff,
  Vibrate,
  Navigation,
  Globe,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  Volume2,
  ChevronRight,
  Check,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import SubPageLayout from "@/components/SubPageLayout";
import { usePrayerSettings } from "@/hooks/usePrayerSettings";
import {
  usePrayerNotifications,
  getNotificationPermission,
  requestNotificationPermission,
} from "@/hooks/usePrayerNotifications";
import { formatHijriDate } from "@/lib/hijri";
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

const PRE_REMINDER_OPTIONS = [0, 5, 10, 15, 20, 30];

const PrayerTimes = () => {
  const { settings, saveSettings, loading: settingsLoading } = usePrayerSettings();
  const [data, setData] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState("");
  const [detectingGps, setDetectingGps] = useState(false);
  const [settingsTab, setSettingsTab] = useState("location");
  const [notifPermission, setNotifPermission] = useState<string>(getNotificationPermission);

  // Schedule prayer notifications
  usePrayerNotifications(data?.timings ?? null, settings);

  // Load prayer times whenever settings change
  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchPrayerTimes(settings);
    setData(result);
    setLoading(false);
  }, [settings]);

  useEffect(() => {
    if (!settingsLoading) load();
  }, [settingsLoading, load]);

  // Countdown
  const currentIdx = data ? getCurrentPrayerIndex(data.timings) : -1;
  const nextIdx = data ? getNextPrayerIndex(data.timings) : 0;

  useEffect(() => {
    if (!data) return;
    const tick = () => setCountdown(getCountdownToNextPrayer(data.timings, nextIdx));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data, nextIdx]);

  // GPS detection
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

  const hijriDate = formatHijriDate(new Date());
  const nextPrayer = data?.timings[nextIdx];
  const prayerProgress = data ? ((currentIdx + 1) / data.timings.length) * 100 : 0;

  return (
    <SubPageLayout title="Prayer Times" backTo="/iman" siblingRoutes={IMAN_SIBLINGS} currentPath="/iman/prayer-times">
      <div className="space-y-4">
        {/* Hijri Date Banner */}
        {/* <div className="text-center py-2">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Today</p>
          <p className="text-sm font-semibold text-primary">{hijriDate}</p>
          {data?.hijriDate && data.hijriDate !== hijriDate && (
            <p className="text-[10px] text-muted-foreground mt-0.5">{data.hijriDate}</p>
          )}
        </div> */}

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

        {/* Location + Settings Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-medium truncate">
              {settings.city}, {settings.country}
            </span>
            {settings.location_method === "gps" && <Navigation className="h-3 w-3 text-muted-foreground" />}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={load}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Prayer Settings</DialogTitle>
                </DialogHeader>
                <Tabs value={settingsTab} onValueChange={setSettingsTab}>
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="location">Location</TabsTrigger>
                    <TabsTrigger value="method">Method</TabsTrigger>
                    <TabsTrigger value="adhan">Adhan</TabsTrigger>
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
                      const config = settings.adhan_settings[key] || { mode: "full", audio: "makkah", preReminder: 0 };
                      const updateAdhan = (patch: Partial<AdhanConfig>) => {
                        saveSettings({
                          adhan_settings: {
                            ...settings.adhan_settings,
                            [key]: { ...config, ...patch },
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
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Next Prayer Hero Card */}
        {data && !loading && nextPrayer && (
          <Card className="bg-gradient-to-br from-orange-600 to-orange-700 text-white border-0 rounded-xl shadow-md overflow-hidden relative">
            <CardContent className="p-6 text-center space-y-2 relative z-10">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium">Next Prayer</p>
              <div className="flex items-center justify-center gap-2">
                {PRAYER_ICONS[nextPrayer.key]}
                <p className="text-2xl font-bold text-primary">{nextPrayer.name}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatPrayerTime(getEffectiveTime(nextPrayer))}
                {nextPrayer.mosqueTime && (
                  <span className="ml-2 text-[10px] bg-primary/10 px-1.5 py-0.5 rounded-full">
                    <Building2 className="h-2.5 w-2.5 inline mr-0.5" />
                    Mosque
                  </span>
                )}
              </p>
              <p className="text-xl font-bold tabular-nums tracking-tight">{countdown}</p>
              {/* Prayer progress */}
              <div className="flex justify-center gap-1.5 mt-2">
                {data.timings.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-6 rounded-full transition-all ${
                      i <= currentIdx ? "bg-primary" : i === nextIdx ? "bg-primary/40" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mosque Override Toggle */}
        <Card>
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Mosque Times</p>
                <p className="text-[10px] text-muted-foreground">Override with local mosque schedule</p>
              </div>
            </div>
            <Switch checked={settings.mosque_enabled} onCheckedChange={(v) => saveSettings({ mosque_enabled: v })} />
          </CardContent>
        </Card>

        {/* Mosque Time Inputs */}
        {settings.mosque_enabled && (
          <Card>
            <CardContent className="p-3 space-y-2">
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
            </CardContent>
          </Card>
        )}

        {/* Prayer Times List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Today's Schedule</h2>
            <span className="text-[10px] text-muted-foreground">
              {CALCULATION_METHODS.find((m) => m.id === settings.calculation_method)?.name || "MWL"}
              {" · "}
              {settings.madhab === "hanafi" ? "Hanafi" : "Shafi'i"}
            </span>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : data ? (
            <div className="space-y-2">
              {data.timings.map((prayer, i) => {
                const isCurrent = i === currentIdx;
                const isNext = i === nextIdx;
                const effectiveTime = getEffectiveTime(prayer);
                const adhanMode = settings.adhan_settings[prayer.key.toLowerCase()]?.mode;

                return (
                  <Card
                    key={prayer.key}
                    className={`transition-all ${
                      isCurrent
                        ? "bg-primary/10 border-primary/30 shadow-sm ring-1 ring-primary/20"
                        : isNext
                          ? "border-primary/20"
                          : ""
                    }`}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isCurrent
                              ? "bg-primary text-primary-foreground"
                              : isNext
                                ? "bg-primary/10 text-primary"
                                : "bg-secondary"
                          }`}
                        >
                          {PRAYER_ICONS[prayer.key] || <Clock className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${isCurrent ? "text-primary" : ""}`}>{prayer.name}</p>
                          <div className="flex items-center gap-1.5">
                            <p className="text-[11px] text-muted-foreground">{prayer.key}</p>
                            {prayer.mosqueTime && (
                              <span className="text-[9px] bg-primary/10 text-primary px-1 py-0.5 rounded">Mosque</span>
                            )}
                            {adhanMode === "silent" && <BellOff className="h-2.5 w-2.5 text-muted-foreground" />}
                            {adhanMode === "vibrate" && <Vibrate className="h-2.5 w-2.5 text-muted-foreground" />}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold tabular-nums ${isCurrent ? "text-primary" : ""}`}>
                          {formatPrayerTime(effectiveTime)}
                        </p>
                        {prayer.mosqueTime && prayer.mosqueTime !== prayer.time && (
                          <p className="text-[9px] text-muted-foreground line-through">
                            {formatPrayerTime(prayer.time)}
                          </p>
                        )}
                        {isCurrent && <p className="text-[10px] text-primary font-medium">Current</p>}
                        {isNext && !isCurrent && <p className="text-[10px] text-muted-foreground">Next</p>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                Unable to fetch prayer times. Check your location and try again.
              </CardContent>
            </Card>
          )}
        </div>

        {/* Method note */}
        <p className="text-[10px] text-muted-foreground text-center">
          Source: JAKIM e-Solat · Times may vary ±1-2 min
        </p>
      </div>
    </SubPageLayout>
  );
};

export default PrayerTimes;
