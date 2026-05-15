import { Megaphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUp } from './constants';

interface Props {
  announcements: { id: string; title: string; content: string }[];
}

export default function AnnouncementsBanner({ announcements }: Props) {
  if (announcements.length === 0) return null;

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
      {announcements.map((a) => (
        <div key={a.id} className="rounded-xl bg-amber-50 dark:bg-amber-950/20 p-2.5 flex items-start gap-2.5 mb-2">
          <Megaphone className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium">{a.title}</p>
            <p className="text-[10px] text-muted-foreground">{a.content}</p>
          </div>
        </div>
      ))}
    </motion.div>
  );
}
