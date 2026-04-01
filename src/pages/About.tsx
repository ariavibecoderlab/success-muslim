import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MarketingLayout from '@/components/MarketingLayout';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Analytics02Icon, ShieldCheck, ViewIcon, UserMultipleIcon, ArrowRight01Icon,
} from '@hugeicons/core-free-icons';
import smlogo from '@/assets/smlogo.webp';

const fade = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const values = [
  {
    icon: Analytics02Icon,
    title: 'Consistency Over Perfection',
    desc: "Small, consistent actions compound into transformative results. We help you build daily habits, not chase impossible standards.",
    iconBg: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy First',
    desc: "Your data belongs to you. We don't sell your information, show ads, or track you across the web. Period.",
    iconBg: 'bg-teal-100 text-teal-700',
  },
  {
    icon: ViewIcon,
    title: 'Holistic Growth',
    desc: 'True success means thriving spiritually, physically, financially, and socially. We track all dimensions of a fulfilling Muslim life.',
    iconBg: 'bg-orange-100 text-orange-700',
  },
  {
    icon: UserMultipleIcon,
    title: 'Community & Family',
    desc: 'Growth is better together. Share your journey with family, encourage each other, and celebrate milestones as a unit.',
    iconBg: 'bg-amber-100 text-amber-700',
  },
];

const About = () => (
  <MarketingLayout>
    {/* Hero */}
    <section className="pt-20 pb-16 px-6 text-center bg-gradient-to-b from-emerald-50/50 via-background to-background">
      <motion.div initial="hidden" animate="visible" variants={fade} custom={0}>
        <motion.img
          src={smlogo}
          alt="Success Muslim"
          className="w-16 h-16 rounded-2xl mx-auto mb-6"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight mb-4">
          Your Islamic<br />
          <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Lifestyle Companion
          </span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Success Muslim helps you optimize your life for both dunya and akhirah through consistent daily tracking across every dimension that matters.
        </p>
      </motion.div>
    </section>

    {/* Mission & Vision */}
    <section className="py-20 px-6 border-t border-gray-100">
      <div className="max-w-lg mx-auto grid gap-8">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}
          className="rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-100 p-8 border-l-4 border-l-emerald-500"
        >
          <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider mb-2">Our Mission</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Empower Every Muslim to Thrive
          </h2>
          <p className="text-gray-500 leading-relaxed">
            We believe every Muslim deserves tools that respect their values and support their unique journey. Success Muslim was built to replace scattered apps and notebooks with one unified, beautiful platform that tracks what truly matters — your prayers, your health, your wealth, and your personal growth.
          </p>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={1}
          className="rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-100 p-8 border-l-4 border-l-teal-500"
        >
          <p className="text-sm font-medium text-teal-600 uppercase tracking-wider mb-2">Our Vision</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            The Most Comprehensive Muslim Lifestyle Platform
          </h2>
          <p className="text-gray-500 leading-relaxed">
            We envision a world where every Muslim has access to beautifully designed, privacy-first tools that make it easy to be consistent in worship, mindful about health, wise with wealth, and productive in daily life — all without compromise.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Core Values */}
    <section className="py-20 px-6 border-t border-gray-100">
      <div className="max-w-lg mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            What We Stand For
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Our core values guide every feature we build and every decision we make.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fade}
              custom={i + 1}
              className="rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm p-7 hover:shadow-lg hover:shadow-emerald-500/5 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className={`w-11 h-11 rounded-xl ${v.iconBg} flex items-center justify-center mb-4`}>
                <HugeiconsIcon icon={v.icon} size={22} />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">{v.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Hadith Quote */}
    <section className="py-24 px-6 bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
          <p className="text-xl sm:text-2xl font-medium italic leading-relaxed mb-3 text-white/90">
            "The most beloved deeds to Allah are those done consistently, even if they are small."
          </p>
          <p className="text-white/50 text-sm mb-10">
            — Sahih al-Bukhari &amp; Muslim
          </p>
          <Button asChild size="lg" className="bg-white text-emerald-700 hover:bg-white/90 text-base px-8 py-6 rounded-xl active:scale-[0.98] transition-transform">
            <Link to="/auth">
              Begin Your Journey <HugeiconsIcon icon={ArrowRight01Icon} size={20} className="ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  </MarketingLayout>
);

export default About;
