import { useState } from 'react';
import { BookOpen, Plus, Minus, Flame, Target, Trophy, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import SubPageLayout from '@/components/SubPageLayout';
import {
  getQuranDay, addQuranPages, logQuranPages,
  getTotalPagesRead, getKhatamCount, getCurrentKhatamProgress,
  getCurrentKhatamPercent, getQuranStreak, getWeeklyHistory,
  getEstimatedKhatamDays, TOTAL_PAGES, todayKey,
} from '@/lib/quran-storage';
import { format, subDays } from 'date-fns';
import BackdateDatePicker from '@/components/BackdateDatePicker';
import BackdatePrompt from '@/components/BackdatePrompt';

const IMAN_SIBLINGS = [
  { path: '/iman/dhikr', label: 'Dhikr' },
  { path: '/iman/sunnah', label: 'Sunnah' },
  { path: '/iman/quran', label: 'Quran' },
  { path: '/iman/zakat', label: 'Zakat' },
];

const QuranTracker = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const isToday = dateKey === todayKey();

  const [dayData, setDayData] = useState(() => getQuranDay(dateKey));
  const refreshDay = () => setDayData(getQuranDay(dateKey));
  const totalPages = getTotalPagesRead();
  const khatamCount = getKhatamCount();
  const khatamProgress = getCurrentKhatamProgress();
  const khatamPercent = getCurrentKhatamPercent();
  const streak = getQuranStreak();
  const weekly = getWeeklyHistory();
  const estDays = getEstimatedKhatamDays();

  const handleAddPages = (amount: number) => {
    addQuranPages(amount, dateKey);
    refreshDay();
  };

  const handleSurahChange = (surah: string) => {
    logQuranPages(dayData.pagesRead, dayData.juzNumber, surah, dayData.notes, dateKey);
    refreshDay();
  };

  const handleJuzChange = (juz: string) => {
    const num = parseInt(juz) || null;
    logQuranPages(dayData.pagesRead, num, dayData.surahName, dayData.notes, dateKey);
    refreshDay();
  };

  const handleBackdatePrompt = () => {
    setSelectedDate(subDays(new Date(), 1));
  };

  // Ring for khatam progress
  const ringSize = 140;
  const strokeWidth = 8;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (khatamPercent / 100) * circumference;

  const dayLabel = isToday ? "Today's" : format(selectedDate, 'd MMM');

  return (
    <SubPageLayout title="Quran Tracker" backTo="/iman" siblingRoutes={IMAN_SIBLINGS} currentPath="/iman/quran">
      <div className="space-y-5">
        {/* Backdate */}
        <BackdatePrompt moduleKey="quran" onLogPastData={handleBackdatePrompt} />
        <BackdateDatePicker selectedDate={selectedDate} onDateChange={(d) => { setSelectedDate(d); setDayData(getQuranDay(format(d, 'yyyy-MM-dd'))); }} />

        {/* Khatam Progress Ring */}
        <div className="flex flex-col items-center">
          <div className="relative" style={{ width: ringSize, height: ringSize }}>
            <svg className="-rotate-90" width={ringSize} height={ringSize}>
              <circle cx={ringSize / 2} cy={ringSize / 2} r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth={strokeWidth} />
              <circle
                cx={ringSize / 2} cy={ringSize / 2} r={radius} fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary mb-1" />
              <span className="text-2xl font-bold">{khatamProgress}</span>
              <span className="text-[10px] text-muted-foreground">/ {TOTAL_PAGES} pages</span>
            </div>
          </div>
          {khatamCount > 0 && (
            <div className="flex items-center gap-1 mt-2 text-xs text-primary font-medium">
              <Trophy className="h-3.5 w-3.5" />
              {khatamCount} Khatam{khatamCount > 1 ? 's' : ''} completed
            </div>
          )}
        </div>

        {/* Day's Reading */}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{dayLabel} Reading</p>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Button variant="outline" size="icon" onClick={() => handleAddPages(-1)} disabled={dayData.pagesRead <= 0}>
                <Minus className="h-4 w-4" />
              </Button>
              <div className="text-center min-w-[80px]">
                <p className="text-3xl font-bold">{dayData.pagesRead}</p>
                <p className="text-xs text-muted-foreground">pages {isToday ? 'today' : format(selectedDate, 'd MMM')}</p>
              </div>
              <Button variant="outline" size="icon" onClick={() => handleAddPages(1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="flex-1" onClick={() => handleAddPages(2)}>+2</Button>
              <Button size="sm" variant="secondary" className="flex-1" onClick={() => handleAddPages(5)}>+5</Button>
              <Button size="sm" variant="secondary" className="flex-1" onClick={() => handleAddPages(10)}>+10</Button>
              <Button size="sm" variant="secondary" className="flex-1" onClick={() => handleAddPages(20)}>+1 Juz</Button>
            </div>
          </CardContent>
        </Card>

        {/* Current position */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Position</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground">Surah</label>
                <Input
                  placeholder="e.g. Al-Baqarah"
                  value={dayData.surahName}
                  onChange={e => handleSurahChange(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Juz</label>
                <Input
                  placeholder="1-30"
                  type="number"
                  min={1}
                  max={30}
                  value={dayData.juzNumber || ''}
                  onChange={e => handleJuzChange(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <Flame className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">{streak}</p>
              <p className="text-[10px] text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <BookOpen className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">{totalPages}</p>
              <p className="text-[10px] text-muted-foreground">Total Pages</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Target className="h-4 w-4 text-accent-foreground mx-auto mb-1" />
              <p className="text-lg font-bold">{estDays}</p>
              <p className="text-[10px] text-muted-foreground">Days to Khatam</p>
            </CardContent>
          </Card>
        </div>

        {/* Khatam progress bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground">Khatam Progress</p>
              <span className="text-xs font-bold text-primary">{khatamPercent}%</span>
            </div>
            <Progress value={khatamPercent} className="h-2" />
            <p className="text-[10px] text-muted-foreground mt-1.5">
              {khatamProgress} of {TOTAL_PAGES} pages · ~{estDays} days remaining at 4 pages/day
            </p>
          </CardContent>
        </Card>

        {/* Weekly chart */}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-3">Last 7 Days</p>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={weekly}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
                  formatter={(value: number) => [`${value} pages`, 'Read']}
                />
                <Bar dataKey="pages" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </SubPageLayout>
  );
};

export default QuranTracker;