import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Moon, Heart, Wallet, ListChecks, Users, Star,
  Clock, BookOpen, Calculator, Sparkles, Target, TrendingUp,
  ChevronRight, Zap, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import EditableText from '@/components/cms/EditableText';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0, 0, 0.2, 1] as const } }),
};

const pillars = [
  { icon: Moon, title: 'Iman', desc: 'Prayer tracking, Qada Solat, Dhikr counter, Quran logging, Zakat calculator, Sunnah tracker', color: 'from-primary/20 to-primary/5' },
  { icon: Heart, title: 'Wellness', desc: 'BMI calculator, calorie tracking, sleep discipline, hydration goals, Sunnah fasting', color: 'from-accent/20 to-accent/5' },
  { icon: Wallet, title: 'Wealth', desc: 'Halal budgeting, Sadaqah goals, debt tracking, savings planner', color: 'from-primary/20 to-primary/5' },
  { icon: ListChecks, title: 'Productivity', desc: 'Daily MITs, habit streaks, life-area tasks, focus sessions', color: 'from-accent/20 to-accent/5' },
  { icon: Users, title: 'Family', desc: "Shared calendars, kids' Quran progress, chore delegation, family goals", color: 'from-primary/20 to-primary/5' },
];

const features = [
  { icon: Clock, title: 'Prayer Times', desc: 'Auto-detected daily prayer times with next-prayer alerts' },
  { icon: BookOpen, title: 'Dhikr Counter', desc: 'Digital tasbih with daily goals and streak tracking' },
  { icon: Target, title: 'Qada Solat Tracker', desc: 'Calculate missed prayers and track your repayment plan' },
  { icon: Calculator, title: 'Zakat Calculator', desc: 'Accurate zakat computation with nisab thresholds' },
  { icon: Sparkles, title: 'Sunnah Tracker', desc: 'Daily sunnah habits with streaks and heat maps' },
  { icon: TrendingUp, title: 'Life Score', desc: 'Composite score across Iman, Wellness & Productivity' },
];

const steps = [
  { num: '01', title: 'Track', desc: 'Log your prayers, habits, health, and goals in one unified dashboard.' },
  { num: '02', title: 'Score', desc: 'Get a daily Life Score that reflects your holistic progress.' },
  { num: '03', title: 'Improve', desc: 'See trends, build streaks, and improve across all five pillars.' },
];

const testimonials = [
  { name: 'Ahmad R.', text: 'Finally an app that understands the Muslim lifestyle. The Qada tracker alone changed my life.', role: 'Software Engineer' },
  { name: 'Fatimah S.', text: 'I love how everything is in one place — my prayers, my health, my goals. Beautifully designed.', role: 'Medical Student' },
  { name: 'Yusuf K.', text: 'The Life Score concept is brilliant. It keeps me accountable across all areas of my life.', role: 'Entrepreneur' },
];

