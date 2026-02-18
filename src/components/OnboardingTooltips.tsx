import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TOOLTIPS = [
  {
    id: 'life-score',
    title: 'Your Life Score',
    desc: 'This tracks your overall progress across Iman, Wellness, and Productivity. Watch it grow as you build habits!',
  },
  {
    id: 'quick-log',
    title: 'Quick Log',
    desc: 'Tap any button to quickly log prayers, Quran reading, water intake, and more.',
  },
  {
    id: 'deen-tab',
    title: 'Explore Deen',
    desc: 'Your spiritual command center — prayer times, Quran, dhikr, and advanced planners all in one place.',
  },
];

const STORAGE_KEY = 'onboarding_tooltips_seen';

const OnboardingTooltips = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      // Delay to let dashboard render first
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  const next = () => {
    if (currentIndex < TOOLTIPS.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      dismiss();
    }
  };

  if (!visible) return null;

  const tip = TOOLTIPS[currentIndex];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          key={tip.id}
          className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-1.5">
              {TOOLTIPS.map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-1 rounded-full ${i <= currentIndex ? 'bg-primary' : 'bg-muted'}`}
                />
              ))}
            </div>
            <button onClick={dismiss} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <h3 className="text-lg font-bold mb-1">{tip.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{tip.desc}</p>

          <div className="flex items-center justify-between">
            <button onClick={dismiss} className="text-xs text-muted-foreground hover:text-foreground">
              Skip tour
            </button>
            <Button onClick={next} size="sm">
              {currentIndex < TOOLTIPS.length - 1 ? (
                <>Next <ArrowRight className="ml-1 h-3 w-3" /></>
              ) : (
                "Got it!"
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingTooltips;
