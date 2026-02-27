import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BookOpen, Heart, Wallet, ListChecks, Users,
  Clock, Droplets, Moon, Footprints, Scale, Timer,
  Calculator, PiggyBank, Target, Flame, BarChart3,
  Trophy, Activity, Bell, HandHeart, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import MarketingLayout from '@/components/MarketingLayout';

const fade = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

interface FeatureItem {
  icon: React.ElementType;
  title: string;
  desc: string;
}

interface PillarSection {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  features: FeatureItem[];
}

const pillars: PillarSection[] = [
  {
    icon: BookOpen,
    title: 'Iman',
    subtitle: 'Strengthen Your Faith',
    description: 'Track your spiritual practices consistently. From daily prayers to Quran reading, build habits that bring you closer to Allah.',
    color: 'text-primary',
    features: [
      { icon: Clock, title: 'Prayer Times & Tracking', desc: 'Accurate prayer times with full salah logging and streak tracking.' },
      { icon: BookOpen, title: 'Quran Reader & Tracker', desc: 'Read, bookmark, and track your daily Quran reading progress.' },
      { icon: Bell, title: 'Dhikr Counter', desc: 'Digital tasbih with presets for SubhanAllah, Alhamdulillah, and more.' },
      { icon: Calculator, title: 'Zakat Calculator', desc: 'Calculate your annual zakat with nisab checks and payment tracking.' },
      { icon: Moon, title: 'Fasting Log', desc: 'Track Ramadan, Sunnah, and qada fasting days.' },
      { icon: HandHeart, title: 'Sadaqah Tracker', desc: 'Log charitable giving with categories and monthly goals.' },
    ],
  },
  {
    icon: Heart,
    title: 'Health',
    subtitle: 'Honor Your Body',
    description: 'Your body is an amanah. Track BMI, hydration, sleep, steps, and intermittent fasting to maintain optimal health.',
    color: 'text-red-500',
    features: [
      { icon: Scale, title: 'BMI & Weight Tracking', desc: 'Monitor your BMI, TDEE, and weight trends over time.' },
      { icon: Droplets, title: 'Hydration Tracker', desc: 'Hit your daily water intake goals with visual progress.' },
      { icon: Moon, title: 'Sleep Monitor', desc: 'Log bedtime, wake time, and track sleep duration trends.' },
      { icon: Footprints, title: 'Steps Counter', desc: 'Track daily steps, distance, and calories burned.' },
      { icon: Timer, title: 'IF Timer', desc: 'Intermittent fasting timer with multiple protocols (16:8, 18:6, 20:4).' },
      { icon: Activity, title: 'Health Dashboard', desc: 'Overview of all health metrics in one beautiful dashboard.' },
    ],
  },
  {
    icon: Wallet,
    title: 'Wealth',
    subtitle: 'Manage Your Rizq',
    description: 'Practice halal financial management. Budget wisely, save purposefully, and fulfill your zakat obligations.',
    color: 'text-amber-500',
    features: [
      { icon: Calculator, title: 'Budget Tracker', desc: 'Track income and expenses with halal-focused categories.' },
      { icon: PiggyBank, title: 'Savings Goals', desc: 'Set and track savings goals for Hajj, emergency fund, and more.' },
      { icon: Calculator, title: 'Zakat Calculator', desc: 'Integrated zakat calculation with wealth tracking.' },
    ],
  },
  {
    icon: ListChecks,
    title: 'Productivity',
    subtitle: 'Make Every Day Count',
    description: 'Focus on what matters most. Set daily MITs (Most Important Tasks), build habits, and evaluate your life areas.',
    color: 'text-blue-500',
    features: [
      { icon: Target, title: 'Daily MITs', desc: 'Focus on 3 Most Important Tasks each day for maximum impact.' },
      { icon: Flame, title: 'Habit Streaks', desc: 'Build consistent habits with visual streak tracking.' },
      { icon: BarChart3, title: 'Life Areas', desc: 'Score and improve across all dimensions of your life.' },
    ],
  },
  {
    icon: Users,
    title: 'Family',
    subtitle: 'Grow Together',
    description: 'Create a family group, share progress on a leaderboard, and motivate each other towards consistent growth.',
    color: 'text-purple-500',
    features: [
      { icon: Users, title: 'Family Dashboard', desc: 'See how your family is doing at a glance.' },
      { icon: Trophy, title: 'Leaderboard', desc: 'Friendly competition to encourage consistent ibadah.' },
      { icon: Activity, title: 'Activity Feed', desc: 'Stay connected with your family\'s daily achievements.' },
    ],
  },
];

const Features = () => (
  <MarketingLayout>
    {/* Hero */}
    <section className="pt-20 pb-16 px-6 text-center">
      <motion.div initial="hidden" animate="visible" variants={fade} custom={0}>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground tracking-tight mb-4">
          Everything You Need<br />
          <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            to Grow
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Five pillars of growth in one app — Iman, Health, Wealth, Productivity, and Family. Explore every feature designed to help you thrive in dunya and akhirah.
        </p>
      </motion.div>
    </section>

    {/* Pillar Sections */}
    {pillars.map((pillar, idx) => (
      <section
        key={pillar.title}
        className="py-20 px-6 border-t border-border/40"
      >
        <div className={`max-w-5xl mx-auto flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 items-start`}>
          {/* Text side */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fade}
            custom={0}
            className="flex-1 md:max-w-md"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <pillar.icon className={`h-6 w-6 ${pillar.color}`} />
            </div>
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-1">
              {pillar.title}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              {pillar.subtitle}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {pillar.description}
            </p>
          </motion.div>

          {/* Feature grid */}
          <div className="flex-1 grid sm:grid-cols-2 gap-4">
            {pillar.features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fade}
                custom={i + 1}
                className="rounded-xl border border-border bg-card p-5 hover:shadow-md hover:shadow-primary/5 transition-shadow"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <f.icon className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    ))}

    {/* Bottom CTA */}
    <section className="py-24 px-6 bg-primary text-primary-foreground">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-primary-foreground">
            Ready to Transform Your Life?
          </h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            Join thousands of Muslims tracking their growth across all five pillars. Free forever.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-base px-8 py-6 rounded-xl">
            <Link to="/auth">
              Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  </MarketingLayout>
);

export default Features;
