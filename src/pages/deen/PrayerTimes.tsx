import { useState, useEffect } from 'react';
import { Clock, MapPin, RefreshCw, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import SubPageLayout from '@/components/SubPageLayout';
import EditableText from '@/components/cms/EditableText';
import {
  fetchPrayerTimes,
  getCity,
  saveCity,
  getCurrentPrayerIndex,
  getNextPrayerIndex,
  formatPrayerTime,
  type PrayerTimesData,
  type CityConfig,
} from '@/lib/prayer-times';

const DEEN_SIBLINGS = [
  { path: '/deen/dhikr', label: 'Dhikr' },
  { path: '/deen/sunnah', label: 'Sunnah' },
  { path: '/deen/quran', label: 'Quran' },
  { path: '/deen/prayer-times', label: 'Prayer' },
  { path: '/deen/zakat', label: 'Zakat' },
];

const PrayerTimes = () => {
  const [data, setData] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cityConfig, setCityConfig] = useState<CityConfig>(getCity);
  const [editCity, setEditCity] = useState(false);
  const [cityInput, setCityInput] = useState(cityConfig.city);
  const [countryInput, setCountryInput] = useState(cityConfig.country);

  const load = async (city?: string, country?: string) => {
    setLoading(true);
    const result = await fetchPrayerTimes(city, country);
    setData(result);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSaveCity = () => {
    const config = { city: cityInput.trim() || 'Kuala Lumpur', country: countryInput.trim() || 'Malaysia' };
    saveCity(config);
    setCityConfig(config);
    setEditCity(false);
    load(config.city, config.country);
  };

  const currentIdx = data ? getCurrentPrayerIndex(data.timings) : -1;
  const nextIdx = data ? getNextPrayerIndex(data.timings) : 0;

  // Countdown to next prayer
  const [countdown, setCountdown] = useState('');
  useEffect(() => {
    if (!data) return;
    const tick = () => {
      const next = data.timings[nextIdx];
      if (!next) return;
      const [h, m] = next.time.split(':').map(Number);
      const now = new Date();
      let targetMs = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m).getTime();
      if (targetMs <= now.getTime()) targetMs += 24 * 60 * 60 * 1000;
      const diff = targetMs - now.getTime();
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdown(`${hours}h ${mins}m ${secs}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data, nextIdx]);

  return (
    <SubPageLayout title="Prayer Times" backTo="/deen" siblingRoutes={DEEN_SIBLINGS} currentPath="/deen/prayer-times">
      <div className="space-y-5">
        {/* Location */}
        <Card>
          <CardContent className="p-4">
            {editCity ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">City</Label>
                    <Input value={cityInput} onChange={e => setCityInput(e.target.value)} placeholder="Kuala Lumpur" />
                  </div>
                  <div>
                    <Label className="text-xs">Country</Label>
                    <Input value={countryInput} onChange={e => setCountryInput(e.target.value)} placeholder="Malaysia" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveCity} size="sm" className="flex-1">Save</Button>
                  <Button onClick={() => setEditCity(false)} variant="outline" size="sm">Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{cityConfig.city}, {cityConfig.country}</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditCity(true)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => load()}>
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Prayer Countdown */}
        {data && !loading && (
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="p-5 text-center space-y-1">
              <EditableText elementKey="prayer.next.label" defaultText="Next Prayer" tag="p" className="text-xs text-muted-foreground uppercase tracking-wider" />
              <p className="text-2xl font-bold text-primary">{data.timings[nextIdx]?.name}</p>
              <p className="text-sm text-muted-foreground">{formatPrayerTime(data.timings[nextIdx]?.time || '00:00')}</p>
              <p className="text-lg font-semibold tabular-nums">{countdown}</p>
            </CardContent>
          </Card>
        )}

        {/* Prayer Times List */}
        <div>
          <EditableText elementKey="prayer.today.title" defaultText="Today's Schedule" tag="h2" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3" />
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
                return (
                  <Card
                    key={prayer.key}
                    className={`transition-all ${
                      isCurrent ? 'bg-primary/10 border-primary/30 shadow-sm' :
                      isNext ? 'border-primary/20' : ''
                    }`}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isCurrent ? 'bg-primary text-primary-foreground' :
                          isNext ? 'bg-primary/10' : 'bg-secondary'
                        }`}>
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${isCurrent ? 'text-primary' : ''}`}>{prayer.name}</p>
                          <p className="text-[11px] text-muted-foreground">{prayer.key}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold tabular-nums ${isCurrent ? 'text-primary' : ''}`}>
                          {formatPrayerTime(prayer.time)}
                        </p>
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
                Unable to fetch prayer times. Check your city and try again.
              </CardContent>
            </Card>
          )}
        </div>

        {/* Method note */}
        <p className="text-[10px] text-muted-foreground text-center">
          Calculation method: Muslim World League (MWL)
        </p>
      </div>
    </SubPageLayout>
  );
};

export default PrayerTimes;
