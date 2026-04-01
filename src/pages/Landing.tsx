import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import MarketingLayout from '@/components/MarketingLayout';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Mosque02Icon,
  HealthIcon,
  MoneyBag02Icon,
  Target02Icon,
  StarIcon,
  ArrowRight02Icon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons';

import imgHero from '@/assets/landing/hero-dashboard.jpg';
import imgQuran from '@/assets/landing/quran-tracker.jpg';
import imgHealth from '@/assets/landing/health-dashboard.jpg';
import imgPattern from '@/assets/landing/pattern-bg.jpg';
import imgIman from '@/assets/features/iman.webp';
import imgLifescore from '@/assets/features/lifescore.webp';
import imgIfasting from '@/assets/features/ifasting.webp';
import imgStartFasting from '@/assets/features/start-fasting.webp';
import smlogo from '@/assets/smlogo.webp';

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

/* ── Animated Ring ── */
const AnimatedRing = ({ progress, size = 160 }: { progress: number; size?: number }) => {
  const r = (size / 2) - 6;
  const circumference = 2 * Math.PI * r;
  const target = (progress / 100) * circumference;
  return (
    <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke="url(#ringGrad)" strokeWidth="8" strokeLinecap="round"
        animate={{ strokeDasharray: `${target} ${circumference}` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
      </defs>
    </svg>
  );
};

/* ── Animated Counter ── */
const AnimatedCounter = ({ target, suffix = '' }: { target: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1200;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setCount(Math.round(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const bentoFeatures = [
  {
    key: 'iman',
    title: 'Iman & Worship',
    desc: 'Prayer tracking, Quran reading, dhikr counter, zakat calculator — everything for your spiritual growth.',
    icon: Mosque02Icon,
    gradient: 'from-emerald-600 to-teal-700',
    lightBg: 'bg-emerald-50',
    iconColor: '#059669',
    img: imgIman,
    span: 'md:col-span-2 md:row-span-2',
  },
  {
    key: 'wellness',
    title: 'Wellness',
    desc: 'BMI, sleep, hydration & IF fasting tracker.',
    icon: Heartbeat02Icon,
    gradient: 'from-teal-500 to-teal-600',
    lightBg: 'bg-teal-50',
    iconColor: '#0d9488',
    img: imgHealth,
    span: '',
  },
  {
    key: 'wealth',
    title: 'Wealth',
    desc: 'Halal budgeting & savings goals.',
    icon: MoneyBag02Icon,
    gradient: 'from-orange-500 to-orange-600',
    lightBg: 'bg-orange-50',
    iconColor: '#ea580c',
    img: imgIfasting,
    span: '',
  },
  {
    key: 'productivity',
    title: 'Productivity',
    desc: 'Daily MITs, habits & streaks.',
    icon: Target02Icon,
    gradient: 'from-amber-500 to-amber-600',
    lightBg: 'bg-amber-50',
    iconColor: '#d97706',
    img: imgStartFasting,
    span: '',
  },
];

const stats = [
  { value: 5, suffix: '', label: 'Pillars of Growth' },
  { value: 90, suffix: '+', label: 'Features' },
  { value: 100, suffix: '%', label: 'Free Forever' },
];

const Landing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [scores, setScores] = useState({ iman: 85, wellness: 64, productivity: 67 });
  const totalScore = Math.round((scores.iman + scores.wellness + scores.productivity) / 3);

  useEffect(() => {
    if (!loading && user) navigate('/onboarding', { replace: true });
  }, [user, loading, navigate]);

  return (
    <MarketingLayout>
      {/* ── Hero Section ── */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden bg-white">
        {/* Decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-br from-emerald-200/40 to-teal-100/30 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-40 right-0 w-[300px] h-[300px] bg-orange-200/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto">
          {/* Bento Hero Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Main Hero Card */}
            <motion.div
              initial="hidden" animate="visible" variants={fade} custom={0}
              className="md:col-span-2 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 md:p-12 flex flex-col justify-between min-h-[340px] relative overflow-hidden"
            >
              {/* Decorative pattern */}
              <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
                <svg viewBox="0 0 200 200" fill="none">
                  <circle cx="100" cy="100" r="80" stroke="white" strokeWidth="0.5"/>
                  <circle cx="100" cy="100" r="60" stroke="white" strokeWidth="0.5"/>
                  <circle cx="100" cy="100" r="40" stroke="white" strokeWidth="0.5"/>
                  {[0,45,90,135,180,225,270,315].map(angle => (
                    <line key={angle} x1="100" y1="100" x2={100 + 80*Math.cos(angle*Math.PI/180)} y2={100 + 80*Math.sin(angle*Math.PI/180)} stroke="white" strokeWidth="0.5"/>
                  ))}
                </svg>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <img src={smlogo} alt="Success Muslim" className="w-10 h-10 rounded-xl" />
                  <span className="text-white/70 text-sm font-medium">Success Muslim</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-4">
                  Optimize Your Life
                  <br />
                  <span className="text-orange-300">For Both Worlds</span>
                </h1>
                <p className="text-white/70 text-base md:text-lg max-w-md mb-8">
                  The all-in-one Muslim lifestyle app — track prayers, Quran, health, wealth, and productivity.
                </p>
              </div>

              <div className="relative z-10 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-white text-emerald-700 hover:bg-white/90 rounded-xl px-8 py-6 text-base font-semibold shadow-lg">
                  <Link to="/auth">
                    Start Your Journey
                    <HugeiconsIcon icon={ArrowRight02Icon} size={18} className="ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl">
                  <Link to="/features">Explore Features</Link>
                </Button>
              </div>
            </motion.div>

            {/* Right side stacked cards */}
            <div className="flex flex-col gap-4">
              {/* Phone mockup card */}
              <motion.div
                initial="hidden" animate="visible" variants={fade} custom={1}
                className="bg-gray-50 rounded-3xl p-6 flex items-center justify-center flex-1 overflow-hidden"
              >
                <div className="rounded-[1.5rem] border-[4px] border-gray-200 bg-white p-1 shadow-xl max-w-[160px]">
                  <div className="rounded-[1.2rem] overflow-hidden">
                    <img src={imgHero} alt="Success Muslim Dashboard" className="w-full h-auto" loading="lazy" />
                  </div>
                </div>
              </motion.div>

              {/* Stats card */}
              <motion.div
                initial="hidden" animate="visible" variants={fade} custom={2}
                className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6"
              >
                <div className="grid grid-cols-3 gap-2 text-center">
                  {stats.map(s => (
                    <div key={s.label}>
                      <p className="text-2xl font-bold text-white">
                        <AnimatedCounter target={s.value} suffix={s.suffix} />
                      </p>
                      <p className="text-[10px] text-white/70 leading-tight mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Trust line */}
          <motion.p initial="hidden" animate="visible" variants={fade} custom={3}
            className="text-center text-gray-400 text-sm mt-8 tracking-wide"
          >
            Free forever · No credit card · Built for the Ummah 🌙
          </motion.p>
        </div>
      </section>

      {/* ── Bento Feature Grid ── */}
      <section className="py-20 px-6 bg-gray-50/50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Everything You Need,{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Nothing You Don't</span>
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">Four pillars of growth, unified in one beautiful dashboard.</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-4 auto-rows-[200px]">
            {bentoFeatures.map((f, i) => (
              <motion.div
                key={f.key}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}
                className={`group relative rounded-2xl overflow-hidden border border-gray-100 bg-white cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] ${f.span}`}
              >
                {/* Background image */}
                <img src={f.img} alt={f.title} loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />

                {/* Glassmorphic overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${f.key === 'iman' ? 'from-emerald-900/90 via-emerald-800/60 to-emerald-700/30' : 'from-gray-900/80 via-gray-800/40 to-transparent'}`} />

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-end p-6">
                  <div className={`w-10 h-10 rounded-xl ${f.key === 'iman' ? 'bg-white/20' : 'bg-white/20'} backdrop-blur-sm flex items-center justify-center mb-3`}>
                    <HugeiconsIcon icon={f.icon} size={22} color="white" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-1">{f.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interactive Life Score ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
              <HugeiconsIcon icon={StarIcon} size={16} />
              Interactive Demo
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">One Score. Whole Life.</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Drag the sliders and watch your Life Score update across spiritual, physical, and productive dimensions.
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={1}>
            <div className="bg-gray-50 rounded-3xl border border-gray-100 p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Ring */}
                <div className="flex flex-col items-center">
                  <div className="relative mb-6">
                    <AnimatedRing progress={totalScore} size={180} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-bold text-emerald-700">{totalScore}</span>
                      <span className="text-xs text-gray-400">/ 100</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-6 text-center w-full max-w-xs">
                    {[
                      { label: 'Iman', score: scores.iman, color: 'text-emerald-600' },
                      { label: 'Wellness', score: scores.wellness, color: 'text-teal-600' },
                      { label: 'Productivity', score: scores.productivity, color: 'text-orange-600' },
                    ].map(s => (
                      <div key={s.label}>
                        <p className={`text-xl font-bold ${s.color}`}>{s.score}</p>
                        <p className="text-[11px] text-gray-400">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sliders */}
                <div className="space-y-8">
                  {([
                    { key: 'iman' as const, label: 'Iman', emoji: '🕌' },
                    { key: 'wellness' as const, label: 'Wellness', emoji: '💚' },
                    { key: 'productivity' as const, label: 'Productivity', emoji: '🎯' },
                  ]).map(({ key, label, emoji }) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">{emoji} {label}</span>
                        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">{scores[key]}</span>
                      </div>
                      <Slider
                        value={[scores[key]]}
                        onValueChange={([v]) => setScores(prev => ({ ...prev, [key]: v }))}
                        min={0} max={100} step={1}
                      />
                    </div>
                  ))}
                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
                    Try it — drag the sliders above
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 px-6 bg-gray-50/50">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">How It Works</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { target: 5, suffix: '', label: 'Daily Prayers', desc: 'Log every salah with one tap.', img: imgIman },
              { target: 72, suffix: '', label: 'Life Score', desc: 'Get your holistic daily score.', img: imgLifescore },
              { target: 30, suffix: '+', label: 'Day Streaks', desc: 'Build consistency, see growth.', img: imgQuran },
            ].map((s, i) => (
              <motion.div key={s.label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="aspect-video overflow-hidden">
                  <img src={s.img} alt={s.label} loading="lazy" className="w-full h-full object-cover object-top" />
                </div>
                <div className="p-6 text-center">
                  <p className="text-4xl font-bold text-emerald-600 mb-1">
                    <AnimatedCounter target={s.target} suffix={s.suffix} />
                  </p>
                  <h3 className="font-semibold text-gray-900 mb-1">{s.label}</h3>
                  <p className="text-sm text-gray-500">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="relative py-28 px-6 overflow-hidden">
        <img src={imgPattern} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-700/95 to-teal-800/95" />
        <div className="relative max-w-2xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
            <p className="text-xl sm:text-2xl font-medium italic leading-relaxed mb-3 text-white/90">
              &quot;The most beloved deeds to Allah are those done consistently, even if they are small.&quot;
            </p>
            <p className="text-white/40 text-sm mb-10">— Sahih al-Bukhari & Muslim</p>
            <Button asChild size="lg" className="bg-white text-emerald-700 hover:bg-white/90 text-base px-8 py-6 rounded-xl shadow-lg">
              <Link to="/auth">
                Begin Your Journey
                <HugeiconsIcon icon={ArrowRight02Icon} size={18} className="ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default Landing;
