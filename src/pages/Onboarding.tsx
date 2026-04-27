import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Mosque02Icon,
  Moon02Icon,
  BookOpenIcon,
  HeartCheckIcon,
  Money03Icon,
  TaskEdit01Icon,
  StarIcon,
  Compass01Icon,
  FlashIcon,
  SparklesIcon,
  Location01Icon,
  Notification03Icon,
} from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { api } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import { formatHijriDate } from '@/lib/hijri';
import { fetchPrayerTimes, getNextPrayerIndex, getCountdownToNextPrayer, formatPrayerTime, getEffectiveTime } from '@/lib/prayer-times';
import { toast } from 'sonner';
import { requestNotificationPermission } from '@/utils/notification-permission';

const TOTAL_STEPS = 7;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 120 : -120, opacity: 0, scale: 0.96 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -120 : 120, opacity: 0, scale: 0.96 }),
};

const FOCUS_AREA_COLORS = [
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
  'bg-violet-100 text-violet-700',
  'bg-teal-100 text-teal-700',
];

const FOCUS_AREAS = [
  { id: 'ibadah', icon: Moon02Icon, label: 'Ibadah & Iman', color: FOCUS_AREA_COLORS[0] },
  { id: 'quran', icon: BookOpenIcon, label: 'Quran', color: FOCUS_AREA_COLORS[1] },
  { id: 'health', icon: HeartCheckIcon, label: 'Health & Wellness', color: FOCUS_AREA_COLORS[2] },
  { id: 'wealth', icon: Money03Icon, label: 'Wealth & Finance', color: FOCUS_AREA_COLORS[3] },
  { id: 'productivity', icon: TaskEdit01Icon, label: 'Tasks & Productivity', color: FOCUS_AREA_COLORS[4] },
  { id: 'fasting', icon: StarIcon, label: 'Fasting & Ramadan', color: FOCUS_AREA_COLORS[5] },
];

