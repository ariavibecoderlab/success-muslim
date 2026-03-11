import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Heart, Wallet, ListChecks, BookOpen, Star, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import EditableText from '@/components/cms/EditableText';
import MarketingLayout from '@/components/MarketingLayout';

const fade = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const pillars = [
  { icon: BookOpen, title: 'Iman', desc: 'Prayer, Quran, Dhikr & Zakat' },
  { icon: Heart, title: 'Wellness', desc: 'BMI, sleep, hydration & fasting' },
  { icon: Wallet, title: 'Wealth', desc: 'Halal budgeting & savings goals' },
  { icon: ListChecks, title: 'Productivity', desc: 'Daily MITs, habits & streaks' },
];

const steps = [
  { num: '01', title: 'Track', desc: 'Log prayers, health, and goals.' },
  { num: '02', title: 'Score', desc: 'Get your daily Life Score.' },
  { num: '03', title: 'Improve', desc: 'Build streaks, see trends.' },
];

const highlights = [
  { value: '5', label: 'Pillars Tracked', icon: Star },
  { value: '90+', label: 'Features', icon: Zap },
  { value: '100%', label: 'Free Forever', icon: Heart },
];

const personas = [
  {
    title: 'The Practicing Muslim',
    desc: 'Track salah, Quran reading, dhikr, and fasting — all with beautiful streaks and reminders.',
    icon: BookOpen,
  },
  {
    title: 'The Health-Conscious Muslim',
    desc: 'Monitor BMI, hydration, sleep, steps, and intermittent fasting with an Islamic-aligned approach.',
    icon: Heart,
  },
  {
    title: 'The Ambitious Muslim',
    desc: 'Set daily MITs, build habits, manage halal budgets, and track savings goals — all in one place.',
    icon: Zap,
  },
];

/* Animated ring for Life Score */
const AnimatedRing = () => {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const circumference = 2 * Math.PI * 54;
  const target = 0.72 * circumference;

  return (
    <svg ref={ref} className="w-full h-full -rotate-90" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--border))" strokeWidth="7" />
      <motion.circle
        cx="60" cy="60" r="54" fill="none"
        stroke="hsl(var(--primary))" strokeWidth="7" strokeLinecap="round"
        initial={{ strokeDasharray: `0 ${circumference}` }}
        animate={inView ? { strokeDasharray: `${target} ${circumference}` } : undefined}
        transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] as const }}
      />
    </svg>
  );
};

