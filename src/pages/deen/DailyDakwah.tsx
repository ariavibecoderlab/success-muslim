import { useState, useEffect } from 'react';
import { Download, Share2, Moon, ImageIcon } from 'lucide-react';
import SubPageLayout from '@/components/SubPageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const IMAN_SIBLINGS = [
  { path: '/iman/prayer-times', label: 'Prayer Times' },
  { path: '/iman/quran', label: 'Quran' },
  { path: '/iman/dhikr', label: 'Dhikr' },
  { path: '/iman/sunnah', label: 'Sunnah' },
  { path: '/iman/ramadan', label: 'Ramadan' },
  { path: '/iman/dakwah', label: "Da'wah" },
];

interface Poster {
  id: string;
  title: string;
  image_url: string;
  date: string;
}

const DailyDakwah = () => {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api<Poster[]>('api-misc', {
          params: { resource: 'dakwah' },
        });
        if (data) setPosters(data);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const todayPoster = posters[0];

  const handleDownload = async (poster: Poster) => {
    try {
      const response = await fetch(poster.image_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dakwah-${poster.date}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Poster downloaded!');
    } catch {
      toast.error('Failed to download');
    }
  };

  const handleShare = async (poster: Poster) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: poster.title,
          text: `${poster.title} — "Deliver even from 1 ayat"`,
          url: poster.image_url,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(poster.image_url);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <SubPageLayout title="Daily Da'wah" backTo="/iman" siblingRoutes={IMAN_SIBLINGS} currentPath="/iman/dakwah">
      <div className="space-y-5">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-orange-600 to-orange-700 text-white border-0 rounded-xl shadow-md">
            <CardContent className="p-5 text-center">
              <Moon className="h-8 w-8 text-white/80 mx-auto mb-2" />
              <p className="text-xs text-white/70 uppercase tracking-wider font-semibold">Daily Da'wah</p>
              <p className="text-lg font-bold mt-1">"Deliver even from 1 ayat"</p>
              <p className="text-xs text-white/60 mt-1">Share daily Islamic reminders with your community</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Poster */}
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-sm text-muted-foreground">Loading posters...</p>
            </CardContent>
          </Card>
        ) : todayPoster ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
             <Card className="rounded-xl border-0 shadow-md overflow-hidden">
              <CardContent className="p-0 overflow-hidden">
                <img
                  src={todayPoster.image_url}
                  alt={todayPoster.title}
                  className="w-full aspect-[3/4] object-cover"
                />
                <div className="p-4 space-y-3">
                  <p className="text-sm font-semibold">{todayPoster.title}</p>
                  <p className="text-[10px] text-muted-foreground">{todayPoster.date}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={() => handleDownload(todayPoster)} className="gap-2">
                      <Download className="h-4 w-4" /> Download
                    </Button>
                    <Button onClick={() => handleShare(todayPoster)} className="gap-2">
                      <Share2 className="h-4 w-4" /> Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center space-y-2">
              <ImageIcon className="h-12 w-12 text-muted-foreground/30 mx-auto" />
              <p className="text-sm text-muted-foreground">No posters yet</p>
              <p className="text-xs text-muted-foreground">Check back soon for daily da'wah content</p>
            </CardContent>
          </Card>
        )}

        {/* Previous Posters */}
        {posters.length > 1 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Previous Posters
            </p>
            <div className="grid grid-cols-2 gap-3">
              {posters.slice(1).map(poster => (
                <Card key={poster.id} className="overflow-hidden rounded-xl border-0 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200">
                  <CardContent className="p-0">
                    <img
                      src={poster.image_url}
                      alt={poster.title}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="p-2 space-y-1">
                      <p className="text-[11px] font-medium truncate">{poster.title}</p>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] px-1.5 flex-1"
                          onClick={() => handleDownload(poster)}>
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] px-1.5 flex-1"
                          onClick={() => handleShare(poster)}>
                          <Share2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </SubPageLayout>
  );
};

export default DailyDakwah;
