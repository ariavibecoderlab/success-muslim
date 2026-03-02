import { useState } from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { fadeUp } from './constants';

const QUOTES = [
  { text: '"The best of you are those who learn the Quran and teach it."', source: '— Sahih al-Bukhari' },
  { text: '"Verily, with hardship comes ease."', source: '— Quran 94:6' },
  { text: '"The strongest among you is the one who controls his anger."', source: '— Sahih al-Bukhari' },
  { text: '"Be in this world as if you were a stranger or a traveler."', source: '— Sahih al-Bukhari' },
  { text: '"The best richness is the richness of the soul."', source: '— Sahih al-Bukhari' },
  { text: '"Do good deeds properly, sincerely, and moderately."', source: '— Sahih al-Bukhari' },
  { text: '"Allah does not burden a soul beyond that it can bear."', source: '— Quran 2:286' },
];

export default function DailyQuoteCard() {
  const [index, setIndex] = useState(new Date().getDate() % QUOTES.length);
  const quote = QUOTES[index];

  const rotate = () => setIndex((i) => (i + 1) % QUOTES.length);

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
      <Card
        className="border-0 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 cursor-pointer select-none"
        onClick={rotate}
      >
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Heart className="h-4 w-4 text-rose-500" />
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                <p className="text-sm italic leading-relaxed">{quote.text}</p>
                <p className="text-xs text-muted-foreground mt-1">{quote.source}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex justify-center gap-1 mt-3">
            {QUOTES.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === index ? 'bg-emerald-500' : 'bg-muted-foreground/20'}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
