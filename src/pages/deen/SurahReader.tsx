import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  BookMarked, ChevronLeft, ChevronRight, BookOpen, Brain,
  ChevronDown, ChevronUp, Loader2, Play, Pause, Volume2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuranPrefs, useQuranBookmarks, useQuranMemorization } from '@/hooks/useQuranData';
import { fetchAyahs, fetchTafsir, SURAH_NAMES, TRANSLATION_IDS, type Ayah } from '@/lib/quran-api';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const AYAHS_PER_PAGE = 25;

const RECITERS = [
  { id: 7, name: 'Mishary Rashid Alafasy' },
  { id: 5, name: 'Abu Bakr Al-Shatri' },
  { id: 6, name: 'Maher Al Muaiqly' },
  { id: 1, name: 'AbdulBaset AbdulSamad' },
  { id: 2, name: 'Abdul Rahman Al-Sudais' },
  { id: 10, name: 'Saad Al-Ghamdi' },
];

function getVerseAudioUrl(_reciterId: number, surahNum: number, ayahNum: number) {
  return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${SURAH_NAMES.slice(0, surahNum - 1).reduce((sum, su) => sum + su.ayahs, 0) + ayahNum}.mp3`;
}

// Unique session ID generated once per real navigation (survives Strict Mode).
// Written into the pending session object so duplicate flushes can be detected.
let _currentSessionId = '';

const SurahReader = () => {
  const { surahNum } = useParams<{ surahNum: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const num = Number(surahNum) || 1;
  const targetAyah = Number(searchParams.get('ayah')) || null;

  const { prefs, savePrefs } = useQuranPrefs();
  const { addBookmark, removeBookmark, isBookmarked, bookmarks } = useQuranBookmarks();
  const { toggleMemorized, isMemorized } = useQuranMemorization();

  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTafsir, setExpandedTafsir] = useState<number | null>(null);
  const [tafsirText, setTafsirText] = useState<string>('');
  const [tafsirLoading, setTafsirLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const surahInfo = SURAH_NAMES[num - 1];
  const totalPages = Math.ceil((surahInfo?.ayahs || 1) / AYAHS_PER_PAGE);

  // Audio
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [reciterId, setReciterId] = useState(7);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Position tracking
  const [lastVisibleAyah, setLastVisibleAyah] = useState<number | null>(null);
  const lastVisibleAyahRef = useRef<number | null>(null);
  const sessionStartRef = useRef<{ surah: number; ayah: number; time: number } | null>(null);
  const hasSavedSessionRef = useRef(false); // prevent duplicate inserts

  // Stable refs so cleanup effects always see the latest values without re-registering
  const savePrefsFnRef = useRef(savePrefs);
  savePrefsFnRef.current = savePrefs;
  const userRef = useRef(user);
  userRef.current = user;
  const numRef = useRef(num);
  numRef.current = num;
  

  // Resume banner: show if saved position is in this surah and no explicit ?ayah param
  const savedLastAyah = prefs.last_surah === num ? prefs.last_ayah : null;
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [resumeDismissed, setResumeDismissed] = useState(false);

  // Show resume banner only on first open, if there's a saved position and no explicit URL ayah
  useEffect(() => {
    if (!resumeDismissed && savedLastAyah && savedLastAyah > 1 && !targetAyah) {
      setShowResumeBanner(true);
    } else {
      setShowResumeBanner(false);
    }
  }, [num, savedLastAyah, targetAyah, resumeDismissed]);

  // Record session start position — always start from ayah 1 (or explicit targetAyah)
  useEffect(() => {
    // Generate a unique session ID for this navigation. Module-level so it
    // survives React Strict Mode's fake double-mount. The cleanup captures this
    // ID and uses it both as a write key and a dedup guard.
    _currentSessionId = crypto.randomUUID();
    sessionStartRef.current = { surah: num, ayah: targetAyah ?? 1, time: Date.now() };
    hasSavedSessionRef.current = false;
  }, [num, targetAyah]);

  // ── Flush any pending session saved by a previous unmount ──────────────────
  // SPA navigation aborts in-flight fetch() calls, so we write to localStorage
  // on unmount and flush on the NEXT mount of any SurahReader.
  useEffect(() => {
    const pending = localStorage.getItem('quran_pending_session');
    if (pending && userRef.current) {
      try {
        const session = JSON.parse(pending);
        const sessionId: string = session._sessionId;
        const flushedKey = 'quran_flushed_session_id';
        const alreadyFlushed = localStorage.getItem(flushedKey) === sessionId;
        if (!alreadyFlushed && sessionId) {
          localStorage.setItem(flushedKey, sessionId);
          localStorage.removeItem('quran_pending_session');
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _sessionId: _removed, ...row } = session;
          supabase.from('quran_reading_sessions').insert(row as any).then();
        }
      } catch {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  useEffect(() => {
    // Capture the session ID at the moment this effect registers.
    // Strict Mode unmounts and remounts: the first (ghost) cleanup will see
    // a stale capturedId that no longer matches _currentSessionId, so it bails.
    const capturedId = _currentSessionId;

    return () => {
      // Guard 1: Only the latest real mount writes the session.
      if (capturedId !== _currentSessionId) return;
      // Guard 2: Prevent double-write if something else already saved.
      if (hasSavedSessionRef.current) return;
      hasSavedSessionRef.current = true;

      const endAyah = lastVisibleAyahRef.current || 1;
      const start = sessionStartRef.current;
      const currentNum = numRef.current;
      const currentUser = userRef.current;
      const currentSavePrefs = savePrefsFnRef.current;

      currentSavePrefs({ last_surah: currentNum, last_ayah: endAyah });
      localStorage.setItem('quran_reading_position', JSON.stringify({ surah: currentNum, ayah: endAyah, ts: Date.now() }));

      if (currentUser && start) {
        const durationSeconds = Math.round((Date.now() - start.time) / 1000);
        const today = new Date().toISOString().split('T')[0];
        const pendingSession = {
          _sessionId: capturedId, // dedup key — stripped before DB insert
          user_id: currentUser.id,
          date: today,
          start_surah: start.surah,
          start_ayah: start.ayah,
          end_surah: currentNum,
          end_ayah: endAyah,
          duration_seconds: durationSeconds,
          ayahs_read: Math.max(1, endAyah - start.ayah + 1),
        };
        localStorage.setItem('quran_pending_session', JSON.stringify(pendingSession));
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps: registers once on mount, fires once on real unmount

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Tafsir toggle
  const handleTafsir = async (ayahNum: number) => {
    if (expandedTafsir === ayahNum) { setExpandedTafsir(null); return; }
    setExpandedTafsir(ayahNum);
    setTafsirLoading(true);
    const text = await fetchTafsir(num, ayahNum);
    setTafsirText(text);
    setTafsirLoading(false);
  };

  // Audio playback
  const handlePlayAyah = (ayahNum: number) => {
    if (playingAyah === ayahNum) {
      audioRef.current?.pause();
      setPlayingAyah(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const url = getVerseAudioUrl(reciterId, num, ayahNum);
    const audio = new Audio(url);
    audioRef.current = audio;
    setPlayingAyah(ayahNum);

    audio.play().catch(() => {
      toast.error('Audio not available for this ayah');
      setPlayingAyah(null);
    });

    audio.onended = () => {
      setPlayingAyah(null);
      const nextAyah = ayahs.find(a => a.verse_number === ayahNum + 1);
      if (nextAyah) {
        handlePlayAyah(nextAyah.verse_number);
      }
    };

    audio.onerror = () => {
      setPlayingAyah(null);
    };
  };

  // Navigation
  const goToSurah = (n: number) => {
    if (n >= 1 && n <= 114) navigate(`/iman/quran/read/${n}`);
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

  // Resume from saved position
  const handleResume = () => {
    if (savedLastAyah) {
      setCurrentPage(Math.ceil(savedLastAyah / AYAHS_PER_PAGE));
      setShowResumeBanner(false);
      setResumeDismissed(true);
      setTimeout(() => {
        const el = document.getElementById(`ayah-${savedLastAyah}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 400);
    }
  };

  const handleStartFromBeginning = () => {
    setShowResumeBanner(false);
    setResumeDismissed(true);
    setCurrentPage(1);
    sessionStartRef.current = { surah: num, ayah: 1, time: Date.now() };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
          <Button
            variant="ghost" size="icon" className="h-8 w-8"
            onClick={() => navigate('/iman/quran')}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <p className="text-sm font-semibold">{surahInfo?.name}</p>
            <p className="text-[10px] text-muted-foreground">
              {surahInfo?.arabic} · {surahInfo?.ayahs} ayahs · {surahInfo?.type}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/iman/quran')}>
            <BookOpen className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Resume Banner */}
      {showResumeBanner && savedLastAyah && (
        <div className="max-w-2xl mx-auto px-4 pt-3">
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-primary leading-tight">
              Lanjut dari <span className="font-bold">{surahInfo?.name}</span> Ayat {savedLastAyah}?
            </p>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="outline" className="h-7 text-xs px-2.5" onClick={handleStartFromBeginning}>
                Mulai dari awal
              </Button>
              <Button size="sm" className="h-7 text-xs px-2.5" onClick={handleResume}>
                Lanjut
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Surah navigation */}
      <div className="flex items-center justify-between px-4 py-2 max-w-2xl mx-auto border-b">
        <Button variant="ghost" size="sm" className="text-xs" disabled={num <= 1} onClick={() => goToSurah(num - 1)}>
          <ChevronLeft className="h-3 w-3 mr-1" />
          {num > 1 ? SURAH_NAMES[num - 2]?.name : ''}
        </Button>
        <span className="text-xs text-muted-foreground">{num} / 114</span>
        <Button variant="ghost" size="sm" className="text-xs" disabled={num >= 114} onClick={() => goToSurah(num + 1)}>
          {num < 114 ? SURAH_NAMES[num]?.name : ''}
          <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </div>

      {/* Audio reciter selector */}
      <div className="max-w-2xl mx-auto px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <Volume2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <Select value={String(reciterId)} onValueChange={v => setReciterId(Number(v))}>
            <SelectTrigger className="h-7 text-xs flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RECITERS.map(r => (
                <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bismillah */}
      {num !== 1 && num !== 9 && currentPage === 1 && (
        <div className="text-center py-6 max-w-2xl mx-auto">
          <p className="text-2xl" style={{ fontFamily: 'serif', fontSize: prefs.font_size }}>
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
        </div>
      )}

      {/* Pagination top */}
      {totalPages > 1 && (
        <div className="max-w-2xl mx-auto px-4 pt-3">
          <PaginationBar currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      {/* Ayahs */}
      <div className="max-w-2xl mx-auto px-4 pb-24">
        {loading ? (
          <div className="space-y-4 py-4">
            {[...Array(8)].map((_, i) => (
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
              const isPlaying = playingAyah === ayah.verse_number;

              return (
                <div
                  key={ayah.verse_number}
                  id={`ayah-${ayah.verse_number}`}
                  data-ayah={ayah.verse_number}
                  className={`py-5 border-b border-border/50 ${memorized ? 'bg-primary/5' : ''}`}
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
                      {/* Play audio */}
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => handlePlayAyah(ayah.verse_number)}
                      >
                        {isPlaying
                          ? <Pause className="h-3.5 w-3.5 text-primary" />
                          : <Play className="h-3.5 w-3.5 text-muted-foreground" />
                        }
                      </Button>
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
                    className={`text-right leading-[2.2] mb-3 ${isPlaying ? 'text-primary' : ''}`}
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

        {/* Pagination bottom */}
        {totalPages > 1 && !loading && (
          <div className="py-4">
            <PaginationBar currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}

        {/* Next surah (only on last page) */}
        {!loading && currentPage >= totalPages && num < 114 && (
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

// Simple pagination bar component
function PaginationBar({ currentPage, totalPages, onPageChange }: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = useMemo(() => {
    const result: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) result.push(i);
    } else {
      result.push(1);
      if (currentPage > 3) result.push('ellipsis');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        result.push(i);
      }
      if (currentPage < totalPages - 2) result.push('ellipsis');
      result.push(totalPages);
    }
    return result;
  }, [currentPage, totalPages]);

  return (
    <div className="flex items-center justify-center gap-1">
      <Button
        variant="ghost" size="icon" className="h-8 w-8"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e-${i}`} className="w-8 text-center text-xs text-muted-foreground">…</span>
        ) : (
          <Button
            key={p}
            variant={p === currentPage ? 'default' : 'ghost'}
            size="icon"
            className="h-8 w-8 text-xs"
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        )
      )}
      <Button
        variant="ghost" size="icon" className="h-8 w-8"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default SurahReader;
