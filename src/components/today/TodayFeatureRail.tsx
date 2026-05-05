import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Kaaba01Icon,
  PrayingIcon,
  TasbihIcon,
  QuranIcon,
  NoteEditIcon,
  Charity02Icon,
  Coins01Icon,
  HeartCheckIcon,
  GridViewIcon,
} from '@hugeicons/core-free-icons';

const features = [
  { icon: Kaaba01Icon, label: 'Hajj', href: '/iman/hajj', tint: 'bg-amber-50 text-amber-700' },
  { icon: PrayingIcon, label: 'Salah', href: '/iman/salah-log', tint: 'bg-emerald-50 text-emerald-700' },
  { icon: TasbihIcon, label: 'Dhikr', href: '/iman/dhikr', tint: 'bg-teal-50 text-teal-700' },
  { icon: QuranIcon, label: 'Quran', href: '/iman/quran', tint: 'bg-emerald-50 text-emerald-700' },
  { icon: NoteEditIcon, label: 'Dakwah', href: '/iman/dakwah', tint: 'bg-orange-50 text-orange-700' },
  { icon: Charity02Icon, label: 'Sadaqah', href: '/iman/sadaqah', tint: 'bg-rose-50 text-rose-700' },
  { icon: Coins01Icon, label: 'Zakat', href: '/iman/zakat', tint: 'bg-amber-50 text-amber-700' },
  { icon: HeartCheckIcon, label: 'Health', href: '/health', tint: 'bg-pink-50 text-pink-700' },
  { icon: GridViewIcon, label: 'More', href: '/iman', tint: 'bg-slate-100 text-slate-700' },
];

export default function TodayFeatureRail() {
  return (
    <section>
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-base font-bold tracking-tight">Features</h2>
        <Link to="/iman" className="text-xs font-medium text-primary">More →</Link>
      </div>
      <div className="-mx-5 px-5 overflow-x-auto scrollbar-none">
        <div className="flex gap-3 pb-1">
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link
                to={f.href}
                className="flex flex-col items-center gap-1.5 w-16 active:scale-95 transition-transform"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${f.tint}`}>
                  <HugeiconsIcon icon={f.icon} size={26} color="currentColor" strokeWidth={1.5} />
                </div>
                <span className="text-[11px] font-medium text-foreground/80 text-center leading-tight">
                  {f.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