const CONSISTENCY_LEVELS = [
  { id: 'beginner', icon: Compass01Icon, title: 'Just getting started', desc: 'I want to build better habits from scratch', emoji: '🌱' },
  { id: 'building', icon: FlashIcon, title: 'Building momentum', desc: "I'm consistent but want to improve", emoji: '🌳' },
  { id: 'advanced', icon: SparklesIcon, title: 'Ready to level up', desc: 'I have strong habits and want to optimize', emoji: '🚀' },
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

  useEffect(() => {
    if (!loading && !user) navigate('/auth', { replace: true });
  }, [user, loading, navigate]);

  const navigateAfterOnboarding = useCallback(() => {
    const redirect = localStorage.getItem('post_auth_redirect');
    if (redirect) {
      localStorage.removeItem('post_auth_redirect');
      navigate(redirect, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    api<any>('api-profile', { params: { resource: 'profile' } }).then(data => {
      if (data?.onboarding_completed) navigateAfterOnboarding();
    });
  }, [user, navigateAfterOnboarding]);

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [consistency, setConsistency] = useState('');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'done' | 'manual'>('idle');
  const [manualCity, setManualCity] = useState('');
  const [manualCountry, setManualCountry] = useState('');
  const [notifStatus, setNotifStatus] = useState<'idle' | 'granted' | 'skipped'>('idle');

  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);
  const [countdown, setCountdown] = useState('');
  const [confetti, setConfetti] = useState(false);
  const [quote] = useState(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);

  useEffect(() => {
    if (!user) return;
    api<any>('api-profile', { params: { resource: 'profile' } }).then(data => {
      if (data) {
        if (data.display_name) setDisplayName(data.display_name);
        if (data.onboarding_step && data.onboarding_step > 1) setStep(data.onboarding_step);
        if (data.focus_areas && Array.isArray(data.focus_areas)) setFocusAreas(data.focus_areas as string[]);
        if (data.consistency_level) setConsistency(data.consistency_level);
        if (data.city) setManualCity(data.city);
        if (data.country) setManualCountry(data.country);
      }
    });
    if (user.user_metadata?.full_name && !displayName) {
      setDisplayName(user.user_metadata.full_name.split(' ')[0]);
    } else if (user.user_metadata?.display_name && !displayName) {
      setDisplayName(user.user_metadata.display_name);
    }
  }, [user]);

  const saveProgress = useCallback(async (updates: Record<string, any>, nextStep: number) => {
    if (!user) return;
    setSaving(true);
    await api('api-profile', { method: 'POST', params: { resource: 'profile' }, body: { ...updates, onboarding_step: nextStep } });
    setSaving(false);
  }, [user]);

  const goNext = () => { setDirection(1); setStep(s => Math.min(s + 1, TOTAL_STEPS)); };
  const goBack = () => { setDirection(-1); setStep(s => Math.max(s - 1, 1)); };

  const handleNameContinue = async () => {
    if (!displayName.trim()) return;
    await saveProgress({ display_name: displayName.trim() }, 3);
    goNext();
  };

  const toggleFocus = (id: string) => {
    setFocusAreas(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };
  const handleFocusContinue = async () => { await saveProgress({ focus_areas: focusAreas }, 4); goNext(); };
  const handleConsistencyContinue = async () => { await saveProgress({ consistency_level: consistency }, 5); goNext(); };

  const handleLocationGPS = async () => {
    setLocationStatus('loading');
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      );
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      if (user) {
        await api('api-misc', { method: 'POST', params: { resource: 'prayer-settings' }, body: { latitude: lat, longitude: lng, location_method: 'gps' } });
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
      await api('api-misc', { method: 'POST', params: { resource: 'prayer-settings' }, body: { city: manualCity.trim(), country: manualCountry.trim() || 'Malaysia', location_method: 'manual' } });
      await api('api-profile', { method: 'POST', params: { resource: 'profile' }, body: { city: manualCity.trim(), country: manualCountry.trim() || 'Malaysia' } });
    }
    setLocationStatus('done');
    await saveProgress({}, 6);
    setTimeout(goNext, 300);
  };

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
    await api('api-profile', { method: 'POST', params: { resource: 'profile' }, body: { onboarding_completed: true, onboarding_step: TOTAL_STEPS } });
    setSaving(false);
    navigateAfterOnboarding();
  };

  const hijriDate = formatHijriDate(new Date());
  const visibleSteps = TOTAL_STEPS - 1; // Steps 1-6 shown in progress

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-background to-background flex flex-col relative overflow-hidden">
      {/* Decorative Islamic geometric pattern overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/[0.03] blur-3xl" />
        <div className="absolute top-1/4 -left-16 w-48 h-48 rounded-full bg-accent/[0.05] blur-2xl" />
        <div className="absolute bottom-1/3 right-0 w-32 h-32 rounded-full bg-primary/[0.02] blur-2xl" />
      </div>

      {/* Segmented progress bar */}
      {step < 7 && (
        <div className="fixed top-0 left-0 right-0 z-50 px-6 pt-14 pb-2">
          <div className="flex gap-1.5">
            {Array.from({ length: visibleSteps }).map((_, i) => (
              <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-muted/60">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: i + 1 <= step
                      ? 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))'
                      : 'transparent',
                    boxShadow: i + 1 === step ? '0 0 8px hsl(var(--primary) / 0.4)' : 'none',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: i + 1 <= step ? '100%' : '0%' }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground text-center mt-2 font-medium tracking-wide">
            Step {step} of {visibleSteps}
          </p>
        </div>
      )}

      {/* Back button */}
      {step > 1 && step < 7 && (
        <motion.button
          onClick={goBack}
          className="fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-white/70 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-sm active:scale-95 transition-all"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </motion.button>
      )}

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-24 relative z-10">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* STEP 1 — Welcome */}
              {step === 1 && (
                <div className="text-center space-y-8">
                  <motion.div
                    className="relative mx-auto w-24 h-24"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <img src="/smlogo.webp" alt="Success Muslim" className="w-24 h-24 rounded-3xl shadow-lg" />
                    <div className="absolute inset-0 rounded-3xl bg-primary/10 blur-xl -z-10 scale-110" />
                  </motion.div>

                  <div className="space-y-3">
                    <p className="text-lg text-muted-foreground/70 font-arabic">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                      Welcome to Success Muslim
                    </h1>
                    <p className="text-muted-foreground leading-relaxed">
                      Your personal companion for spiritual growth, health, and productivity.
                    </p>
                  </div>

                  <Button
                    onClick={goNext}
                    className="w-full h-14 text-base rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
                    size="lg"
                  >
                    Let's Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}

              {/* STEP 2 — Name */}
              {step === 2 && (
                <div className="space-y-8">
                  <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold">What should we call you?</h1>
                    <p className="text-muted-foreground">Just your first name is fine.</p>
                  </div>

                  <div className="space-y-4">
                    <Input
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="Your name..."
                      className="text-center text-lg h-14 rounded-2xl border-border/60 bg-white/70 backdrop-blur-sm shadow-inner focus:ring-primary/30"
                      autoFocus
                      onKeyDown={e => e.key === 'Enter' && handleNameContinue()}
                    />
                    {displayName.trim() && (
                      <motion.p
                        className="text-center text-primary font-semibold text-lg"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        Assalamualaikum, {displayName.trim()}! 👋
                      </motion.p>
                    )}
                  </div>

                  <Button
                    onClick={handleNameContinue}
                    className="w-full h-14 text-base rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
                    size="lg"
                    disabled={!displayName.trim() || saving}
                  >
                    Continue <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}

              {/* STEP 3 — Focus Areas */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold">What do you want to focus on?</h1>
                    <p className="text-sm text-muted-foreground">Choose all that apply. You can change this anytime.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {FOCUS_AREAS.map((area) => {
                      const selected = focusAreas.includes(area.id);
                      return (
                        <motion.button
                          key={area.id}
                          onClick={() => toggleFocus(area.id)}
                          className={`relative rounded-2xl p-4 text-center transition-all backdrop-blur-sm active:scale-[0.96] ${
                            selected
                              ? 'bg-white/80 border-2 border-primary shadow-md shadow-primary/10'
                              : 'bg-white/50 border-2 border-transparent hover:bg-white/70 hover:border-border/50'
                          }`}
                          whileTap={{ scale: 0.96 }}
                        >
                          {selected && (
                            <motion.div
                              className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                            >
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </motion.div>
                          )}
                          <div className={`w-11 h-11 rounded-xl ${area.color} flex items-center justify-center mx-auto mb-2`}>
                            <HugeiconsIcon icon={area.icon} size={22} />
                          </div>
                          <p className="text-sm font-medium">{area.label}</p>
                        </motion.button>
                      );
                    })}
                  </div>

                  <Button
                    onClick={handleFocusContinue}
                    className="w-full h-14 text-base rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
                    size="lg"
                    disabled={focusAreas.length === 0 || saving}
                  >
                    Continue <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}

              {/* STEP 4 — Consistency Level */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <motion.div
                      key={consistency || 'default'}
                      className="text-5xl mx-auto"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    >
                      {consistency === 'beginner' ? '🌱' : consistency === 'building' ? '🌳' : consistency === 'advanced' ? '🚀' : '🤲'}
                    </motion.div>
                    <h1 className="text-2xl font-bold">How's your iman consistency?</h1>
                    <p className="text-sm text-muted-foreground">Be honest — this helps us personalize your journey.</p>
                  </div>

                  <div className="space-y-3">
                    {CONSISTENCY_LEVELS.map(level => (
                      <motion.button
                        key={level.id}
                        onClick={() => setConsistency(level.id)}
                        className={`w-full text-left rounded-2xl p-4 transition-all backdrop-blur-sm active:scale-[0.98] ${
                          consistency === level.id
                            ? 'bg-white/80 border-2 border-primary shadow-md shadow-primary/10'
                            : 'bg-white/50 border-2 border-transparent hover:bg-white/70'
                        }`}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            consistency === level.id ? 'bg-primary/15' : 'bg-muted/60'
                          }`}>
                            <HugeiconsIcon icon={level.icon} size={22} className="text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{level.title}</p>
                            <p className="text-sm text-muted-foreground">{level.desc}</p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <Button
                    onClick={handleConsistencyContinue}
                    className="w-full h-14 text-base rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
                    size="lg"
                    disabled={!consistency || saving}
                  >
                    Continue <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}

              {/* STEP 5 — Location */}
              {step === 5 && (
                <div className="space-y-6">
                  <div className="text-center space-y-3">
                    <motion.div
                      className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center mx-auto"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <HugeiconsIcon icon={Mosque02Icon} size={36} className="text-primary" />
                    </motion.div>
                    <h1 className="text-2xl font-bold">Know your prayer times</h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We'll show accurate azan times based on your location. Your location is never shared.
                    </p>
                  </div>

                  {locationStatus === 'idle' && (
                    <div className="space-y-3">
                      <Button
                        onClick={handleLocationGPS}
                        className="w-full h-14 text-base rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
                        size="lg"
                      >
                        <HugeiconsIcon icon={Location01Icon} size={18} className="mr-2" /> Allow Location Access
                      </Button>
                      <Button onClick={() => setLocationStatus('manual')} variant="ghost" className="w-full rounded-2xl h-12">
                        Set location manually
                      </Button>
                    </div>
                  )}

                  {locationStatus === 'loading' && (
                    <div className="text-center py-8">
                      <div className="relative mx-auto w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                        <div className="absolute inset-2 rounded-full border-2 border-primary/30 animate-pulse" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-4">Getting your location...</p>
                    </div>
                  )}

                  {locationStatus === 'manual' && (
                    <div className="space-y-3">
                      <Input
                        value={manualCity}
                        onChange={e => setManualCity(e.target.value)}
                        placeholder="City (e.g. Kuala Lumpur)"
                        className="h-12 rounded-2xl bg-white/70 backdrop-blur-sm"
                        autoFocus
                      />
                      <Input
                        value={manualCountry}
                        onChange={e => setManualCountry(e.target.value)}
                        placeholder="Country (e.g. Malaysia)"
                        className="h-12 rounded-2xl bg-white/70 backdrop-blur-sm"
                      />
                      <Button
                        onClick={handleLocationManual}
                        className="w-full h-14 text-base rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
                        size="lg"
                        disabled={!manualCity.trim() || saving}
                      >
                        Continue <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  )}

                  {locationStatus === 'done' && (
                    <motion.div
                      className="text-center py-4"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <Check className="h-7 w-7 text-primary" />
                      </div>
                      <p className="text-sm text-primary font-semibold mt-3">Location set!</p>
                    </motion.div>
                  )}

                  {locationStatus === 'idle' && (
                    <button
                      onClick={async () => { await saveProgress({}, 6); goNext(); }}
                      className="text-xs text-muted-foreground underline mx-auto block mt-2"
                    >
                      Skip for now
                    </button>
                  )}
                </div>
              )}

              {/* STEP 6 — Notifications */}
              {step === 6 && (
                <div className="space-y-6">
                  <div className="text-center space-y-3">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center mx-auto">
                      <HugeiconsIcon icon={Notification03Icon} size={36} className="text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">Never miss a prayer</h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Get notified before each azan. You control which prayers and how.
                    </p>
                  </div>

                  {/* Mock notification preview */}
                  {notifStatus === 'idle' && (
                    <motion.div
                      className="rounded-2xl bg-white/70 backdrop-blur-sm border border-border/50 p-4 shadow-sm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <HugeiconsIcon icon={Mosque02Icon} size={20} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-primary">Success Muslim</p>
                            <p className="text-[10px] text-muted-foreground">now</p>
                          </div>
                          <p className="text-sm font-medium mt-0.5">Maghrib in 15 minutes 🕌</p>
                          <p className="text-xs text-muted-foreground">Time to prepare for prayer</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {notifStatus === 'idle' && (
                    <div className="space-y-3">
                      <Button
                        onClick={handleNotifEnable}
                        className="w-full h-14 text-base rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
                        size="lg"
                      >
                        <HugeiconsIcon icon={Notification03Icon} size={18} className="mr-2" /> Turn On Notifications
                      </Button>
                      <Button onClick={handleNotifSkip} variant="ghost" className="w-full rounded-2xl h-12">
                        I'll set this up later
                      </Button>
                    </div>
                  )}

                  {notifStatus === 'granted' && (
                    <motion.div
                      className="text-center py-4"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <Check className="h-7 w-7 text-primary" />
                      </div>
                      <p className="text-sm text-primary font-semibold mt-3">Notifications enabled!</p>
                    </motion.div>
                  )}
                </div>
              )}

              {/* STEP 7 — Celebration */}
              {step === 7 && (
                <div className="space-y-6 text-center">
                  {/* Enhanced confetti */}
                  {confetti && (
                    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                      {Array.from({ length: 50 }).map((_, i) => {
                        const shapes = ['rounded-full', 'rounded-sm rotate-45', 'rounded-full'];
                        const colors = [
                          'hsl(var(--primary))', '#FFC107', '#4CAF50', '#2196F3', '#FF5722',
                          'hsl(var(--accent))', '#8BC34A',
                        ];
                        const size = Math.random() > 0.7 ? 'w-3 h-3' : 'w-2 h-2';
                        return (
                          <motion.div
                            key={i}
                            className={`absolute ${size} ${shapes[i % 3]}`}
                            style={{
                              left: `${Math.random() * 100}%`,
                              backgroundColor: colors[i % colors.length],
                            }}
                            initial={{ top: -10, opacity: 1, scale: 1 }}
                            animate={{
                              top: '110%',
                              opacity: 0,
                              rotate: Math.random() * 720,
                              x: (Math.random() - 0.5) * 300,
                            }}
                            transition={{
                              duration: 2.5 + Math.random() * 2,
                              delay: Math.random() * 0.8,
                              ease: 'easeOut',
                            }}
                            onAnimationComplete={() => { if (i === 0) setConfetti(false); }}
                          />
                        );
                      })}
                    </div>
                  )}

                  {/* Radial glow */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-primary/[0.06] blur-3xl" />
                  </div>

                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.6, type: 'spring', stiffness: 200 }}
                  >
                    <p className="text-4xl mb-2">🤲</p>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                      Assalamualaikum, {displayName || 'there'}!
                    </h1>
                  </motion.div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                    <p className="text-sm text-primary font-semibold">{hijriDate}</p>
                  </motion.div>

                  {nextPrayer && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                      <Card className="border-0 rounded-2xl overflow-hidden shadow-lg">
                        <CardContent className="p-5 bg-gradient-to-br from-emerald-700 to-teal-800 text-white">
                          <p className="text-xs text-white/70 font-medium">Next Prayer</p>
                          <p className="text-lg font-bold mt-0.5">{nextPrayer.name}</p>
                          <p className="text-3xl font-bold tabular-nums mt-1">{countdown}</p>
                          <p className="text-xs text-white/60 mt-1">{nextPrayer.time}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                    <p className="text-sm text-muted-foreground italic leading-relaxed">"{quote}"</p>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
                    <Card className="border-0 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm">
                      <CardContent className="p-5">
                        <p className="text-xs text-muted-foreground font-medium">Iman Score</p>
                        <p className="text-3xl font-bold text-primary mt-1">0<span className="text-lg text-muted-foreground">/100</span></p>
                        <p className="text-xs text-muted-foreground mt-1">Your score grows as you build habits</p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
                    <Button
                      onClick={finishOnboarding}
                      className="w-full h-14 text-base rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform animate-pulse"
                      size="lg"
                      disabled={saving}
                    >
                      Enter My Dashboard <ArrowRight className="ml-2 h-5 w-5" />
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
