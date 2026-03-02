import { Settings2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import EditableText from '@/components/cms/EditableText';
import { fadeUp } from './constants';

interface Props {
  displayName: string;
  onCustomize: () => void;
}

export default function GreetingHeader({ displayName, onCustomize }: Props) {
  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-0.5">
            Assalamualaikum{displayName ? `, ${displayName}` : ''} 👋
          </h1>
          <EditableText
            elementKey="greeting.subtitle"
            defaultText="Your spiritual dashboard"
            tag="p"
            className="text-muted-foreground text-sm"
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground h-8 px-2"
          onClick={onCustomize}
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
