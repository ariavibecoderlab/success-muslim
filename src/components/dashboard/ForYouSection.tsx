import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Timer, Flame, Heart, BookOpen, Moon as MoonIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTodaySalahCount } from '@/hooks/useSalahQuery';

interface ForYouProps {
  isRamadan: boolean;
  ramadanDay: number;
  activeIF: any;
  quranReadToday?: boolean;
}

interface ForYouCard {
  icon: typeof Flame;
  title: string;
  subtitle: string;
  href: string;
  borderColor: string;
  iconColor: string;
}

export default function ForYouSection({ isRamadan, ramadanDay, activeIF, quranReadToday }: ForYouProps) {
  const salahCount = useTodaySalahCount();
  const hour = new Date().getHours();

  const cards = useMemo((): ForYouCard[] => {
    const result: ForYouCard[] = [];

    // Ramadan last 10
    if (isRamadan && ramadanDay > 20) {
      result.push({
        icon: MoonIcon,
        title: ramadanDay === 27
          ? 'Malam Laylatul Qadr'
          : '10 Malam Terakhir Ramadan',
        subtitle: ramadanDay === 27
          ? 'Lebih baik dari 1000 bulan'
          : 'Perbanyak ibadah, cari Laylatul Qadr',
        href: '/iman/ramadan',
        borderColor: 'border-l-amber-500',
        iconColor: 'text-amber-500',
      });
    }

    // Active IF fast
    if (activeIF) {
      result.push({
        icon: Timer,
        title: 'Puasa IF sedang berjalan',
        subtitle: 'Tetap semangat! Lihat progress kamu',
        href: '/health/if-timer',
        borderColor: 'border-l-emerald-500',
        iconColor: 'text-emerald-500',
      });
    }

    // Salah encouragement
    if (salahCount.logged === 0 && hour >= 8) {
      result.push({
        icon: Heart,
        title: 'Yuk mulai solat hari ini',
        subtitle: 'Allah Maha Pengampun. Semangat!',
        href: '/iman/prayer-times',
        borderColor: 'border-l-emerald-500',
        iconColor: 'text-emerald-500',
      });
    } else if (salahCount.logged >= 5) {
      result.push({
        icon: Flame,
        title: 'MasyaAllah! Solat lengkap hari ini',
        subtitle: 'Jangan sampai putus ya!',
        href: '/iman/salah-log',
        borderColor: 'border-l-orange-500',
        iconColor: 'text-orange-500',
      });
    }

    // Quran reminder (evening)
    if (!quranReadToday && hour >= 20) {
      result.push({
        icon: BookOpen,
        title: 'Belum baca Quran hari ini',
        subtitle: 'Walau 5 menit — barakah tetap ada',
        href: '/iman/quran',
        borderColor: 'border-l-blue-500',
        iconColor: 'text-blue-500',
      });
    }

    // Ramadan phase messages
    if (isRamadan && result.length < 3) {
      if (ramadanDay <= 10) {
        result.push({
          icon: MoonIcon,
          title: 'Semangat di awal Ramadan!',
          subtitle: '10 hari pertama — bulan rahmat',
          href: '/iman/ramadan',
          borderColor: 'border-l-purple-500',
          iconColor: 'text-purple-500',
        });
      } else if (ramadanDay <= 20) {
        result.push({
          icon: MoonIcon,
          title: 'Pertengahan Ramadan',
          subtitle: 'Jaga konsistensi ibadah',
          href: '/iman/ramadan',
          borderColor: 'border-l-purple-500',
          iconColor: 'text-purple-500',
        });
      }
    }

    return result.slice(0, 3);
  }, [isRamadan, ramadanDay, activeIF, salahCount, quranReadToday, hour]);

  if (cards.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Untuk Kamu
      </p>
      {cards.map((card, i) => (
        <Link key={i} to={card.href}>
          <Card className={`border-0 border-l-4 ${card.borderColor} shadow-sm hover:shadow-md transition-shadow`}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <card.icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{card.title}</p>
                <p className="text-[11px] text-muted-foreground">{card.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
