import { useState } from 'react';
import AppHeader from '@/components/AppHeader';
import OnboardingTooltips from '@/components/OnboardingTooltips';
import WidgetCustomizer from '@/components/widgets/WidgetCustomizer';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useContextualGreeting } from '@/hooks/useContextualGreeting';
import RotatingHeader from '@/components/dashboard/RotatingHeader';
import HeroPrayerCard from '@/components/dashboard/HeroPrayerCard';
import DailyCheckinCard from '@/components/dashboard/DailyCheckinCard';
import AnnouncementsBanner from '@/components/dashboard/AnnouncementsBanner';
import LifeScoreCard from '@/components/dashboard/LifeScoreCard';
import QuickLogGrid from '@/components/dashboard/QuickLogGrid';
import ForYouSection from '@/components/dashboard/ForYouSection';
import DailyQuoteCard from '@/components/dashboard/DailyQuoteCard';
import WidgetGrid from '@/components/dashboard/WidgetGrid';
import FirstTimeDialog from '@/components/dashboard/FirstTimeDialog';

const Dashboard = () => {
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const { displayName, announcements, lifeScore, weeklyScores, isRamadan, ramadanDay, activeIF, widgetPrefs } = useDashboardData();
  const { preferences, loading, isFirstTime, toggleWidget, resizeWidget, reorderWidgets, initializeDefaults, setIsFirstTime } = widgetPrefs;

  const firstName = (displayName || '').split(' ')[0] || 'Muslim';
  const greeting = useContextualGreeting({
    firstName,
    isRamadan,
    ramadanDay,
  });

  return (
    <div className="min-h-screen bg-background">
      <OnboardingTooltips />
      <AppHeader
        rotatingContent={
          <RotatingHeader
            firstName={firstName}
            isRamadan={isRamadan}
            ramadanDay={ramadanDay}
            greeting={greeting}
          />
        }
      />

      <main className="max-w-md mx-auto px-5 py-4 space-y-5">
        <AnnouncementsBanner announcements={announcements} />
        <HeroPrayerCard />
        {isRamadan && <RamadanBanner ramadanDay={ramadanDay} />}
        <DailyCheckinCard />

        {/* Life Score section */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Life Score</p>
          <LifeScoreCard lifeScore={lifeScore} />
        </div>

        <QuickLogGrid />
        <ForYouSection
          isRamadan={isRamadan}
          ramadanDay={ramadanDay}
          activeIF={activeIF}
        />
        <WidgetGrid preferences={preferences} isRamadan={isRamadan} activeIF={activeIF} loading={loading} />
        <DailyQuoteCard />
        <div className="h-4" />
      </main>

      <WidgetCustomizer
        open={customizerOpen}
        onOpenChange={setCustomizerOpen}
        preferences={preferences}
        onToggle={toggleWidget}
        onResize={resizeWidget}
        onReorder={reorderWidgets}
      />

      <FirstTimeDialog
        open={isFirstTime}
        onClose={() => setIsFirstTime(false)}
        onCustomize={() => setCustomizerOpen(true)}
        onInitialize={initializeDefaults}
      />
    </div>
  );
};

export default Dashboard;
