import { Megaphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { fadeUp } from './constants';

interface Props {
  announcements: { id: string; title: string; content: string }[];
}

export default function AnnouncementsBanner({ announcements }: Props) {
  if (announcements.length === 0) return null;

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
      {announcements.map((a) => (
        <Card key={a.id} className="bg-accent/10 border-accent/20 mb-2">
          <CardContent className="p-3 flex items-start gap-3">
            <Megaphone className="h-4 w-4 text-accent-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">{a.title}</p>
              <p className="text-xs text-muted-foreground">{a.content}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}
