// Quran.com API v4 client
const BASE = 'https://api.quran.com/api/v4';

export interface SurahInfo {
  id: number;
  revelation_place: string;
  name_arabic: string;
  name_simple: string;
  name_complex: string;
  verses_count: number;
  translated_name: { name: string };
}

export interface AyahWord {
  id: number;
  text_uthmani: string;
  translation?: { text: string };
}

export interface Ayah {
  id: number;
  verse_number: number;
  verse_key: string;
  text_uthmani: string;
  text_indopak?: string;
  translations?: { text: string; resource_name: string }[];
  words?: AyahWord[];
}

export interface JuzInfo {
  id: number;
  juz_number: number;
  first_verse_id: number;
  last_verse_id: number;
  verses_count: number;
  verse_mapping: Record<string, string>; // surahNum -> "startAyah-endAyah"
}

// Translation IDs for supported languages
export const TRANSLATION_IDS: Record<string, { id: number; name: string }> = {
  en: { id: 131, name: 'English (Saheeh International)' },
  ms: { id: 39, name: 'Malay (Basmeih)' },
  id: { id: 33, name: 'Indonesian (Kemenag)' },
};

// Tafsir IDs
export const TAFSIR_IDS: Record<string, { id: number; name: string }> = {
  en: { id: 169, name: 'Tafsir Ibn Kathir (English)' },
  ms: { id: 168, name: 'Tafsir Al-Jalalain (Arabic)' },
};

// Cache to avoid refetching
const cache = new Map<string, any>();