const Landing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate('/onboarding', { replace: true });
  }, [user, loading, navigate]);

  return (
    <MarketingLayout>
      {/* ── Hero ── */}
      <section className="relative pt-20 pb-28 px-6">
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={fade} custom={0}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-foreground leading-[1.08] tracking-tight mb-6">
              <EditableText elementKey="hero.title" defaultText="Optimize Your Life" tag="span" />
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                <EditableText elementKey="hero.title2" defaultText="For Both Worlds" tag="span" />
              </span>
            </h1>
          </motion.div>

          <motion.p initial="hidden" animate="visible" variants={fade} custom={1}
            className="text-lg text-muted-foreground max-w-md mx-auto mb-10"
          >
            The all-in-one Muslim lifestyle app — track prayers, Quran, health, wealth, and productivity. Get your daily Life Score and grow in dunya and akhirah.
          </motion.p>

          <motion.div initial="hidden" animate="visible" variants={fade} custom={2}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button asChild size="lg" className="text-base px-8 py-6 rounded-xl shadow-lg shadow-primary/20">
              <Link to="/auth">Start Your Journey <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base">
              <Link to="/features">Explore Features</Link>
            </Button>
          </motion.div>

          <motion.p initial="hidden" animate="visible" variants={fade} custom={3}
            className="text-sm text-muted-foreground mt-6"
          >
            Free forever. No credit card required.
          </motion.p>
        </div>
      </section>

      {/* ── Features at a Glance ── */}
      <section className="py-10 px-6 border-y border-border/40">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-8 sm:gap-16 flex-wrap">
          {highlights.map((h, i) => (
            <motion.div key={h.label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}
              className="flex items-center gap-3 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <h.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-foreground">{h.value}</p>
                <p className="text-xs text-muted-foreground">{h.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Life Score ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
            <EditableText elementKey="lifescore.title" defaultText="One score. Whole life." tag="h2"
              className="text-3xl sm:text-4xl font-bold mb-3" />
            <EditableText elementKey="lifescore.desc" defaultText="Your holistic progress across spiritual, physical, and productive dimensions." tag="p"
              className="text-muted-foreground max-w-md mx-auto mb-10" />
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={1}
            className="max-w-xs mx-auto"
          >
            <div className="bg-card rounded-2xl border border-border p-8 shadow-xl shadow-primary/5 hover:scale-[1.02] transition-transform duration-300">
              <div className="relative w-36 h-36 mx-auto mb-6">
                <AnimatedRing />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-primary">72</span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: 'Iman', score: 85 },
                  { label: 'Wellness', score: 64 },
                  { label: 'Productivity', score: 67 },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-lg font-bold text-foreground">{s.score}</p>
                    <p className="text-[11px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Pillars (Bento) ── */}
      <section className="py-24 px-6 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}
            className="text-center mb-12"
          >
            <EditableText elementKey="pillars.heading" defaultText="Four Pillars of Growth" tag="h2"
              className="text-3xl sm:text-4xl font-bold mb-3" />
            <EditableText elementKey="pillars.desc" defaultText="Everything you need, nothing you don't." tag="p"
              className="text-muted-foreground" />
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {pillars.map((p, i) => (
              <motion.div key={p.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}
                className={`rounded-2xl border border-border bg-card p-6 ${i === 0 ? 'sm:col-span-2 sm:row-span-1' : ''}`}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <p.icon className="h-5 w-5 text-primary" />
                </div>
                <EditableText elementKey={`pillar.${i}.title`} defaultText={p.title} tag="h3"
                  className="font-semibold text-foreground mb-1" />
                <EditableText elementKey={`pillar.${i}.desc`} defaultText={p.desc} tag="p"
                  className="text-sm text-muted-foreground" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works (Timeline) ── */}
      <section className="py-24 px-6 border-t border-border/40">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}
            className="text-center mb-14"
          >
            <EditableText elementKey="howitworks.heading" defaultText="How It Works" tag="h2"
              className="text-3xl sm:text-4xl font-bold" />
          </motion.div>

          {/* Desktop: horizontal */}
          <div className="hidden md:flex items-start justify-between relative">
            <div className="absolute top-6 left-[calc(16.67%+12px)] right-[calc(16.67%+12px)] h-px bg-border" />
            {steps.map((s, i) => (
              <motion.div key={s.num} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}
                className="flex-1 text-center relative"
              >
                <div className="w-12 h-12 rounded-full border-2 border-primary bg-background flex items-center justify-center mx-auto mb-4 relative z-10">
                  <span className="text-sm font-bold text-primary">{s.num}</span>
                </div>
                <EditableText elementKey={`step.${i}.title`} defaultText={s.title} tag="h3"
                  className="font-semibold mb-1" />
                <EditableText elementKey={`step.${i}.desc`} defaultText={s.desc} tag="p"
                  className="text-sm text-muted-foreground" />
              </motion.div>
            ))}
          </div>

          {/* Mobile: vertical */}
          <div className="md:hidden space-y-8 relative pl-8">
            <div className="absolute left-[23px] top-6 bottom-6 w-px bg-border" />
            {steps.map((s, i) => (
              <motion.div key={s.num} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}
                className="relative"
              >
                <div className="absolute -left-8 w-12 h-12 rounded-full border-2 border-primary bg-background flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{s.num}</span>
                </div>
                <div className="ml-8">
                  <EditableText elementKey={`step.${i}.title`} defaultText={s.title} tag="h3"
                    className="font-semibold mb-1" />
                  <EditableText elementKey={`step.${i}.desc`} defaultText={s.desc} tag="p"
                    className="text-sm text-muted-foreground" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who It's For ── */}
      <section className="py-24 px-6 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}
            className="text-center mb-12"
          >
            <EditableText elementKey="personas.heading" defaultText="Built For You" tag="h2"
              className="text-3xl sm:text-4xl font-bold mb-3" />
            <EditableText elementKey="personas.desc" defaultText="No matter where you are in your journey." tag="p"
              className="text-muted-foreground" />
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-5">
            {personas.map((p, i) => (
              <motion.div key={p.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}
                className="rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:shadow-primary/5 transition-shadow duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <p.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-28 px-6 bg-primary text-primary-foreground">
        <div className="max-w-2xl mx-auto text-center">
          <EditableText elementKey="cta.quote"
            defaultText="&quot;The most beloved deeds to Allah are those done consistently, even if they are small.&quot;"
            tag="p" className="text-xl sm:text-2xl font-medium italic leading-relaxed mb-3 text-primary-foreground/90" />
          <EditableText elementKey="cta.attribution" defaultText="— Sahih al-Bukhari & Muslim" tag="p"
            className="text-primary-foreground/50 text-sm mb-10" />
          <Button asChild size="lg" variant="secondary" className="text-base px-8 py-6 rounded-xl">
            <Link to="/auth">
              <EditableText elementKey="cta.button" defaultText="Begin Your Journey" tag="span" />
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default Landing;
