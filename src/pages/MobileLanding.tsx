import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Mosque02Icon,
  HealthIcon,
  MoneyBag02Icon,
  Target02Icon,
  ArrowRight02Icon,
} from '@hugeicons/core-free-icons';
import smlogo from '@/assets/smlogo.webp';

const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

const features = [
  {
    title: 'Iman',
    desc: 'Prayer, Quran & Dhikr',
    icon: Mosque02Icon,
    bg: 'bg-emerald-50',
    iconColor: '#059669',
    borderColor: 'border-emerald-100',
  },
  {
    title: 'Wellness',
    desc: 'Health & Fasting',
    icon: Heartbeat02Icon,
    bg: 'bg-teal-50',
    iconColor: '#0d9488',
    borderColor: 'border-teal-100',
  },
  {
    title: 'Wealth',
    desc: 'Budget & Savings',
    icon: MoneyBag02Icon,
    bg: 'bg-orange-50',
    iconColor: '#ea580c',
    borderColor: 'border-orange-100',
  },
  {
    title: 'Productivity',
    desc: 'Tasks & Habits',
    icon: Target02Icon,
    bg: 'bg-amber-50',
    iconColor: '#d97706',
    borderColor: 'border-amber-100',
  },
];

const MobileLanding = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate('/onboarding', { replace: true });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 pt-16 pb-10">
      {/* Decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-gradient-to-br from-emerald-200/30 to-teal-100/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero */}
      <motion.div initial="hidden" animate="visible" variants={fade} custom={0}
        className="relative z-10 flex flex-col items-center text-center mb-10"
      >
        <motion.img
          src={smlogo}
          alt="Success Muslim"
          className="w-16 h-16 rounded-2xl shadow-lg shadow-emerald-200/50 mb-5"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Success <span className="text-emerald-600">Muslim</span>
        </h1>
        <p className="text-gray-500 text-sm max-w-[260px]">
          Your all-in-one companion for spiritual growth, wellness & productivity.
        </p>
      </motion.div>

      {/* Mini Bento Grid */}
      <motion.div initial="hidden" animate="visible" variants={fade} custom={1}
        className="relative z-10 grid grid-cols-2 gap-3 mb-8"
      >
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial="hidden" animate="visible" variants={fade} custom={i + 2}
            className={`${f.bg} ${f.borderColor} border rounded-2xl p-4 active:scale-[0.97] transition-transform`}
          >
            <div className="w-9 h-9 rounded-xl bg-white/80 flex items-center justify-center mb-2.5 shadow-sm">
              <HugeiconsIcon icon={f.icon} size={20} color={f.iconColor} />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">{f.title}</h3>
            <p className="text-gray-500 text-xs mt-0.5">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Life Score Preview */}
      <motion.div initial="hidden" animate="visible" variants={fade} custom={6}
        className="relative z-10 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 mb-8 flex items-center gap-4"
      >
        <div className="relative w-14 h-14 flex-shrink-0">
          <svg className="-rotate-90" width="56" height="56" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="23" fill="none" stroke="white" strokeWidth="3" opacity="0.2" />
            <circle cx="28" cy="28" r="23" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${0.72 * 2 * Math.PI * 23} ${2 * Math.PI * 23}`} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-white">72</span>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm">Life Score</h3>
          <p className="text-white/60 text-xs">Track your holistic progress daily</p>
        </div>
      </motion.div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* CTA */}
      <motion.div initial="hidden" animate="visible" variants={fade} custom={7}
        className="relative z-10 space-y-3"
      >
        <Button asChild size="lg" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl py-6 text-base font-semibold shadow-lg shadow-emerald-200/50">
          <Link to="/auth">
            Get Started
            <HugeiconsIcon icon={ArrowRight02Icon} size={18} className="ml-2" />
          </Link>
        </Button>
        <Button asChild variant="ghost" size="lg" className="w-full text-gray-500 hover:text-gray-700 rounded-xl">
          <Link to="/auth">Already have an account? Sign In</Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default MobileLanding;