async function cachedFetch<T>(url: string): Promise<T> {
  if (cache.has(url)) return cache.get(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  cache.set(url, data);
  return data;
}

export async function fetchSurahList(): Promise<SurahInfo[]> {
  const data = await cachedFetch<{ chapters: SurahInfo[] }>(`${BASE}/chapters?language=en`);
  return data.chapters;
}

export async function fetchSurahInfo(surahNum: number): Promise<SurahInfo> {
  const data = await cachedFetch<{ chapter: SurahInfo }>(`${BASE}/chapters/${surahNum}?language=en`);
  return data.chapter;
}

export async function fetchAyahs(
  surahNum: number,
  page: number = 1,
  translationId: number = 131,
  perPage: number = 50
): Promise<{ verses: Ayah[]; pagination: { total_pages: number; current_page: number; total_records: number } }> {
  const url = `${BASE}/verses/by_chapter/${surahNum}?language=en&translations=${translationId}&fields=text_uthmani&per_page=${perPage}&page=${page}`;
  return cachedFetch(url);
}

export async function fetchAllAyahs(surahNum: number, translationId: number = 131): Promise<Ayah[]> {
  const all: Ayah[] = [];
  let page = 1;
  let totalPages = 1;
  
  while (page <= totalPages) {
    const data = await fetchAyahs(surahNum, page, translationId);
    all.push(...data.verses);
    totalPages = data.pagination.total_pages;
    page++;
  }
  return all;
}

export async function fetchJuzList(): Promise<JuzInfo[]> {
  const data = await cachedFetch<{ juzs: JuzInfo[] }>(`${BASE}/juzs`);
  return data.juzs;
}

export async function fetchTafsir(surahNum: number, ayahNum: number, tafsirId: number = 169): Promise<string> {
  try {
    const data = await cachedFetch<{ tafsir: { text: string } }>(
      `${BASE}/tafsirs/${tafsirId}/by_ayah/${surahNum}:${ayahNum}`
    );
    return data.tafsir?.text || 'Tafsir not available for this ayah.';
  } catch {
    return 'Tafsir not available.';
  }
}

// Surah metadata (static for instant access)
export const SURAH_NAMES: { number: number; name: string; arabic: string; ayahs: number; type: string }[] = [
  { number: 1, name: "Al-Fatihah", arabic: "الفاتحة", ayahs: 7, type: "Meccan" },
  { number: 2, name: "Al-Baqarah", arabic: "البقرة", ayahs: 286, type: "Medinan" },
  { number: 3, name: "Ali 'Imran", arabic: "آل عمران", ayahs: 200, type: "Medinan" },
  { number: 4, name: "An-Nisa", arabic: "النساء", ayahs: 176, type: "Medinan" },
  { number: 5, name: "Al-Ma'idah", arabic: "المائدة", ayahs: 120, type: "Medinan" },
  { number: 6, name: "Al-An'am", arabic: "الأنعام", ayahs: 165, type: "Meccan" },
  { number: 7, name: "Al-A'raf", arabic: "الأعراف", ayahs: 206, type: "Meccan" },
  { number: 8, name: "Al-Anfal", arabic: "الأنفال", ayahs: 75, type: "Medinan" },
  { number: 9, name: "At-Tawbah", arabic: "التوبة", ayahs: 129, type: "Medinan" },
  { number: 10, name: "Yunus", arabic: "يونس", ayahs: 109, type: "Meccan" },
  { number: 11, name: "Hud", arabic: "هود", ayahs: 123, type: "Meccan" },
  { number: 12, name: "Yusuf", arabic: "يوسف", ayahs: 111, type: "Meccan" },
  { number: 13, name: "Ar-Ra'd", arabic: "الرعد", ayahs: 43, type: "Medinan" },
  { number: 14, name: "Ibrahim", arabic: "ابراهيم", ayahs: 52, type: "Meccan" },
  { number: 15, name: "Al-Hijr", arabic: "الحجر", ayahs: 99, type: "Meccan" },
  { number: 16, name: "An-Nahl", arabic: "النحل", ayahs: 128, type: "Meccan" },
  { number: 17, name: "Al-Isra", arabic: "الإسراء", ayahs: 111, type: "Meccan" },
  { number: 18, name: "Al-Kahf", arabic: "الكهف", ayahs: 110, type: "Meccan" },
  { number: 19, name: "Maryam", arabic: "مريم", ayahs: 98, type: "Meccan" },
  { number: 20, name: "Taha", arabic: "طه", ayahs: 135, type: "Meccan" },
  { number: 21, name: "Al-Anbya", arabic: "الأنبياء", ayahs: 112, type: "Meccan" },
  { number: 22, name: "Al-Hajj", arabic: "الحج", ayahs: 78, type: "Medinan" },
  { number: 23, name: "Al-Mu'minun", arabic: "المؤمنون", ayahs: 118, type: "Meccan" },
  { number: 24, name: "An-Nur", arabic: "النور", ayahs: 64, type: "Medinan" },
  { number: 25, name: "Al-Furqan", arabic: "الفرقان", ayahs: 77, type: "Meccan" },
  { number: 26, name: "Ash-Shu'ara", arabic: "الشعراء", ayahs: 227, type: "Meccan" },
  { number: 27, name: "An-Naml", arabic: "النمل", ayahs: 93, type: "Meccan" },
  { number: 28, name: "Al-Qasas", arabic: "القصص", ayahs: 88, type: "Meccan" },
  { number: 29, name: "Al-Ankabut", arabic: "العنكبوت", ayahs: 69, type: "Meccan" },
  { number: 30, name: "Ar-Rum", arabic: "الروم", ayahs: 60, type: "Meccan" },
  { number: 31, name: "Luqman", arabic: "لقمان", ayahs: 34, type: "Meccan" },
  { number: 32, name: "As-Sajdah", arabic: "السجدة", ayahs: 30, type: "Meccan" },
  { number: 33, name: "Al-Ahzab", arabic: "الأحزاب", ayahs: 73, type: "Medinan" },
  { number: 34, name: "Saba", arabic: "سبإ", ayahs: 54, type: "Meccan" },
  { number: 35, name: "Fatir", arabic: "فاطر", ayahs: 45, type: "Meccan" },
  { number: 36, name: "Ya-Sin", arabic: "يس", ayahs: 83, type: "Meccan" },
  { number: 37, name: "As-Saffat", arabic: "الصافات", ayahs: 182, type: "Meccan" },
  { number: 38, name: "Sad", arabic: "ص", ayahs: 88, type: "Meccan" },
  { number: 39, name: "Az-Zumar", arabic: "الزمر", ayahs: 75, type: "Meccan" },
  { number: 40, name: "Ghafir", arabic: "غافر", ayahs: 85, type: "Meccan" },
  { number: 41, name: "Fussilat", arabic: "فصلت", ayahs: 54, type: "Meccan" },
  { number: 42, name: "Ash-Shura", arabic: "الشورى", ayahs: 53, type: "Meccan" },
  { number: 43, name: "Az-Zukhruf", arabic: "الزخرف", ayahs: 89, type: "Meccan" },
  { number: 44, name: "Ad-Dukhan", arabic: "الدخان", ayahs: 59, type: "Meccan" },
  { number: 45, name: "Al-Jathiyah", arabic: "الجاثية", ayahs: 37, type: "Meccan" },
  { number: 46, name: "Al-Ahqaf", arabic: "الأحقاف", ayahs: 35, type: "Meccan" },
  { number: 47, name: "Muhammad", arabic: "محمد", ayahs: 38, type: "Medinan" },
  { number: 48, name: "Al-Fath", arabic: "الفتح", ayahs: 29, type: "Medinan" },
  { number: 49, name: "Al-Hujurat", arabic: "الحجرات", ayahs: 18, type: "Medinan" },
  { number: 50, name: "Qaf", arabic: "ق", ayahs: 45, type: "Meccan" },
  { number: 51, name: "Adh-Dhariyat", arabic: "الذاريات", ayahs: 60, type: "Meccan" },
  { number: 52, name: "At-Tur", arabic: "الطور", ayahs: 49, type: "Meccan" },
  { number: 53, name: "An-Najm", arabic: "النجم", ayahs: 62, type: "Meccan" },
  { number: 54, name: "Al-Qamar", arabic: "القمر", ayahs: 55, type: "Meccan" },
  { number: 55, name: "Ar-Rahman", arabic: "الرحمن", ayahs: 78, type: "Medinan" },
  { number: 56, name: "Al-Waqi'ah", arabic: "الواقعة", ayahs: 96, type: "Meccan" },
  { number: 57, name: "Al-Hadid", arabic: "الحديد", ayahs: 29, type: "Medinan" },
  { number: 58, name: "Al-Mujadila", arabic: "المجادلة", ayahs: 22, type: "Medinan" },
  { number: 59, name: "Al-Hashr", arabic: "الحشر", ayahs: 24, type: "Medinan" },
  { number: 60, name: "Al-Mumtahanah", arabic: "الممتحنة", ayahs: 13, type: "Medinan" },
  { number: 61, name: "As-Saf", arabic: "الصف", ayahs: 14, type: "Medinan" },
  { number: 62, name: "Al-Jumu'ah", arabic: "الجمعة", ayahs: 11, type: "Medinan" },
  { number: 63, name: "Al-Munafiqun", arabic: "المنافقون", ayahs: 11, type: "Medinan" },
  { number: 64, name: "At-Taghabun", arabic: "التغابن", ayahs: 18, type: "Medinan" },
  { number: 65, name: "At-Talaq", arabic: "الطلاق", ayahs: 12, type: "Medinan" },
  { number: 66, name: "At-Tahrim", arabic: "التحريم", ayahs: 12, type: "Medinan" },
  { number: 67, name: "Al-Mulk", arabic: "الملك", ayahs: 30, type: "Meccan" },
  { number: 68, name: "Al-Qalam", arabic: "القلم", ayahs: 52, type: "Meccan" },
  { number: 69, name: "Al-Haqqah", arabic: "الحاقة", ayahs: 52, type: "Meccan" },
  { number: 70, name: "Al-Ma'arij", arabic: "المعارج", ayahs: 44, type: "Meccan" },
  { number: 71, name: "Nuh", arabic: "نوح", ayahs: 28, type: "Meccan" },
  { number: 72, name: "Al-Jinn", arabic: "الجن", ayahs: 28, type: "Meccan" },
  { number: 73, name: "Al-Muzzammil", arabic: "المزمل", ayahs: 20, type: "Meccan" },
  { number: 74, name: "Al-Muddaththir", arabic: "المدثر", ayahs: 56, type: "Meccan" },
  { number: 75, name: "Al-Qiyamah", arabic: "القيامة", ayahs: 40, type: "Meccan" },
  { number: 76, name: "Al-Insan", arabic: "الانسان", ayahs: 31, type: "Medinan" },
  { number: 77, name: "Al-Mursalat", arabic: "المرسلات", ayahs: 50, type: "Meccan" },
  { number: 78, name: "An-Naba", arabic: "النبإ", ayahs: 40, type: "Meccan" },
  { number: 79, name: "An-Nazi'at", arabic: "النازعات", ayahs: 46, type: "Meccan" },
  { number: 80, name: "Abasa", arabic: "عبس", ayahs: 42, type: "Meccan" },
  { number: 81, name: "At-Takwir", arabic: "التكوير", ayahs: 29, type: "Meccan" },
  { number: 82, name: "Al-Infitar", arabic: "الانفطار", ayahs: 19, type: "Meccan" },
  { number: 83, name: "Al-Mutaffifin", arabic: "المطففين", ayahs: 36, type: "Meccan" },
  { number: 84, name: "Al-Inshiqaq", arabic: "الانشقاق", ayahs: 25, type: "Meccan" },
  { number: 85, name: "Al-Buruj", arabic: "البروج", ayahs: 22, type: "Meccan" },
  { number: 86, name: "At-Tariq", arabic: "الطارق", ayahs: 17, type: "Meccan" },
  { number: 87, name: "Al-A'la", arabic: "الأعلى", ayahs: 19, type: "Meccan" },
  { number: 88, name: "Al-Ghashiyah", arabic: "الغاشية", ayahs: 26, type: "Meccan" },
  { number: 89, name: "Al-Fajr", arabic: "الفجر", ayahs: 30, type: "Meccan" },
  { number: 90, name: "Al-Balad", arabic: "البلد", ayahs: 20, type: "Meccan" },
  { number: 91, name: "Ash-Shams", arabic: "الشمس", ayahs: 15, type: "Meccan" },
  { number: 92, name: "Al-Layl", arabic: "الليل", ayahs: 21, type: "Meccan" },
  { number: 93, name: "Ad-Duhaa", arabic: "الضحى", ayahs: 11, type: "Meccan" },
  { number: 94, name: "Ash-Sharh", arabic: "الشرح", ayahs: 8, type: "Meccan" },
  { number: 95, name: "At-Tin", arabic: "التين", ayahs: 8, type: "Meccan" },
  { number: 96, name: "Al-Alaq", arabic: "العلق", ayahs: 19, type: "Meccan" },
  { number: 97, name: "Al-Qadr", arabic: "القدر", ayahs: 5, type: "Meccan" },
  { number: 98, name: "Al-Bayyinah", arabic: "البينة", ayahs: 8, type: "Medinan" },
  { number: 99, name: "Az-Zalzalah", arabic: "الزلزلة", ayahs: 8, type: "Medinan" },
  { number: 100, name: "Al-Adiyat", arabic: "العاديات", ayahs: 11, type: "Meccan" },
  { number: 101, name: "Al-Qari'ah", arabic: "القارعة", ayahs: 11, type: "Meccan" },
  { number: 102, name: "At-Takathur", arabic: "التكاثر", ayahs: 8, type: "Meccan" },
  { number: 103, name: "Al-Asr", arabic: "العصر", ayahs: 3, type: "Meccan" },
  { number: 104, name: "Al-Humazah", arabic: "الهمزة", ayahs: 9, type: "Meccan" },
  { number: 105, name: "Al-Fil", arabic: "الفيل", ayahs: 5, type: "Meccan" },
  { number: 106, name: "Quraysh", arabic: "قريش", ayahs: 4, type: "Meccan" },
  { number: 107, name: "Al-Ma'un", arabic: "الماعون", ayahs: 7, type: "Meccan" },
  { number: 108, name: "Al-Kawthar", arabic: "الكوثر", ayahs: 3, type: "Meccan" },
  { number: 109, name: "Al-Kafirun", arabic: "الكافرون", ayahs: 6, type: "Meccan" },
  { number: 110, name: "An-Nasr", arabic: "النصر", ayahs: 3, type: "Medinan" },
  { number: 111, name: "Al-Masad", arabic: "المسد", ayahs: 5, type: "Meccan" },
  { number: 112, name: "Al-Ikhlas", arabic: "الإخلاص", ayahs: 4, type: "Meccan" },
  { number: 113, name: "Al-Falaq", arabic: "الفلق", ayahs: 5, type: "Meccan" },
  { number: 114, name: "An-Nas", arabic: "الناس", ayahs: 6, type: "Meccan" },
];

export const TOTAL_AYAHS = SURAH_NAMES.reduce((s, v) => s + v.ayahs, 0); // 6236
export const TOTAL_PAGES = 604;

/** Fetch all ayahs on a given Mushaf page (1-604) */
export async function fetchAyahsByPage(
  page: number,
  translationId: number = 131,
): Promise<{ verses: (Ayah & { chapter_id: number })[]; meta: { page: number } }> {
  const url = `${BASE}/verses/by_page/${page}?language=en&translations=${translationId}&fields=text_uthmani,chapter_id&per_page=50`;
  const data = await cachedFetch<any>(url);
  return {
    verses: data.verses.map((v: any) => ({ ...v, chapter_id: v.chapter_id ?? Number(v.verse_key?.split(':')[0]) })),
    meta: { page },
  };
}
