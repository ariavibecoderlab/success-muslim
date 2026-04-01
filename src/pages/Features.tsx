import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MarketingLayout from '@/components/MarketingLayout';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Mosque02Icon, HealthIcon, MoneyBag02Icon, Target02Icon,
  UserMultipleIcon, Clock01Icon, BookOpen01Icon, Notification03Icon,
  Calculator01Icon, Moon02Icon, HandPrayerIcon, BodyWeightIcon,
  DropletIcon, SleepingIcon, RunningShoesIcon, Timer02Icon,
  Activity01Icon, PiggyBankIcon, Fire03Icon, BarChartIcon,
  Award01Icon, ArrowRight01Icon,
} from '@hugeicons/core-free-icons';

import imgLifescore from '@/assets/features/lifescore.webp';
import imgIman from '@/assets/features/iman.webp';
import imgHealth from '@/assets/features/health.webp';
import imgIfasting from '@/assets/features/ifasting.webp';
import imgIfTimerRunning from '@/assets/features/if-timer-running.webp';
import imgStartFasting from '@/assets/features/start-fasting.webp';

const fade = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

interface FeatureItem {
  icon: any;
  title: string;
  desc: string;
}

interface PillarSection {
  icon: any;
  title: string;
  subtitle: string;
  description: string;
  gradient: string;
  iconBg: string;
  features: FeatureItem[];
  image?: string;
  extraImages?: string[];
}

const pillars: PillarSection[] = [
  {
    icon: Mosque02Icon,
    title: 'Iman',
    subtitle: 'Strengthen Your Faith',
    description: 'Track your spiritual practices consistently. From daily prayers to Quran reading, build habits that bring you closer to Allah.',
    gradient: 'from-emerald-600 to-teal-700',
    iconBg: 'bg-emerald-100 text-emerald-700',
    image: imgIman,
    features: [
      { icon: Clock01Icon, title: 'Prayer Times & Tracking', desc: 'Accurate prayer times with full salah logging and streak tracking.' },
      { icon: BookOpen01Icon, title: 'Quran Reader & Tracker', desc: 'Read, bookmark, and track your daily Quran reading progress.' },
      { icon: Notification03Icon, title: 'Dhikr Counter', desc: 'Digital tasbih with presets for SubhanAllah, Alhamdulillah, and more.' },
      { icon: Calculator01Icon, title: 'Zakat Calculator', desc: 'Calculate your annual zakat with nisab checks and payment tracking.' },
      { icon: Moon02Icon, title: 'Fasting Log', desc: 'Track Ramadan, Sunnah, and qada fasting days.' },
      { icon: HandPrayerIcon, title: 'Sadaqah Tracker', desc: 'Log charitable giving with categories and monthly goals.' },
    ],
  },
  {
    icon: HealthIcon,
    title: 'Health',
    subtitle: 'Honor Your Body',
    description: 'Your body is an amanah. Track BMI, hydration, sleep, steps, and intermittent fasting to maintain optimal health.',
    gradient: 'from-teal-500 to-cyan-600',
    iconBg: 'bg-teal-100 text-teal-700',
    image: imgHealth,
    extraImages: [imgIfasting, imgIfTimerRunning, imgStartFasting],
    features: [
      { icon: BodyWeightIcon, title: 'BMI & Weight Tracking', desc: 'Monitor your BMI, TDEE, and weight trends over time.' },
      { icon: DropletIcon, title: 'Hydration Tracker', desc: 'Hit your daily water intake goals with visual progress.' },
      { icon: SleepingIcon, title: 'Sleep Monitor', desc: 'Log bedtime, wake time, and track sleep duration trends.' },
      { icon: RunningShoesIcon, title: 'Steps Counter', desc: 'Track daily steps, distance, and calories burned.' },
      { icon: Timer02Icon, title: 'IF Timer', desc: 'Intermittent fasting timer with multiple protocols (16:8, 18:6, 20:4).' },
      { icon: Activity01Icon, title: 'Health Dashboard', desc: 'Overview of all health metrics in one beautiful dashboard.' },
    ],
  },
  {
    icon: MoneyBag02Icon,
    title: 'Wealth',
    subtitle: 'Manage Your Rizq',
    description: 'Practice halal financial management. Budget wisely, save purposefully, and fulfill your zakat obligations.',
    gradient: 'from-orange-500 to-amber-600',
    iconBg: 'bg-orange-100 text-orange-700',
    features: [
      { icon: Calculator01Icon, title: 'Budget Tracker', desc: 'Track income and expenses with halal-focused categories.' },
      { icon: PiggyBankIcon, title: 'Savings Goals', desc: 'Set and track savings goals for Hajj, emergency fund, and more.' },
      { icon: Calculator01Icon, title: 'Zakat Calculator', desc: 'Integrated zakat calculation with wealth tracking.' },
    ],
  },
  {
    icon: Target02Icon,
    title: 'Productivity',
    subtitle: 'Make Every Day Count',
    description: 'Focus on what matters most. Set daily MITs (Most Important Tasks), build habits, and evaluate your life areas.',
    gradient: 'from-amber-500 to-yellow-600',
    iconBg: 'bg-amber-100 text-amber-700',
    features: [
      { icon: Target02Icon, title: 'Daily MITs', desc: 'Focus on 3 Most Important Tasks each day for maximum impact.' },
      { icon: Fire03Icon, title: 'Habit Streaks', desc: 'Build consistent habits with visual streak tracking.' },
      { icon: BarChartIcon, title: 'Life Areas', desc: 'Score and improve across all dimensions of your life.' },
    ],
  },
  {
    icon: UserMultipleIcon,
    title: 'Family',
    subtitle: 'Grow Together',
    description: 'Create a family group, share progress on a leaderboard, and motivate each other towards consistent growth.',
    gradient: 'from-purple-500 to-violet-600',
    iconBg: 'bg-purple-100 text-purple-700',
    features: [
      { icon: UserMultipleIcon, title: 'Family Dashboard', desc: 'See how your family is doing at a glance.' },
      { icon: Trophy01Icon, title: 'Leaderboard', desc: 'Friendly competition to encourage consistent ibadah.' },
      { icon: Activity01Icon, title: 'Activity Feed', desc: "Stay connected with your family's daily achievements." },
    ],
  },
];

