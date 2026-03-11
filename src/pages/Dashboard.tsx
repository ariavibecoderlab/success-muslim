import { useState } from 'react';
import AppHeader from '@/components/AppHeader';
import OnboardingTooltips from '@/components/OnboardingTooltips';
import WidgetCustomizer from '@/components/widgets/WidgetCustomizer';
import { useDashboardData } from '@/hooks/useDashboardData';
import AnnouncementsBanner from '@/components/dashboard/AnnouncementsBanner';
import LifeScoreCard from '@/components/dashboard/LifeScoreCard';
import QuickLogGrid from '@/components/dashboard/QuickLogGrid';
import DailyQuoteCard from '@/components/dashboard/DailyQuoteCard';
import WidgetGrid from '@/components/dashboard/WidgetGrid';
import FirstTimeDialog from '@/components/dashboard/FirstTimeDialog';

const Dashboard = () => {
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const { displayName, announcements, lifeScore, weeklyScores, isRamadan, activeIF, widgetPrefs } = useDashboardData();
  const { preferences, loading, isFirstTime, toggleWidget, resizeWidget, reorderWidgets, initializeDefaults, setIsFirstTime } = widgetPrefs;

  return (
    <div className="min-h-screen bg-background">
      <OnboardingTooltips />
      <AppHeader showHijriDate showGregorianDate />

      <main className="max-w-md mx-auto px-5 py-4 space-y-4">
        <AnnouncementsBanner announcements={announcements} />
        <LifeScoreCard lifeScore={lifeScore} weeklyScores={weeklyScores} />
        <QuickLogGrid />
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