const Landing = () => {
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    supabase.from('app_stats').select('stat_key, stat_value').then(({ data }) => {
      if (data) {
        const map: Record<string, number> = {};
        data.forEach(s => { map[s.stat_key] = Number(s.stat_value); });
        setStats(map);
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Geometric pattern overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23166534' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-bold text-primary flex items-center gap-2">
            <Moon className="h-5 w-5" />
            <EditableText elementKey="nav.brand" defaultText="Success Muslim" tag="span" />
          </span>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth"><EditableText elementKey="nav.signin" defaultText="Sign In" tag="span" /></Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth"><EditableText elementKey="nav.getstarted" defaultText="Get Started" tag="span" /></Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-4 py-2 rounded-full mb-6"
          >
            <Zap className="h-3.5 w-3.5" />
            <EditableText elementKey="hero.badge" defaultText="The All-in-One Life System for Muslims" tag="span" />
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] mb-6">
              <EditableText elementKey="hero.title" defaultText="Optimize Your Life" tag="span" /><br />
              <span className="text-primary"><EditableText elementKey="hero.title2" defaultText="For Both Worlds" tag="span" /></span>
            </h1>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
            <EditableText elementKey="hero.subtitle" defaultText="Track your prayers, health, wealth, productivity, and family — all in one beautiful app. Get a daily Life Score and build consistent habits that matter." tag="p" className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10" />
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button asChild size="lg" className="text-base px-8 py-6 rounded-xl shadow-lg">
              <Link to="/auth"><EditableText elementKey="hero.cta" defaultText="Start Free" tag="span" /> <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base px-8 py-6 rounded-xl">
              <a href="#how-it-works"><EditableText elementKey="hero.cta2" defaultText="See How It Works" tag="span" /></a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Life Score Preview */}
      <section className="py-20 px-6 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="text-center mb-12"
          >
            <EditableText elementKey="lifescore.title" defaultText="Your Life Score" tag="h2" className="text-3xl sm:text-4xl font-bold mb-4" />
            <EditableText elementKey="lifescore.desc" defaultText="One number that reflects your holistic progress across spiritual, physical, and productive dimensions." tag="p" className="text-muted-foreground max-w-lg mx-auto" />
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
            <Card className="max-w-md mx-auto border-2 border-primary/10">
              <CardContent className="p-8 text-center">
                <div className="relative w-40 h-40 mx-auto mb-6">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
                    <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
                      strokeDasharray={`${0.72 * 339.292} 339.292`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-primary">72</span>
                    <span className="text-xs text-muted-foreground">/ 100</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { label: 'Iman', score: 85, color: 'text-primary' },
                    { label: 'Wellness', score: 64, color: 'text-accent-foreground' },
                    { label: 'Productivity', score: 67, color: 'text-primary' },
                  ].map(s => (
                    <div key={s.label}>
                      <p className={`text-xl font-bold ${s.color}`}>{s.score}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* 5 Pillars */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="text-center mb-12"
          >
            <EditableText elementKey="pillars.heading" defaultText="Five Pillars of Success" tag="h2" className="text-3xl sm:text-4xl font-bold mb-4" />
            <EditableText elementKey="pillars.desc" defaultText="A comprehensive framework covering every dimension of the Muslim lifestyle." tag="p" className="text-muted-foreground max-w-lg mx-auto" />
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pillars.map((p, i) => (
              <motion.div key={p.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card className="h-full hover:shadow-lg transition-shadow border-border">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-4`}>
                      <p.icon className="h-6 w-6 text-foreground" />
                    </div>
                    <EditableText elementKey={`pillar.${i}.title`} defaultText={p.title} tag="h3" className="text-lg font-semibold mb-2" />
                    <EditableText elementKey={`pillar.${i}.desc`} defaultText={p.desc} tag="p" className="text-sm text-muted-foreground leading-relaxed" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 px-6 bg-secondary/30">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="text-center mb-12"
          >
            <EditableText elementKey="features.heading" defaultText="Powerful Tools" tag="h2" className="text-3xl sm:text-4xl font-bold mb-4" />
            <EditableText elementKey="features.desc" defaultText="Purpose-built features designed for the Muslim lifestyle." tag="p" className="text-muted-foreground max-w-lg mx-auto" />
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <EditableText elementKey={`feature.${i}.title`} defaultText={f.title} tag="h3" className="font-semibold text-sm mb-1" />
                      <EditableText elementKey={`feature.${i}.desc`} defaultText={f.desc} tag="p" className="text-xs text-muted-foreground leading-relaxed" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Users', value: stats.total_users || 0, suffix: '+' },
              { label: 'Prayers Tracked', value: stats.total_prayers || 0, suffix: '+' },
              { label: 'Dhikr Counted', value: stats.total_dhikr || 0, suffix: '+' },
              { label: 'Fasts Logged', value: stats.total_fasts || 0, suffix: '+' },
            ].map((s, i) => (
              <motion.div key={s.label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <p className="text-3xl font-bold text-primary">{s.value.toLocaleString()}{s.suffix}</p>
                <EditableText elementKey={`stat.${i}.label`} defaultText={s.label} tag="p" className="text-sm text-muted-foreground mt-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="text-center mb-12"
          >
            <EditableText elementKey="howitworks.heading" defaultText="How It Works" tag="h2" className="text-3xl sm:text-4xl font-bold mb-4" />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div key={s.num} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="text-center"
              >
                <div className="text-5xl font-bold text-primary/20 mb-3">{s.num}</div>
                <EditableText elementKey={`step.${i}.title`} defaultText={s.title} tag="h3" className="text-lg font-semibold mb-2" />
                <EditableText elementKey={`step.${i}.desc`} defaultText={s.desc} tag="p" className="text-sm text-muted-foreground" />
                {i < 2 && <ChevronRight className="hidden md:block mx-auto mt-4 text-primary/30 h-6 w-6" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="text-center mb-12"
          >
            <EditableText elementKey="testimonials.heading" defaultText="What Users Say" tag="h2" className="text-3xl sm:text-4xl font-bold mb-4" />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 italic">"<EditableText elementKey={`testimonial.${i}.text`} defaultText={t.text} tag="span" />"</p>
                    <div>
                      <EditableText elementKey={`testimonial.${i}.name`} defaultText={t.name} tag="p" className="font-semibold text-sm" />
                      <EditableText elementKey={`testimonial.${i}.role`} defaultText={t.role} tag="p" className="text-xs text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-6 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <Shield className="h-12 w-12 mx-auto mb-6 opacity-80" />
          <EditableText elementKey="cta.title" defaultText="Every Prayer Counts" tag="h2" className="text-2xl sm:text-3xl font-bold mb-4" />
          <EditableText elementKey="cta.quote" defaultText="&quot;The most beloved deeds to Allah are those done consistently, even if they are small.&quot;" tag="p" className="text-primary-foreground/80 mb-2 text-lg italic" />
          <EditableText elementKey="cta.attribution" defaultText="— Sahih al-Bukhari & Muslim" tag="p" className="text-primary-foreground/60 text-sm mb-8" />
          <Button asChild size="lg" variant="secondary" className="text-base px-8 py-6 rounded-xl">
            <Link to="/auth"><EditableText elementKey="cta.button" defaultText="Begin Your Journey" tag="span" /> <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm font-semibold text-primary flex items-center gap-2">
            <Moon className="h-4 w-4" /> <EditableText elementKey="footer.brand" defaultText="Success Muslim" tag="span" />
          </span>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
          <EditableText elementKey="footer.copyright" defaultText="© 2026 Success Muslim. Built with purpose." tag="p" className="text-xs text-muted-foreground" />
        </div>
      </footer>
    </div>
  );
};

export default Landing;
