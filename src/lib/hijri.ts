const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
  'Ramadhan', 'Shawwal', 'Dhul Qa\'dah', 'Dhul Hijjah',
];

export function gregorianToHijri(date: Date): { day: number; month: number; year: number; monthName: string } {
  // Kuwaiti algorithm for Gregorian to Hijri conversion
  const d = date.getDate();
  const m = date.getMonth();
  const y = date.getFullYear();

  let jd = Math.floor((11 * y + 3) / 30) + 354 * y + 30 * m
    - Math.floor((m - 1) / 2) + d + 1948440 - 385;

  if (m < 2) {
    jd = jd;
  } else if (m < 8) {
    jd -= Math.floor((m + 1) / 2);
  } else {
    jd -= Math.floor(m / 2);
  }

  // Recalculate using proper Julian Day Number
  const a = Math.floor((14 - (m + 1)) / 12);
  const yy = y + 4800 - a;
  const mm = (m + 1) + 12 * a - 3;
  const julianDay = d + Math.floor((153 * mm + 2) / 5) + 365 * yy
    + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;

  const l = julianDay - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const ll = l - 10631 * n + 354;
  const j = Math.floor((10985 - ll) / 5316) * Math.floor((50 * ll) / 17719)
    + Math.floor(ll / 5670) * Math.floor((43 * ll) / 15238);
  const lll = ll - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50)
    - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const hijriMonth = Math.floor((24 * lll) / 709);
  const hijriDay = lll - Math.floor((709 * hijriMonth) / 24);
  const hijriYear = 30 * n + j - 30;

  return {
    day: hijriDay,
    month: hijriMonth,
    year: hijriYear,
    monthName: HIJRI_MONTHS[hijriMonth - 1] || '',
  };
}

export function formatHijriDate(date: Date): string {
  const h = gregorianToHijri(date);
  return `${h.day} ${h.monthName} ${h.year} H`;
}
