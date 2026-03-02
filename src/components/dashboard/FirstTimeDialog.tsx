import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface Props {
  open: boolean;
  onClose: () => void;
  onCustomize: () => void;
  onInitialize: () => Promise<void>;
}

export default function FirstTimeDialog({ open, onClose, onCustomize, onInitialize }: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Your dashboard is now customizable!
          </DialogTitle>
          <DialogDescription>
            Add widgets from Iman, Health, Wealth and more. Choose what matters most to you.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onInitialize()}>
            Maybe Later
          </Button>
          <Button onClick={() => onInitialize().then(onCustomize)}>
            Customize Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
