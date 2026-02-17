import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calculator, CalendarCheck, Clock, ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.6, ease: [0, 0, 0.2, 1] as const } }),
};

const features = [
  { icon: Clock, title: 'Qada Solat Tracker', desc: 'Calculate your missed prayers and track your progress daily with a clear plan to completion.', color: 'bg-primary/10 text-primary' },
  { icon: CalendarCheck, title: 'Ramadhan Qada Tracker', desc: 'Track missed Ramadhan fasts with smart scheduling on recommended days.', color: 'bg-accent/20 text-accent-foreground' },
  { icon: Calculator, title: 'Fidyah Calculator', desc: 'Instantly calculate your fidyah obligation with a simple, clear breakdown.', color: 'bg-primary/10 text-primary' },
];

const steps = [
  { num: '01', title: 'Calculate', desc: 'Input your details and we calculate your obligations automatically.' },
  { num: '02', title: 'Plan', desc: 'Set a daily target and see your estimated completion date.' },
  { num: '03', title: 'Track', desc: 'Mark your progress daily and watch your spiritual debt decrease.' },
];

const Landing = () => (
  <div className="min-h-screen bg-background">
    {/* Nav */}
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="text-lg font-bold text-primary">☪ Success Muslim</span>
        <Button asChild size="sm">
          <Link to="/dashboard">Get Started</Link>
        </Button>
      </div>
    </nav>

    {/* Hero */}
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">
          Your Companion For Success In Both Worlds
        </motion.p>
        <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1} className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight mb-6">
          Clear Your<br />
          <span className="text-primary">Spiritual Debt</span>
        </motion.h1>
        <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
          Calculate your missed prayers and fasts, create a realistic plan, and track your daily progress. Start your journey back — one prayer at a time.
        </motion.p>
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
          <Button asChild size="lg" className="text-base px-8 py-6 rounded-xl shadow-lg">
            <Link to="/dashboard">Start Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </motion.div>
      </div>
    </section>

    {/* Features */}
    <section className="py-20 px-6 bg-secondary/50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">Everything You Need</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">Three powerful tools to help you fulfill your obligations with clarity and confidence.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              className="bg-card rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-border">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${f.color}`}>
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* How It Works */}
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <motion.div key={s.num} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i} className="text-center">
              <div className="text-4xl font-bold text-primary/20 mb-3">{s.num}</div>
              <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
              {i < 2 && <ChevronRight className="hidden md:block mx-auto mt-4 text-primary/30 h-6 w-6" />}
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Bottom CTA */}
    <section className="py-20 px-6 bg-primary text-primary-foreground">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Every Prayer Counts</h2>
        <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
          Start today. Consistency is beloved to Allah. Even one qada a day brings you closer.
        </p>
        <Button asChild size="lg" variant="secondary" className="text-base px-8 py-6 rounded-xl">
          <Link to="/dashboard">Begin Your Journey <ArrowRight className="ml-2 h-5 w-5" /></Link>
        </Button>
      </div>
    </section>

    {/* Footer */}
    <footer className="py-8 px-6 text-center text-sm text-muted-foreground border-t border-border">
      <p>© 2026 Success Muslim. Built with purpose.</p>
    </footer>
  </div>
);

export default Landing;
