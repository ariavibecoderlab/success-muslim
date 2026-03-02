import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { fadeUp } from './constants';

const QUOTES = [
  { text: '"The best of you are those who learn the Quran and teach it."', source: '— Sahih al-Bukhari' },
  { text: '"Verily, with hardship comes ease."', source: '— Quran 94:6' },
  { text: '"The strongest among you is the one who controls his anger."', source: '— Sahih al-Bukhari' },
];

export default function DailyQuoteCard() {
  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="p-5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Heart className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm italic leading-relaxed">{quote.text}</p>
            <p className="text-xs text-muted-foreground mt-1">{quote.source}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
