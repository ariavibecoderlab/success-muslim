import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Moon, BookOpen, Heart, Wallet, ListChecks, Star,
  MapPin, Bell, ArrowLeft, ArrowRight, Check, Sparkles,
  Compass, Zap, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatHijriDate } from '@/lib/hijri';
import { fetchPrayerTimes, getNextPrayerIndex, getCountdownToNextPrayer, formatPrayerTime, getEffectiveTime } from '@/lib/prayer-times';
import { toast } from 'sonner';
import { requestNotificationPermission } from '@/hooks/usePrayerNotifications';

const TOTAL_STEPS = 7;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

const FOCUS_AREAS = [
  { id: 'ibadah', Icon: Moon, label: 'Ibadah & Deen' },
  { id: 'quran', Icon: BookOpen, label: 'Quran' },
  { id: 'health', Icon: Heart, label: 'Health & Wellness' },
  { id: 'wealth', Icon: Wallet, label: 'Wealth & Finance' },
  { id: 'productivity', Icon: ListChecks, label: 'Tasks & Productivity' },
  { id: 'fasting', Icon: Star, label: 'Fasting & Ramadan' },
];

const CONSISTENCY_LEVELS = [
  { id: 'beginner', Icon: Compass, title: 'Just getting started', desc: 'I want to build better habits from scratch' },
  { id: 'building', Icon: Zap, title: 'Building momentum', desc: "I'm consistent but want to improve" },
  { id: 'advanced', Icon: Sparkles, title: 'Ready to level up', desc: 'I have strong habits and want to optimize' },
];

const MOTIVATIONAL_QUOTES = [
  'Every journey begins with a single step. Yours starts now.',
  'Bismillah. Let\'s build something beautiful together.',
  'The best time to start was yesterday. The second best time is now.',
  'Consistency is the hallmark of the righteous.',
  'Small deeds done consistently are better than great deeds done rarely.',
];

