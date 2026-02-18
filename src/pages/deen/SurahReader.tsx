import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  BookMarked, ChevronLeft, ChevronRight, BookOpen, Brain,
  ChevronDown, ChevronUp, Settings2, Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useQuranPrefs, useQuranBookmarks, useQuranSessions, useQuranMemorization } from '@/hooks/useQuranData';
import { fetchAllAyahs, fetchTafsir, SURAH_NAMES, TRANSLATION_IDS, type Ayah } from '@/lib/quran-api';
import { toast } from 'sonner';

const SurahReader = () => {
  const { surahNum } = useParams<{ surahNum: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const num = Number(surahNum) || 1;
  const targetAyah = Number(searchParams.get('ayah')) || null;

  const { prefs, savePrefs } = useQuranPrefs();
  const { addBookmark, removeBookmark, isBookmarked, bookmarks } = useQuranBookmarks();
  const { logSession } = useQuranSessions();
  const { toggleMemorized, isMemorized } = useQuranMemorization();

  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTafsir, setExpandedTafsir] = useState<number | null>(null);
  const [tafsirText, setTafsirText] = useState<string>('');
  const [tafsirLoading, setTafsirLoading] = useState(false);

  const surah = SURAH_NAMES[num - 1];
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionStart = useRef(Date.now());
  const firstAyahRead = useRef(1);

  // Load ayahs
  useEffect(() => {
    setLoading(true);
    setAyahs([]);
    const translationId = TRANSLATION_IDS[prefs.translation_lang]?.id || 131;
    fetchAllAyahs(num, translationId).then(verses => {
      setAyahs(verses);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load surah');
      setLoading(false);
    });
    sessionStart.current = Date.now();
    firstAyahRead.current = targetAyah || 1;
  }, [num, prefs.translation_lang]);

  // Scroll to target ayah
  useEffect(() => {
    if (targetAyah && ayahs.length > 0) {
      setTimeout(() => {
        const el = document.getElementById(`ayah-${targetAyah}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [targetAyah, ayahs]);

  // Save last read position + log session on unmount
  useEffect(() => {
    return () => {
      if (prefs.tracker_enabled && ayahs.length > 0) {
        const lastAyah = ayahs[ayahs.length - 1]?.verse_number || 1;
        savePrefs({ last_surah: num, last_ayah: lastAyah });
        const duration = Math.round((Date.now() - sessionStart.current) / 1000);
        if (duration > 10) { // Only log if read for more than 10 seconds
          logSession(num, firstAyahRead.current, num, lastAyah, ayahs.length, duration);
        }
      }
    };
  }, [ayahs.length, num, prefs.tracker_enabled]);

  // Tafsir toggle
  const handleTafsir = async (ayahNum: number) => {
    if (expandedTafsir === ayahNum) {
      setExpandedTafsir(null);
      return;
    }
    setExpandedTafsir(ayahNum);
    setTafsirLoading(true);
    const text = await fetchTafsir(num, ayahNum);
    setTafsirText(text);
    setTafsirLoading(false);
  };

  // Navigation
  const goToSurah = (n: number) => {
    if (n >= 1 && n <= 114) navigate(`/deen/quran/read/${n}`);
  };

  // Bookmark toggle
  const handleBookmarkToggle = (ayahNum: number) => {
    const bm = bookmarks.find(b => b.surah_number === num && b.ayah_number === ayahNum);
    if (bm) {
      removeBookmark(bm.id);
      toast('Bookmark removed');
    } else {
      addBookmark(num, ayahNum);
      toast.success('Ayah bookmarked');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/deen/quran')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <p className="text-sm font-semibold">{surah?.name}</p>
            <p className="text-[10px] text-muted-foreground">{surah?.arabic} · {surah?.ayahs} ayahs · {surah?.type}</p>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/deen/quran')}>
              <BookOpen className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Surah navigation */}
      <div className="flex items-center justify-between px-4 py-2 max-w-2xl mx-auto border-b">
        <Button
          variant="ghost" size="sm" className="text-xs"
          disabled={num <= 1}
          onClick={() => goToSurah(num - 1)}
        >
          <ChevronLeft className="h-3 w-3 mr-1" />
          {num > 1 ? SURAH_NAMES[num - 2]?.name : ''}
        </Button>
        <span className="text-xs text-muted-foreground">{num} / 114</span>
        <Button
          variant="ghost" size="sm" className="text-xs"
          disabled={num >= 114}
          onClick={() => goToSurah(num + 1)}
        >
          {num < 114 ? SURAH_NAMES[num]?.name : ''}
          <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </div>

      {/* Bismillah */}
      {num !== 1 && num !== 9 && (
        <div className="text-center py-6 max-w-2xl mx-auto">
          <p className="text-2xl" style={{ fontFamily: 'serif', fontSize: prefs.font_size }}>
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
        </div>
      )}

      {/* Ayahs */}
      <div className="max-w-2xl mx-auto px-4 pb-24">
        {loading ? (
          <div className="space-y-4 py-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0">
            {ayahs.map(ayah => {
              const bookmarked = isBookmarked(num, ayah.verse_number);
              const memorized = prefs.memorization_enabled && isMemorized(num, ayah.verse_number);
              const translation = ayah.translations?.[0]?.text || '';

              return (
                <div
                  key={ayah.verse_number}
                  id={`ayah-${ayah.verse_number}`}
                  className={`py-5 border-b border-border/50 ${
                    memorized ? 'bg-primary/5' : ''
                  }`}
                >
                  {/* Ayah number + actions */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                        {ayah.verse_number}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{num}:{ayah.verse_number}</span>
                    </div>
                    <div className="flex gap-0.5">
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => handleBookmarkToggle(ayah.verse_number)}
                      >
                        <BookMarked className={`h-3.5 w-3.5 ${bookmarked ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                      </Button>
                      {prefs.memorization_enabled && (
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => {
                            toggleMemorized(num, ayah.verse_number);
                            toast(memorized ? 'Unmarked' : 'Marked as memorized');
                          }}
                        >
                          <Brain className={`h-3.5 w-3.5 ${memorized ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                        </Button>
                      )}
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => handleTafsir(ayah.verse_number)}
                      >
                        {expandedTafsir === ayah.verse_number
                          ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                          : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        }
                      </Button>
                    </div>
                  </div>

                  {/* Arabic text */}
                  <p
                    className="text-right leading-[2.2] mb-3"
                    dir="rtl"
                    style={{ fontSize: prefs.font_size, fontFamily: 'serif' }}
                  >
                    {ayah.text_uthmani}
                  </p>

                  {/* Translation */}
                  <p
                    className="text-sm text-muted-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: translation }}
                  />

                  {/* Tafsir (expandable) */}
                  {expandedTafsir === ayah.verse_number && (
                    <div className="mt-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5">Tafsir</p>
                      {tafsirLoading ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" /> Loading tafsir...
                        </div>
                      ) : (
                        <p
                          className="text-xs text-foreground/80 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: tafsirText }}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Next surah */}
        {!loading && num < 114 && (
          <div className="py-8 text-center">
            <Button variant="outline" onClick={() => goToSurah(num + 1)}>
              Next: {SURAH_NAMES[num]?.name} <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurahReader;
