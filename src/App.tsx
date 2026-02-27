import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import { EditModeProvider } from "./contexts/EditModeContext";
import EditModeToggle from "./components/cms/EditModeToggle";
import AppLayout from "./components/AppLayout";
import AuthGuard from "./components/AuthGuard";
import AdminGuard from "./components/AdminGuard";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";
import Iman from "./pages/Deen";
import Health from "./pages/Health";
import Wealth from "./pages/Wealth";
import Productivity from "./pages/Productivity";
import Family from "./pages/Family";
import CreateFamily from "./pages/family/CreateFamily";
import JoinFamily from "./pages/family/JoinFamily";
import FamilyDashboard from "./pages/family/FamilyDashboard";
import MemberProfile from "./pages/family/MemberProfile";
import FamilySettings from "./pages/family/FamilySettings";
import QadaSolatSetup from "./pages/QadaSolatSetup";
import QadaSolatTrack from "./pages/QadaSolatTrack";
import RamadhanQadaSetup from "./pages/RamadhanQadaSetup";
import RamadhanQadaTrack from "./pages/RamadhanQadaTrack";
import Fidyah from "./pages/Fidyah";
import DhikrCounter from "./pages/DhikrCounter";
import ZakatCalculator from "./pages/ZakatCalculator";
import SunnahTracker from "./pages/SunnahTracker";
import QuranTracker from "./pages/QuranTracker";
import QuranReader from "./pages/deen/QuranReader";
import SurahReader from "./pages/deen/SurahReader";
import PrayerTimes from "./pages/deen/PrayerTimes";
import DeenFasting from "./pages/deen/DeenFasting";
import SadaqahTracker from "./pages/deen/SadaqahTracker";
import QiyamPlanner from "./pages/deen/QiyamPlanner";
import RamadanOptimizer from "./pages/deen/RamadanOptimizer";
import HajjUmrahPlanner from "./pages/deen/HajjUmrahPlanner";
import DailyDakwah from "./pages/deen/DailyDakwah";
import SalahLog from "./pages/deen/SalahLog";
import HealthBMI from "./pages/health/HealthBMI";
import HealthWeight from "./pages/health/HealthWeight";
import HealthHydration from "./pages/health/HealthHydration";
import HealthSleep from "./pages/health/HealthSleep";
import HealthFasting from "./pages/health/HealthFasting";
import HealthIFTimer from "./pages/health/HealthIFTimer";
import IFOnboarding from "./pages/health/IFOnboarding";
import HealthSteps from "./pages/health/HealthSteps";
import DailyTasks from "./pages/productivity/DailyTasks";
import HabitStreaks from "./pages/productivity/HabitStreaks";
import LifeAreas from "./pages/productivity/LifeAreas";
import BudgetTracker from "./pages/wealth/BudgetTracker";
import SavingsGoals from "./pages/wealth/SavingsGoals";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminDawah from "./pages/admin/AdminDawah";
import AdminSystem from "./pages/admin/AdminSystem";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import Install from "./pages/Install";
import Features from "./pages/Features";
import About from "./pages/About";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      retry: 2,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <TooltipProvider>
      <ErrorBoundary>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <EditModeProvider>
            <EditModeToggle />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/install" element={<Install />} />
              <Route path="/features" element={<Features />} />
              <Route path="/about" element={<About />} />

              {/* Protected pillar pages with bottom nav */}
              <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/iman" element={<Iman />} />
                <Route path="/health" element={<Health />} />
                <Route path="/wealth" element={<Wealth />} />
                <Route path="/productivity" element={<Productivity />} />
                <Route path="/family" element={<Family />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Protected feature sub-pages (no bottom nav) */}
              <Route path="/qada-solat/setup" element={<AuthGuard><QadaSolatSetup /></AuthGuard>} />
              <Route path="/qada-solat/track" element={<AuthGuard><QadaSolatTrack /></AuthGuard>} />
              <Route path="/ramadhan-qada/setup" element={<AuthGuard><RamadhanQadaSetup /></AuthGuard>} />
              <Route path="/ramadhan-qada/track" element={<AuthGuard><RamadhanQadaTrack /></AuthGuard>} />
              <Route path="/fidyah" element={<AuthGuard><Fidyah /></AuthGuard>} />
              <Route path="/iman/dhikr" element={<AuthGuard><DhikrCounter /></AuthGuard>} />
              <Route path="/iman/zakat" element={<AuthGuard><ZakatCalculator /></AuthGuard>} />
              <Route path="/iman/sunnah" element={<AuthGuard><SunnahTracker /></AuthGuard>} />
              <Route path="/iman/quran" element={<AuthGuard><QuranReader /></AuthGuard>} />
              <Route path="/iman/quran/read/:surahNum" element={<AuthGuard><SurahReader /></AuthGuard>} />
              <Route path="/iman/quran/legacy" element={<AuthGuard><QuranTracker /></AuthGuard>} />
              <Route path="/iman/prayer-times" element={<AuthGuard><PrayerTimes /></AuthGuard>} />
              <Route path="/iman/salah-log" element={<AuthGuard><SalahLog /></AuthGuard>} />
              <Route path="/iman/fasting" element={<AuthGuard><DeenFasting /></AuthGuard>} />
              <Route path="/iman/sadaqah" element={<AuthGuard><SadaqahTracker /></AuthGuard>} />
              <Route path="/iman/qiyam" element={<AuthGuard><QiyamPlanner /></AuthGuard>} />
              <Route path="/iman/ramadan" element={<AuthGuard><RamadanOptimizer /></AuthGuard>} />
              <Route path="/iman/hajj" element={<AuthGuard><HajjUmrahPlanner /></AuthGuard>} />
              <Route path="/iman/dakwah" element={<AuthGuard><DailyDakwah /></AuthGuard>} />
              <Route path="/health/bmi" element={<AuthGuard><HealthBMI /></AuthGuard>} />
              <Route path="/health/weight" element={<AuthGuard><HealthWeight /></AuthGuard>} />
              <Route path="/health/hydration" element={<AuthGuard><HealthHydration /></AuthGuard>} />
              <Route path="/health/sleep" element={<AuthGuard><HealthSleep /></AuthGuard>} />
              <Route path="/health/fasting" element={<AuthGuard><HealthFasting /></AuthGuard>} />
              <Route path="/health/if-timer" element={<AuthGuard><HealthIFTimer /></AuthGuard>} />
              <Route path="/health/if-onboarding" element={<AuthGuard><IFOnboarding /></AuthGuard>} />
              <Route path="/health/steps" element={<AuthGuard><HealthSteps /></AuthGuard>} />
              <Route path="/productivity/tasks" element={<AuthGuard><DailyTasks /></AuthGuard>} />
              <Route path="/productivity/habits" element={<AuthGuard><HabitStreaks /></AuthGuard>} />
              <Route path="/productivity/life-areas" element={<AuthGuard><LifeAreas /></AuthGuard>} />
              <Route path="/wealth/budget" element={<AuthGuard><BudgetTracker /></AuthGuard>} />
              <Route path="/wealth/savings" element={<AuthGuard><SavingsGoals /></AuthGuard>} />

              {/* Family sub-pages (no AppLayout) */}
              <Route path="/family/create" element={<AuthGuard><CreateFamily /></AuthGuard>} />
              <Route path="/family/join" element={<AuthGuard><JoinFamily /></AuthGuard>} />
              <Route path="/family/join/:code" element={<AuthGuard><JoinFamily /></AuthGuard>} />
              <Route path="/family/:id/dashboard" element={<AuthGuard><FamilyDashboard /></AuthGuard>} />
              <Route path="/family/:id/member/:uid" element={<AuthGuard><MemberProfile /></AuthGuard>} />
              <Route path="/family/:id/settings" element={<AuthGuard><FamilySettings /></AuthGuard>} />

              {/* Admin routes */}
              <Route element={<AdminGuard><AdminLayout /></AdminGuard>}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/dawah" element={<AdminDawah />} />
                <Route path="/admin/announcements" element={<AdminAnnouncements />} />
                <Route path="/admin/system" element={<AdminSystem />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </EditModeProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
