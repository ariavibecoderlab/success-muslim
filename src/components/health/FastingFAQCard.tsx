import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { FASTING_FAQS } from '@/lib/if-educational-content';
import { motion, AnimatePresence } from 'framer-motion';

export default function FastingFAQCard() {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const faq = FASTING_FAQS[index];

  const next = () => {
    setOpen(false);
    setIndex(i => (i + 1) % FASTING_FAQS.length);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold">Fasting FAQ</span>
        </div>
        <button onClick={next} className="text-[10px] text-primary font-medium">
          Next →
        </button>
      </div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left flex items-start gap-2"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5 mt-0.5 text-primary flex-shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />}
        <span className="text-sm font-medium">{faq.question}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="text-xs text-muted-foreground pl-5 overflow-hidden"
          >
            {faq.answer}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
