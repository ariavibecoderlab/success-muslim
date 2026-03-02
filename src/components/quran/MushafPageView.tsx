import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchAyahsByPage, SURAH_NAMES, type Ayah } from '@/lib/quran-api';
import { juzForAyah } from '@/lib/quran-mapping';
import { AyahContextMenu } from './AyahContextMenu';

interface MushafPageViewProps {
  initialPage: number;
  fontSize: number;
  translationLang: string;
  isPlaying: number | null;
  isBookmarked: (surah: number, ayah: number) => boolean;
  isMemorized: (surah: number, ayah: number) => boolean;
  showMemorize: boolean;
  onPlay: (surah: number, ayah: number) => void;
  onTafsir: (surah: number, ayah: number) => void;
  onBookmark: (surah: number, ayah: number) => void;
  onMemorize: (surah: number, ayah: number) => void;
  onPageChange?: (page: number) => void;
}

const TRANSLATION_IDS: Record<string, number> = { en: 131, ms: 39, id: 33 };

export function MushafPageView({
  initialPage, fontSize, translationLang, isPlaying,
  isBookmarked, isMemorized, showMemorize,
  onPlay, onTafsir, onBookmark, onMemorize, onPageChange,
}: MushafPageViewProps) {
  const [page, setPage] = useState(initialPage);
  const [verses, setVerses] = useState<(Ayah & { chapter_id: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setPage(initialPage); }, [initialPage]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const tid = TRANSLATION_IDS[translationLang] || 131;
    fetchAyahsByPage(page, tid).then(data => {
      if (!cancelled) { setVerses(data.verses); setLoading(false); }
    }).catch(() => { if (!cancelled) { setVerses([]); setLoading(false); } });
    return () => { cancelled = true; };
  }, [page, translationLang]);

  const navigate = useCallback((delta: number) => {
    const next = Math.max(1, Math.min(604, page + delta));
    setPage(next);
    onPageChange?.(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, onPageChange]);

  // Swipe support
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 60) {
      // RTL: swipe right = next page (lower number in mushaf = forward)
      navigate(diff > 0 ? -1 : 1);
    }
    setTouchStartX(null);
  };

  // Group verses by surah for rendering bismillah headers
  const juz = verses.length > 0 ? juzForAyah(verses[0].chapter_id, verses[0].verse_number) : 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div
      className="max-w-2xl mx-auto"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Page header */}
      <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground border-b">
        <span>Juz {juz}</span>
        <span>Page {page}</span>
      </div>

      {/* Mushaf content */}
      <div
        className="px-5 py-6 min-h-[60vh]"
        dir="rtl"
        style={{ fontFamily: "'Amiri Quran', serif", fontSize: Math.max(fontSize, 26) }}
      >
        {verses.map((verse, idx) => {
          const prevVerse = idx > 0 ? verses[idx - 1] : null;
          const isNewSurah = !prevVerse || prevVerse.chapter_id !== verse.chapter_id;
          const surahMeta = SURAH_NAMES[verse.chapter_id - 1];
          const ayahPlaying = isPlaying !== null &&
            isPlaying === verse.verse_number;

          return (
            <span key={verse.verse_key}>
              {/* Surah header */}
              {isNewSurah && (
                <div className="w-full text-center my-4 clear-both" dir="ltr">
                  <div className="inline-flex items-center gap-2 bg-secondary/60 px-4 py-2 rounded-xl">
                    <span className="text-sm font-semibold text-foreground">{surahMeta?.name}</span>
                    <span className="text-lg" style={{ fontFamily: "'Amiri Quran', serif" }}>{surahMeta?.arabic}</span>
                  </div>
                  {/* Bismillah for non-Fatiha, non-Tawbah */}
                  {verse.chapter_id !== 1 && verse.chapter_id !== 9 && verse.verse_number === 1 && (
                    <p className="text-xl mt-3 mb-2" dir="rtl" style={{ fontFamily: "'Amiri Quran', serif" }}>
                      بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                    </p>
                  )}
                </div>
              )}

              {/* Ayah text (continuous flow) */}
              <AyahContextMenu
                surahNum={verse.chapter_id}
                ayahNum={verse.verse_number}
                arabicText={verse.text_uthmani}
                isPlaying={ayahPlaying}
                isBookmarked={isBookmarked(verse.chapter_id, verse.verse_number)}
                isMemorized={isMemorized(verse.chapter_id, verse.verse_number)}
                showMemorize={showMemorize}
                onPlay={() => onPlay(verse.chapter_id, verse.verse_number)}
                onTafsir={() => onTafsir(verse.chapter_id, verse.verse_number)}
                onBookmark={() => onBookmark(verse.chapter_id, verse.verse_number)}
                onMemorize={() => onMemorize(verse.chapter_id, verse.verse_number)}
              >
                <span
                  className={`leading-[2.4] inline ${ayahPlaying ? 'text-primary' : ''}`}
                >
                  {verse.text_uthmani}
                  {/* Ayah end marker */}
                  <span className="inline-flex items-center justify-center mx-1 text-muted-foreground/60" style={{ fontSize: '0.6em' }}>
                    ﴿{verse.verse_number.toLocaleString('ar-SA')}﴾
                  </span>
                </span>
              </AyahContextMenu>
            </span>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <Button variant="ghost" size="sm" disabled={page >= 604} onClick={() => navigate(1)}>
          <ChevronRight className="h-4 w-4 mr-1" /> Next
        </Button>
        <span className="text-xs text-muted-foreground font-medium">{page} / 604</span>
        <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => navigate(-1)}>
          Prev <ChevronLeft className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
