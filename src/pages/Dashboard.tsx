import AppHeader from '@/components/AppHeader';
import OnboardingTooltips from '@/components/OnboardingTooltips';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useContextualGreeting } from '@/hooks/useContextualGreeting';
import RotatingHeader from '@/components/dashboard/RotatingHeader';
import HeroPrayerCard from '@/components/dashboard/HeroPrayerCard';
import RamadanBanner from '@/components/dashboard/RamadanBanner';
import DailyCheckinCard from '@/components/dashboard/DailyCheckinCard';
import AnnouncementsBanner from '@/components/dashboard/AnnouncementsBanner';
import LifeScoreCard from '@/components/dashboard/LifeScoreCard';
import QuickLogGrid from '@/components/dashboard/QuickLogGrid';
import ForYouSection from '@/components/dashboard/ForYouSection';

const Dashboard = () => {
  const { displayName, announcements, lifeScore, isRamadan, ramadanDay, activeIF, dailyDhikrCount } = useDashboardData();

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
        {isRamadan && <RamadanBanner ramadanDay={ramadanDay} />}
        <HeroPrayerCard />
        <QuickLogGrid />
        <DailyCheckinCard />

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Life Score</p>
          <LifeScoreCard lifeScore={lifeScore} />
        </div>
        <ForYouSection
          isRamadan={isRamadan}
          ramadanDay={ramadanDay}
          activeIF={activeIF}
          dhikrCount={dailyDhikrCount}
        />
      </main>
    </div>
  );
};

export default Dashboard;
