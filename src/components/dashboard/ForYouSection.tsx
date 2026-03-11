import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Timer, Flame, Heart, BookOpen, Moon as MoonIcon, ChevronRight, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTodaySalahCount } from '@/hooks/useSalahQuery';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from './constants';

interface ForYouProps {
  isRamadan: boolean;
  ramadanDay: number;
  activeIF: any;
  quranReadToday?: boolean;
  dhikrCount?: number;
}

interface ForYouCard {
  icon: typeof Flame;
  title: string;
  subtitle: string;
  href: string;
  iconBg: string;
  iconColor: string;
}

function formatElapsed(startTime: string): string {
  const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  if (h > 0) return `${h}j ${m}m`;
  return `${m} minit`;
}

export default function ForYouSection({ isRamadan, ramadanDay, activeIF, quranReadToday, dhikrCount = 0 }: ForYouProps) {
  const salahCount = useTodaySalahCount();
  const hour = new Date().getHours();
  const dayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon, 4=Thu

  const cards = useMemo((): ForYouCard[] => {
    const result: ForYouCard[] = [];

    // Ramadan last 10
    if (isRamadan && ramadanDay > 20) {
      const isOddNight = ramadanDay % 2 === 1;
      result.push({
        icon: MoonIcon,
        title: ramadanDay === 27
          ? 'Malam Laylatul Qadr'
          : isOddNight
            ? `Malam ke-${ramadanDay} — malam ganjil!`
            : `10 Malam Terakhir — hari ke-${ramadanDay}`,
        subtitle: ramadanDay === 27
          ? 'Lebih baik dari 1000 bulan — perbanyak doa'
          : isOddNight
            ? 'Perbanyak ibadah malam ganjil'
            : 'Jaga momentum ibadah',
        href: '/iman/ramadan',
        iconBg: 'bg-amber-500/20 ring-amber-500/30',
        iconColor: 'text-amber-400',
      });
    }

    // Active IF fast with elapsed time
    if (activeIF) {
      const elapsed = formatElapsed(activeIF.startTime);
      result.push({
        icon: Timer,
        title: `Puasa IF — ${elapsed} berlalu`,
        subtitle: `${activeIF.mode} · teruskan momentum!`,
        href: '/health/if-timer',
        iconBg: 'bg-emerald-500/20 ring-emerald-500/30',
        iconColor: 'text-emerald-400',
      });
    }

    // Salah — time-aware copy
    if (salahCount.logged === 0 && hour >= 5) {
      const salahMsg = hour < 7
        ? 'Subuh sudah lepas — log sekarang?'
        : hour < 13
          ? 'Belum log solat hari ini'
          : hour < 16
            ? 'Zuhur & Asar belum dilog'
            : 'Maghrib hampir tiba — log solat?';
      result.push({
        icon: Heart,
        title: salahMsg,
        subtitle: '0/5 solat · tap untuk log',
        href: '/iman/prayer-times',
        iconBg: 'bg-rose-500/20 ring-rose-500/30',
        iconColor: 'text-rose-400',
      });
    } else if (salahCount.logged >= 1 && salahCount.logged < 5) {
      result.push({
        icon: Flame,
        title: `${salahCount.logged}/5 solat hari ini — teruskan!`,
        subtitle: salahCount.onTime > 0
          ? `${salahCount.onTime} on-time · keep going`
          : 'Setiap solat dikira',
        href: '/iman/salah-log',
        iconBg: 'bg-orange-500/20 ring-orange-500/30',
        iconColor: 'text-orange-400',
      });
    } else if (salahCount.logged >= 5) {
      result.push({
        icon: Sparkles,
        title: '5/5 solat — MasyaAllah, konsisten!',
        subtitle: 'Jangan sampai putus streak',
        href: '/iman/salah-log',
        iconBg: 'bg-emerald-500/20 ring-emerald-500/30',
        iconColor: 'text-emerald-400',
      });
    }

    // Quran reminder (evening)
    if (!quranReadToday && hour >= 20) {
      result.push({
        icon: BookOpen,
        title: 'Belum baca Quran hari ini',
        subtitle: '1 muka surat sebelum tidur?',
        href: '/iman/quran',
        iconBg: 'bg-blue-500/20 ring-blue-500/30',
        iconColor: 'text-blue-400',
      });
    }

    // Dhikr nudge (afternoon, no dhikr yet)
    if (dhikrCount === 0 && hour >= 14 && hour < 20 && result.length < 3) {
      result.push({
        icon: Heart,
        title: 'Belum dzikir hari ini',
        subtitle: 'SubhanAllah 33x — hanya 2 minit',
        href: '/iman/dhikr',
        iconBg: 'bg-purple-500/20 ring-purple-500/30',
        iconColor: 'text-purple-400',
      });
    }

    // Monday/Thursday sunnah fasting nudge
    if ((dayOfWeek === 1 || dayOfWeek === 4) && !isRamadan && !activeIF && result.length < 3) {
      const dayName = dayOfWeek === 1 ? 'Isnin' : 'Khamis';
      result.push({
        icon: MoonIcon,
        title: `Hari ${dayName} — puasa sunat?`,
        subtitle: 'Sunnah Nabi ﷺ setiap Isnin & Khamis',
        href: '/iman/fasting',
        iconBg: 'bg-teal-500/20 ring-teal-500/30',
        iconColor: 'text-teal-400',
      });
    }

    // Ramadan phase messages
    if (isRamadan && result.length < 3) {
      if (ramadanDay <= 10) {
        result.push({
          icon: MoonIcon,
          title: `Hari ke-${ramadanDay} — bulan rahmat`,
          subtitle: 'Perbanyak istighfar & sedekah',
          href: '/iman/ramadan',
          iconBg: 'bg-purple-500/20 ring-purple-500/30',
          iconColor: 'text-purple-400',
        });
      } else if (ramadanDay <= 20) {
        result.push({
          icon: MoonIcon,
          title: `Hari ke-${ramadanDay} — bulan keampunan`,
          subtitle: 'Jaga konsistensi, perbanyak doa',
          href: '/iman/ramadan',
          iconBg: 'bg-purple-500/20 ring-purple-500/30',
          iconColor: 'text-purple-400',
        });
      }
    }

    return result.slice(0, 3);
  }, [isRamadan, ramadanDay, activeIF, salahCount, quranReadToday, hour, dhikrCount, dayOfWeek]);

  if (cards.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        For You
      </p>
      <motion.div
        className="space-y-2"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {cards.map((card, i) => (
          <motion.div key={i} variants={staggerItem}>
            <Link to={card.href}>
              <Card className="border border-orange-400/20 shadow-sm hover:shadow-md rounded-xl transition-all duration-200 active:scale-[0.98] bg-gradient-to-br from-orange-600 to-orange-700 text-white">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${card.iconBg} ring-1 flex items-center justify-center shrink-0`}>
                    <card.icon className={`h-[18px] w-[18px] ${card.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold leading-snug line-clamp-2 text-white">{card.title}</p>
                    <p className="text-xs text-white/60 mt-0.5">{card.subtitle}</p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <ChevronRight className="h-3.5 w-3.5 text-white/50" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
