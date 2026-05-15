import { useMemo } from 'react';

interface GreetingInput {
  firstName: string;
  isRamadan: boolean;
  ramadanDay: number;
  salahStreak?: number;
}

export function useContextualGreeting({ firstName, isRamadan, ramadanDay, salahStreak }: GreetingInput): string {
  return useMemo(() => {
    const hour = new Date().getHours();
    let greeting = '';

    if (hour < 4) {
      greeting = 'Masih terjaga? Jangan lupa istirahat';
    } else if (hour < 7) {
      greeting = 'Selamat pagi! Subuh sudah?';
    } else if (hour < 12) {
      greeting = `Semangat hari ini, ${firstName}!`;
    } else if (hour < 15) {
      greeting = 'Sudah solat Zuhur? Jangan lupa';
    } else if (hour < 18) {
      greeting = 'Asar time! Sebentar lagi Maghrib';
    } else if (hour < 20) {
      greeting = 'Alhamdulillah, sudah berbuka';
    } else {
      greeting = 'Jangan lupa Isyak dan witir malam ini';
    }

    if (isRamadan && ramadanDay > 0) {
      greeting += ` · Puasa hari ke-${ramadanDay}`;
    } else if (salahStreak && salahStreak > 3) {
      greeting += ` · Streak solat ${salahStreak} hari`;
    }

    return greeting;
  }, [firstName, isRamadan, ramadanDay, salahStreak]);
}
