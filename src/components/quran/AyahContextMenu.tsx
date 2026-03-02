import React, { useCallback, useRef, useState } from 'react';
import { Play, Pause, BookOpen, BookMarked, Brain, Copy, Share2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AyahContextMenuProps {
  surahNum: number;
  ayahNum: number;
  arabicText: string;
  isPlaying?: boolean;
  isBookmarked?: boolean;
  isMemorized?: boolean;
  showMemorize?: boolean;
  onPlay: () => void;
  onTafsir: () => void;
  onBookmark: () => void;
  onMemorize?: () => void;
  children: React.ReactNode;
}

export function AyahContextMenu({
  surahNum, ayahNum, arabicText, isPlaying, isBookmarked, isMemorized,
  showMemorize, onPlay, onTafsir, onBookmark, onMemorize, children,
}: AyahContextMenuProps) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchMoved = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  const onTouchStart = useCallback(() => {
    touchMoved.current = false;
    timerRef.current = setTimeout(() => { if (!touchMoved.current) setOpen(true); }, 500);
  }, []);

  const onTouchMove = useCallback(() => { touchMoved.current = true; clearTimer(); }, [clearTimer]);
  const onTouchEnd = useCallback(() => { clearTimer(); }, [clearTimer]);
  const onContextMenu = useCallback((e: React.MouseEvent) => { e.preventDefault(); setOpen(true); }, []);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(arabicText); toast.success('Copied'); } catch { toast.error('Copy failed'); }
    setOpen(false);
  };

  const handleShare = async () => {
    const text = `${arabicText}\n\n— Quran ${surahNum}:${ayahNum}`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    }
    setOpen(false);
  };

  const menuItems = [
    { icon: isPlaying ? Pause : Play, label: isPlaying ? 'Pause' : 'Play', action: () => { onPlay(); setOpen(false); } },
    { icon: BookOpen, label: 'Tafsir', action: () => { onTafsir(); setOpen(false); } },
    { icon: BookMarked, label: isBookmarked ? 'Unbookmark' : 'Bookmark', action: () => { onBookmark(); setOpen(false); }, active: isBookmarked },
    ...(showMemorize ? [{ icon: Brain, label: isMemorized ? 'Unmark' : 'Memorize', action: () => { onMemorize?.(); setOpen(false); }, active: isMemorized }] : []),
    { icon: Copy, label: 'Copy', action: handleCopy },
    { icon: Share2, label: 'Share', action: handleShare },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onContextMenu={onContextMenu}
          className="cursor-default select-none"
        >
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-1.5 rounded-xl shadow-lg" side="top" align="center">
        <div className="flex gap-0.5">
          {menuItems.map(item => (
            <Button
              key={item.label}
              variant="ghost"
              size="icon"
              className={`h-9 w-9 rounded-lg ${item.active ? 'text-primary' : 'text-muted-foreground'}`}
              onClick={item.action}
              title={item.label}
            >
              <item.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