const PhoneMockup = ({ src, alt, className = '' }: { src: string; alt: string; className?: string }) => (
  <div className={`rounded-[2rem] border border-white/20 shadow-2xl overflow-hidden bg-white/10 backdrop-blur-sm ${className}`}>
    <img src={src} alt={alt} className="w-full h-auto block" loading="lazy" />
  </div>
);

const Features = () => (
  <MarketingLayout>
    {/* Hero */}
    <section className="pt-20 pb-16 px-6 text-center bg-gradient-to-b from-emerald-50/50 via-background to-background">
      <motion.div initial="hidden" animate="visible" variants={fade} custom={0}>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight mb-4">
          Everything You Need{' '}
          <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            to Grow
          </span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10">
          Five pillars of growth in one app — Iman, Health, Wealth, Productivity, and Family.
        </p>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fade} custom={1} className="flex justify-center">
        <div className="relative">
          <div className="absolute -inset-6 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-[3rem] blur-2xl" />
          <PhoneMockup src={imgLifescore} alt="Life Score Dashboard" className="relative max-w-[280px] sm:max-w-[300px] !border-gray-200 !bg-white !backdrop-blur-none" />
        </div>
      </motion.div>
    </section>

    {/* Pillar Sections as Bento */}
    {pillars.map((pillar, idx) => (
      <section key={pillar.title} className="py-16 px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          {/* Pillar header card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fade}
            custom={0}
            className={`relative rounded-2xl bg-gradient-to-br ${pillar.gradient} p-8 sm:p-10 mb-8 overflow-hidden`}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <HugeiconsIcon icon={pillar.icon} size={28} color="white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/70 uppercase tracking-wider mb-0.5">{pillar.title}</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">{pillar.subtitle}</h2>
                <p className="text-white/70 mt-1 max-w-lg text-sm">{pillar.description}</p>
              </div>
            </div>
          </motion.div>

          {/* Content: features + optional images */}
          <div className={`flex flex-col ${pillar.image ? 'md:flex-row' : ''} gap-6`}>
            {/* Feature mini-cards grid */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${pillar.image ? 'md:grid-cols-2 flex-1' : 'md:grid-cols-3'} gap-4`}>
              {pillar.features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fade}
                  custom={i + 1}
                  className="rounded-xl border border-gray-100 bg-white/70 backdrop-blur-sm p-5 hover:shadow-lg hover:shadow-emerald-500/5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className={`w-9 h-9 rounded-lg ${pillar.iconBg} flex items-center justify-center mb-3`}>
                    <HugeiconsIcon icon={f.icon} size={18} />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Phone mockups */}
            {pillar.image && (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fade}
                custom={2}
                className="flex-shrink-0 flex flex-col items-center gap-4"
              >
                <div className="relative">
                  <div className={`absolute -inset-4 bg-gradient-to-br ${pillar.gradient} opacity-10 rounded-[2.5rem] blur-xl`} />
                  <PhoneMockup
                    src={pillar.image}
                    alt={`${pillar.title} screenshot`}
                    className={`relative max-w-[220px] !border-gray-200 !bg-white !backdrop-blur-none ${idx % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}
                  />
                </div>
                {pillar.extraImages && pillar.extraImages.length > 0 && (
                  <div className="flex gap-3 justify-center flex-wrap">
                    {pillar.extraImages.map((img, i) => (
                      <PhoneMockup
                        key={i}
                        src={img}
                        alt={`${pillar.title} screenshot ${i + 2}`}
                        className={`max-w-[120px] !border-gray-200 !bg-white !backdrop-blur-none ${i % 2 === 0 ? 'rotate-2' : '-rotate-2'}`}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </section>
    ))}

    {/* Bottom CTA */}
    <section className="py-24 px-6 bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Transform Your Life?
          </h2>
          <p className="text-white/70 mb-3 text-lg">
            Join thousands of Muslims tracking their growth across all five pillars.
          </p>
          <p className="text-white/50 text-sm italic mb-8">
            "The most beloved deeds to Allah are those done consistently, even if they are small." — Sahih al-Bukhari
          </p>
          <Button asChild size="lg" className="bg-white text-emerald-700 hover:bg-white/90 text-base px-8 py-6 rounded-xl active:scale-[0.98] transition-transform">
            <Link to="/auth">
              Start Your Journey <HugeiconsIcon icon={ArrowRight01Icon} size={20} className="ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  </MarketingLayout>
);

export default Features;