const Onboarding = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) navigate('/auth', { replace: true });
  }, [user, loading, navigate]);

  // Redirect if onboarding already completed
  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('onboarding_completed').eq('id', user.id).single().then(({ data }) => {
      if (data?.onboarding_completed) navigate('/dashboard', { replace: true });
    });
  }, [user, navigate]);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step data
  const [displayName, setDisplayName] = useState('');
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [consistency, setConsistency] = useState('');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'done' | 'manual'>('idle');
  const [manualCity, setManualCity] = useState('');
  const [manualCountry, setManualCountry] = useState('');
  const [notifStatus, setNotifStatus] = useState<'idle' | 'granted' | 'skipped'>('idle');

  // Celebration screen data
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);
  const [countdown, setCountdown] = useState('');
  const [confetti, setConfetti] = useState(false);
  const [quote] = useState(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);

  // Load saved progress
  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('display_name, onboarding_step, focus_areas, consistency_level, city, country')
      .eq('id', user.id).single().then(({ data }) => {
        if (data) {
          if (data.display_name) setDisplayName(data.display_name);
          if (data.onboarding_step && data.onboarding_step > 1) setStep(data.onboarding_step);
          if (data.focus_areas && Array.isArray(data.focus_areas)) setFocusAreas(data.focus_areas as string[]);
          if (data.consistency_level) setConsistency(data.consistency_level);
          if (data.city) setManualCity(data.city);
          if (data.country) setManualCountry(data.country);
        }
      });
    // Pre-fill name from Google profile
    if (user.user_metadata?.full_name && !displayName) {
      setDisplayName(user.user_metadata.full_name.split(' ')[0]);
    } else if (user.user_metadata?.display_name && !displayName) {
      setDisplayName(user.user_metadata.display_name);
    }
  }, [user]);

  // Save step progress
  const saveProgress = useCallback(async (updates: Record<string, any>, nextStep: number) => {
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').update({
      ...updates,
      onboarding_step: nextStep,
    }).eq('id', user.id);
    setSaving(false);
  }, [user]);

  const goNext = () => {
    setDirection(1);
    setStep(s => Math.min(s + 1, TOTAL_STEPS));
  };
  const goBack = () => {
    setDirection(-1);
    setStep(s => Math.max(s - 1, 1));
  };

  // Step 2: Save name
  const handleNameContinue = async () => {
    if (!displayName.trim()) return;
    await saveProgress({ display_name: displayName.trim() }, 3);
    goNext();
  };

  // Step 3: Save focus areas
  const toggleFocus = (id: string) => {
    setFocusAreas(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };
  const handleFocusContinue = async () => {
    await saveProgress({ focus_areas: focusAreas }, 4);
    goNext();
  };

  // Step 4: Save consistency
  const handleConsistencyContinue = async () => {
    await saveProgress({ consistency_level: consistency }, 5);
    goNext();
  };

  // Step 5: Location
  const handleLocationGPS = async () => {
    setLocationStatus('loading');
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      );
      // Reverse geocode via prayer API
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      // Save to prayer settings
      if (user) {
        await supabase.from('prayer_settings').upsert({
          user_id: user.id,
          latitude: lat,
          longitude: lng,
          location_method: 'gps',
        }, { onConflict: 'user_id' });
      }
      setLocationStatus('done');
      await saveProgress({}, 6);
      setTimeout(goNext, 500);
    } catch {
      toast.error('Could not get location. Please set manually.');
      setLocationStatus('manual');
    }
  };

  const handleLocationManual = async () => {
    if (!manualCity.trim()) return;
    if (user) {
      await supabase.from('prayer_settings').upsert({
        user_id: user.id,
        city: manualCity.trim(),
        country: manualCountry.trim() || 'Malaysia',
        location_method: 'manual',
      }, { onConflict: 'user_id' });
      await supabase.from('profiles').update({ city: manualCity.trim(), country: manualCountry.trim() || 'Malaysia' }).eq('id', user.id);
    }
    setLocationStatus('done');
    await saveProgress({}, 6);
    setTimeout(goNext, 300);
  };

  // Step 6: Notifications
  const handleNotifEnable = async () => {
    const result = await requestNotificationPermission();
    if (result === 'granted') {
      setNotifStatus('granted');
      await saveProgress({ notification_enabled: true }, 7);
    } else {
      toast.info('You can enable notifications later in Prayer Settings.');
      setNotifStatus('skipped');
      await saveProgress({ notification_enabled: false }, 7);
    }
    setTimeout(goNext, 500);
  };

  const handleNotifSkip = async () => {
    setNotifStatus('skipped');
    await saveProgress({ notification_enabled: false }, 7);
    goNext();
  };

  // Step 7: Celebration — load prayer data
  useEffect(() => {
    if (step !== 7) return;
    setConfetti(true);
    fetchPrayerTimes().then(data => {
      if (data) {
        const idx = getNextPrayerIndex(data.timings);
        const p = data.timings[idx];
        setNextPrayer({ name: p.name, time: formatPrayerTime(getEffectiveTime(p)) });
        const tick = () => setCountdown(getCountdownToNextPrayer(data.timings, idx));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
      }
    });
  }, [step]);

  const finishOnboarding = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').update({
      onboarding_completed: true,
      onboarding_step: TOTAL_STEPS,
    }).eq('id', user.id);
    setSaving(false);
    navigate('/dashboard');
  };

  const hijriDate = formatHijriDate(new Date());

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      {step < 7 && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      )}

      {/* Back button */}
      {step > 1 && step < 7 && (
        <button
          onClick={goBack}
          className="fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      )}

      {/* Step indicator dots */}
      {step < 7 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS - 1 }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i + 1 <= step ? 'bg-primary' : 'bg-muted-foreground/20'
              }`}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {/* STEP 1 — Already handled by Auth page, this is post-auth step 2 */}
              {step === 1 && (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <Moon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Welcome to Success Muslim</h1>
                    <p className="text-muted-foreground mt-2">Let's personalize your experience in a few quick steps.</p>
                  </div>
                  <Button onClick={goNext} className="w-full" size="lg">
                    Let's Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* STEP 2 — Name */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold">What should we call you?</h1>
                    <p className="text-muted-foreground mt-1">Just your first name is fine.</p>
                  </div>
                  <Input
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Your name..."
                    className="text-center text-lg h-14"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleNameContinue()}
                  />
                  <Button onClick={handleNameContinue} className="w-full" size="lg"
                    disabled={!displayName.trim() || saving}>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* STEP 3 — Focus Areas */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold">What do you want to focus on?</h1>
                    <p className="text-sm text-muted-foreground mt-1">Choose all that apply. You can change this anytime.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {FOCUS_AREAS.map(area => {
                      const selected = focusAreas.includes(area.id);
                      return (
                        <button
                          key={area.id}
                          onClick={() => toggleFocus(area.id)}
                          className={`relative rounded-xl border-2 p-4 text-center transition-all ${
                            selected
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/30'
                          }`}
                        >
                          {selected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                          <area.Icon className="h-6 w-6 text-primary mx-auto" />
                          <p className="text-sm font-medium mt-1">{area.label}</p>
                        </button>
                      );
                    })}
                  </div>
                  <Button onClick={handleFocusContinue} className="w-full" size="lg"
                    disabled={focusAreas.length === 0 || saving}>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* STEP 4 — Consistency Level */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold">How's your deen consistency?</h1>
                    <p className="text-sm text-muted-foreground mt-1">Be honest — this helps us personalize your journey.</p>
                  </div>
                  <div className="space-y-3">
                    {CONSISTENCY_LEVELS.map(level => (
                      <button
                        key={level.id}
                        onClick={() => setConsistency(level.id)}
                        className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                          consistency === level.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <level.Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{level.title}</p>
                            <p className="text-sm text-muted-foreground">{level.desc}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <Button onClick={handleConsistencyContinue} className="w-full" size="lg"
                    disabled={!consistency || saving}>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* STEP 5 — Location */}
              {step === 5 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Compass className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">Know your prayer times</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                      We'll show accurate azan times based on your location. Your location is never shared.
                    </p>
                  </div>

                  {locationStatus === 'idle' && (
                    <div className="space-y-3">
                      <Button onClick={handleLocationGPS} className="w-full" size="lg">
                        <MapPin className="mr-2 h-4 w-4" /> Allow Location Access
                      </Button>
                      <Button onClick={() => setLocationStatus('manual')} variant="ghost" className="w-full">
                        Set location manually
                      </Button>
                    </div>
                  )}

                  {locationStatus === 'loading' && (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                      <p className="text-sm text-muted-foreground mt-2">Getting your location...</p>
                    </div>
                  )}

                  {locationStatus === 'manual' && (
                    <div className="space-y-3">
                      <Input
                        value={manualCity}
                        onChange={e => setManualCity(e.target.value)}
                        placeholder="City (e.g. Kuala Lumpur)"
                        autoFocus
                      />
                      <Input
                        value={manualCountry}
                        onChange={e => setManualCountry(e.target.value)}
                        placeholder="Country (e.g. Malaysia)"
                      />
                      <Button onClick={handleLocationManual} className="w-full" size="lg"
                        disabled={!manualCity.trim() || saving}>
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {locationStatus === 'done' && (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <Check className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-sm text-primary font-medium mt-2">Location set!</p>
                    </div>
                  )}

                  {locationStatus === 'idle' && (
                    <button
                      onClick={async () => { await saveProgress({}, 6); goNext(); }}
                      className="text-xs text-muted-foreground underline mx-auto block"
                    >
                      Skip for now
                    </button>
                  )}
                </div>
              )}

              {/* STEP 6 — Notifications */}
              {step === 6 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Bell className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">Never miss a prayer</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                      Get notified before each azan. You control which prayers and how — adhan, vibrate, or silent.
                    </p>
                  </div>

                  {notifStatus === 'idle' && (
                    <div className="space-y-3">
                      <Button onClick={handleNotifEnable} className="w-full" size="lg">
                        <Bell className="mr-2 h-4 w-4" /> Turn On Notifications
                      </Button>
                      <Button onClick={handleNotifSkip} variant="ghost" className="w-full">
                        I'll set this up later
                      </Button>
                    </div>
                  )}

                  {notifStatus === 'granted' && (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <Check className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-sm text-primary font-medium mt-2">Notifications enabled!</p>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 7 — Celebration */}
              {step === 7 && (
                <div className="space-y-6 text-center">
                  {/* Confetti effect */}
                  {confetti && (
                    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 rounded-full"
                          style={{
                            left: `${Math.random() * 100}%`,
                            backgroundColor: ['hsl(var(--primary))', '#FFC107', '#4CAF50', '#2196F3', '#FF5722'][i % 5],
                          }}
                          initial={{ top: -10, opacity: 1, scale: 1 }}
                          animate={{
                            top: '110%',
                            opacity: 0,
                            rotate: Math.random() * 720,
                            x: (Math.random() - 0.5) * 200,
                          }}
                          transition={{
                            duration: 2 + Math.random() * 2,
                            delay: Math.random() * 0.5,
                            ease: 'easeOut',
                          }}
                          onAnimationComplete={() => {
                            if (i === 0) setConfetti(false);
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}>
                    <h1 className="text-3xl font-bold">
                      Assalamualaikum, {displayName || 'there'}!
                    </h1>
                  </motion.div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    <p className="text-sm text-primary font-semibold">{hijriDate}</p>
                  </motion.div>

                  {nextPrayer && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                      <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-4">
                          <p className="text-xs text-muted-foreground">Next Prayer</p>
                          <p className="text-lg font-bold text-primary">{nextPrayer.name}</p>
                          <p className="text-2xl font-bold tabular-nums">{countdown}</p>
                          <p className="text-xs text-muted-foreground">{nextPrayer.time}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                    <p className="text-sm text-muted-foreground italic">"{quote}"</p>
                  </motion.div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Deen Score</p>
                        <p className="text-3xl font-bold text-primary">0<span className="text-lg text-muted-foreground">/100</span></p>
                        <p className="text-xs text-muted-foreground mt-1">Your score grows as you build habits</p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
                    <Button onClick={finishOnboarding} className="w-full" size="lg" disabled={saving}>
                      Enter My Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
