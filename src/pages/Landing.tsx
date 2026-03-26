import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import MarketingLayout from '@/components/MarketingLayout';

import imgHero from '@/assets/landing/hero-dashboard.jpg';
import imgQuran from '@/assets/landing/quran-tracker.jpg';
import imgHealth from '@/assets/landing/health-dashboard.jpg';
import imgPattern from '@/assets/landing/pattern-bg.jpg';
import imgIman from '@/assets/features/iman.webp';
import imgLifescore from '@/assets/features/lifescore.webp';
import imgIfasting from '@/assets/features/ifasting.webp';
import imgStartFasting from '@/assets/features/start-fasting.webp';

const fade = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

/* ── Animated Ring ── */
const AnimatedRing = ({ progress }: { progress: number }) => {
  const circumference = 2 * Math.PI * 54;
  const target = (progress / 100) * circumference;
  return (
    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--border))" strokeWidth="7" />
      <motion.circle
        cx="60" cy="60" r="54" fill="none"
        stroke="hsl(var(--primary))" strokeWidth="7" strokeLinecap="round"
        animate={{ strokeDasharray: `${target} ${circumference}` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
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

/* ── Phone Frame ── */
const PhoneFrame = ({ src, alt, className = '' }: { src: string; alt: string; className?: string }) => (
  <div className={`relative mx-auto ${className}`}>
    <div className="rounded-[2rem] border-[6px] border-foreground/10 bg-foreground/5 p-1.5 shadow-2xl shadow-primary/10">
      <div className="rounded-[1.5rem] overflow-hidden bg-card">
        <img src={src} alt={alt} className="w-full h-auto" loading="lazy" />
      </div>
    </div>
  </div>
);

const pillars = [
  { title: 'Iman', desc: 'Prayer, Quran, Dhikr & Zakat tracking', img: imgIman },
  { title: 'Wellness', desc: 'BMI, sleep, hydration & fasting', img: imgHealth },
  { title: 'Wealth', desc: 'Halal budgeting & savings goals', img: imgIfasting },
  { title: 'Productivity', desc: 'Daily MITs, habits & streaks', img: imgLifescore },
];

const personas = [
  { title: 'The Practicing Muslim', desc: 'Track salah, Quran, dhikr, and fasting with beautiful streaks.', img: imgIman },
  { title: 'The Health-Conscious', desc: 'Monitor BMI, hydration, sleep, and intermittent fasting.', img: imgHealth },
  { title: 'The Ambitious Achiever', desc: 'Set MITs, build habits, manage budgets — all in one place.', img: imgStartFasting },
];

const Landing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  const [scores, setScores] = useState({ iman: 85, wellness: 64, productivity: 67 });
  const totalScore = Math.round((scores.iman + scores.wellness + scores.productivity) / 3);

  useEffect(() => {
    if (!loading && user) navigate('/onboarding', { replace: true });
  }, [user, loading, navigate]);

  return (
    <MarketingLayout>
      {/* ── Hero ── */}
      <section ref={heroRef} className="relative pt-16 pb-24 px-6 overflow-hidden">
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="text-center md:text-left">
            <motion.h1 initial="hidden" animate="visible" variants={fade} custom={0}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-[1.08] tracking-tight mb-6"
            >
              Optimize Your Life
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                For Both Worlds
              </span>
            </motion.h1>

            <motion.p initial="hidden" animate="visible" variants={fade} custom={1}
              className="text-lg text-muted-foreground max-w-md mx-auto md:mx-0 mb-8"
            >
              The all-in-one Muslim lifestyle app — track prayers, Quran, health, wealth, and productivity. Get your daily Life Score.
            </motion.p>

            <motion.div initial="hidden" animate="visible" variants={fade} custom={2}
              className="flex flex-col sm:flex-row items-center md:items-start gap-3"
            >
              <Button asChild size="lg" className="text-base px-8 py-6 rounded-xl shadow-lg shadow-primary/20">
                <Link to="/auth">Start Your Journey</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/features">Explore Features</Link>
              </Button>
            </motion.div>

            <motion.p initial="hidden" animate="visible" variants={fade} custom={3}
              className="text-sm text-muted-foreground mt-5"
            >
              Free forever · No credit card required
            </motion.p>
          </div>

          {/* Floating phone */}
          <motion.div style={{ y: heroY }} className="hidden md:block">
            <PhoneFrame src={imgHero} alt="Success Muslim Dashboard" className="max-w-[280px]" />
          </motion.div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="py-8 px-6 border-y border-border/40">
        <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}
          className="text-center text-muted-foreground text-sm tracking-widest uppercase"
        >
          5 Pillars &nbsp;·&nbsp; 90+ Features &nbsp;·&nbsp; Free Forever
        </motion.p>
      </section>

      {/* ── Interactive Life Score ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">One score. Whole life.</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Drag the sliders to see how your Life Score changes across spiritual, physical, and productive dimensions.
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={1}
            className="grid md:grid-cols-2 gap-10 items-center"
          >
            {/* Ring */}
            <div className="bg-card rounded-2xl border border-border p-8 shadow-xl shadow-primary/5 mx-auto max-w-xs w-full">
              <div className="relative w-40 h-40 mx-auto mb-6">
                <AnimatedRing progress={totalScore} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold text-primary">{totalScore}</span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: 'Iman', score: scores.iman },
                  { label: 'Wellness', score: scores.wellness },
                  { label: 'Productivity', score: scores.productivity },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-lg font-bold text-foreground">{s.score}</p>
                    <p className="text-[11px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-8">
              {([
                { key: 'iman' as const, label: 'Iman' },
                { key: 'wellness' as const, label: 'Wellness' },
                { key: 'productivity' as const, label: 'Productivity' },
              ]).map(({ key, label }) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{label}</span>
                    <span className="text-sm font-bold text-primary">{scores[key]}</span>
                  </div>
                  <Slider
                    value={[scores[key]]}
                    onValueChange={([v]) => setScores(prev => ({ ...prev, [key]: v }))}
                    min={0} max={100} step={1}
                  />
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Try it — drag the sliders and watch your Life Score update in real-time.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Pillars (Image cards) ── */}
      <section className="py-24 px-6 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Four Pillars of Growth</h2>
            <p className="text-muted-foreground">Everything you need, nothing you don't.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pillars.map((p, i) => (
              <motion.div key={p.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer"
              >
                <img src={p.img} alt={p.title} loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-bold text-primary-foreground text-lg">{p.title}</h3>
                  <p className="text-primary-foreground/70 text-xs leading-relaxed">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works (Counters + images) ── */}
      <section className="py-24 px-6 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold">How It Works</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { target: 5, suffix: '', label: 'Daily Prayers', desc: 'Log every salah with one tap.', img: imgIman },
              { target: 72, suffix: '', label: 'Life Score', desc: 'Get your holistic daily score.', img: imgLifescore },
              { target: 30, suffix: '+', label: 'Day Streaks', desc: 'Build consistency, see growth.', img: imgQuran },
            ].map((s, i) => (
              <motion.div key={s.label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}
                className="text-center"
              >
                <div className="rounded-2xl overflow-hidden border border-border mb-5 aspect-video bg-card">
                  <img src={s.img} alt={s.label} loading="lazy" className="w-full h-full object-cover object-top" />
                </div>
                <p className="text-4xl font-bold text-primary mb-1">
                  <AnimatedCounter target={s.target} suffix={s.suffix} />
                </p>
                <h3 className="font-semibold text-foreground mb-1">{s.label}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who It's For (Horizontal scroll) ── */}
      <section className="py-24 px-6 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Built For You</h2>
            <p className="text-muted-foreground">No matter where you are in your journey.</p>
          </motion.div>

          <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 scrollbar-hide">
            {personas.map((p, i) => (
              <motion.div key={p.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}
                className="min-w-[280px] sm:min-w-[320px] snap-center rounded-2xl border border-border bg-card overflow-hidden flex-shrink-0"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={p.img} alt={p.title} loading="lazy" className="w-full h-full object-cover" />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-foreground mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="relative py-28 px-6 overflow-hidden">
        <img src={imgPattern} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-primary/90" />
        <div className="relative max-w-2xl mx-auto text-center">
          <p className="text-xl sm:text-2xl font-medium italic leading-relaxed mb-3 text-primary-foreground/90">
            &quot;The most beloved deeds to Allah are those done consistently, even if they are small.&quot;
          </p>
          <p className="text-primary-foreground/50 text-sm mb-10">— Sahih al-Bukhari & Muslim</p>
          <Button asChild size="lg" variant="secondary" className="text-base px-8 py-6 rounded-xl">
            <Link to="/auth">Begin Your Journey</Link>
          </Button>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default Landing;
