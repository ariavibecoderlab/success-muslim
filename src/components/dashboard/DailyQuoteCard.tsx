import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      <div
        className="rounded-xl bg-muted/50 p-3 cursor-pointer select-none"
        onClick={rotate}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            <p className="text-xs italic leading-relaxed text-foreground">{quote.text}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{quote.source}</p>
          </motion.div>
        </AnimatePresence>
        <div className="flex justify-center gap-1 mt-2.5">
          {QUOTES.map((_, i) => (
            <div
              key={i}
              className={`w-1 h-1 rounded-full transition-colors ${i === index ? 'bg-primary' : 'bg-muted-foreground/20'}`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
