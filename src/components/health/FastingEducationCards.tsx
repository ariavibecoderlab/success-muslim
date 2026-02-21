import { useState } from 'react';
import { BookOpen, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCardsForLevel, type EducationCard } from '@/lib/if-educational-content';

interface Props {
  level: number;
}

export default function FastingEducationCards({ level }: Props) {
  const cards = getCardsForLevel(level);
  const [expanded, setExpanded] = useState<EducationCard | null>(null);

  if (cards.length === 0) return null;

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
        {cards.map((card, i) => (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08, ease: 'easeOut' }}
            onClick={() => setExpanded(card)}
            className="flex-shrink-0 w-48 rounded-xl border border-border bg-card p-3 text-left hover:border-primary/30 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-medium text-primary">Learn</span>
            </div>
            <p className="text-xs font-semibold line-clamp-1">{card.title}</p>
            <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{card.summary}</p>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setExpanded(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-5 max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-bold">{expanded.title}</h3>
                <button onClick={() => setExpanded(null)} className="p-1 hover:bg-muted rounded-lg">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{expanded.content}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
