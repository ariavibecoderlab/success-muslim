import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, TrendingUp, Eye, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MarketingLayout from '@/components/MarketingLayout';

const fade = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const values = [
  {
    icon: TrendingUp,
    title: 'Consistency Over Perfection',
    desc: 'Small, consistent actions compound into transformative results. We help you build daily habits, not chase impossible standards.',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    desc: 'Your data belongs to you. We don\'t sell your information, show ads, or track you across the web. Period.',
  },
  {
    icon: Eye,
    title: 'Holistic Growth',
    desc: 'True success means thriving spiritually, physically, financially, and socially. We track all dimensions of a fulfilling Muslim life.',
  },
  {
    icon: Users,
    title: 'Community & Family',
    desc: 'Growth is better together. Share your journey with family, encourage each other, and celebrate milestones as a unit.',
  },
];

const About = () => (
  <MarketingLayout>
    {/* Hero */}
    <section className="pt-20 pb-16 px-6 text-center">
      <motion.div initial="hidden" animate="visible" variants={fade} custom={0}>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground tracking-tight mb-4">
          Your Islamic<br />
          <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Lifestyle Companion
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Success Muslim helps you optimize your life for both dunya and akhirah through consistent daily tracking across every dimension that matters.
        </p>
      </motion.div>
    </section>

    {/* Mission & Vision */}
    <section className="py-20 px-6 border-t border-border/40">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-2">Our Mission</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Empower Every Muslim to Thrive
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We believe every Muslim deserves tools that respect their values and support their unique journey. Success Muslim was built to replace scattered apps and notebooks with one unified, beautiful platform that tracks what truly matters — your prayers, your health, your wealth, and your personal growth.
          </p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={1}>
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-2">Our Vision</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            The Most Comprehensive Muslim Lifestyle Platform
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We envision a world where every Muslim has access to beautifully designed, privacy-first tools that make it easy to be consistent in worship, mindful about health, wise with wealth, and productive in daily life — all without compromise.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Core Values */}
    <section className="py-20 px-6 border-t border-border/40">
      <div className="max-w-4xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            What We Stand For
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Our core values guide every feature we build and every decision we make.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fade}
              custom={i + 1}
              className="rounded-2xl border border-border bg-card p-7 hover:shadow-md hover:shadow-primary/5 transition-shadow"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <v.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-lg mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Hadith Quote */}
    <section className="py-24 px-6 bg-primary text-primary-foreground">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
          <p className="text-xl sm:text-2xl font-medium italic leading-relaxed mb-3 text-primary-foreground/90">
            "The most beloved deeds to Allah are those done consistently, even if they are small."
          </p>
          <p className="text-primary-foreground/50 text-sm mb-10">
            — Sahih al-Bukhari & Muslim
          </p>
          <Button asChild size="lg" variant="secondary" className="text-base px-8 py-6 rounded-xl">
            <Link to="/auth">
              Begin Your Journey <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  </MarketingLayout>
);

export default About;
