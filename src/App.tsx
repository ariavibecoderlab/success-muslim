import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import AppLayout from "./components/AppLayout";
import AuthGuard from "./components/AuthGuard";
import AdminGuard from "./components/AdminGuard";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";
import Deen from "./pages/Deen";
import Health from "./pages/Health";
import Wealth from "./pages/Wealth";
import Productivity from "./pages/Productivity";
import Family from "./pages/Family";
import QadaSolatSetup from "./pages/QadaSolatSetup";
import QadaSolatTrack from "./pages/QadaSolatTrack";
import RamadhanQadaSetup from "./pages/RamadhanQadaSetup";
import RamadhanQadaTrack from "./pages/RamadhanQadaTrack";
import Fidyah from "./pages/Fidyah";
import DhikrCounter from "./pages/DhikrCounter";
import ZakatCalculator from "./pages/ZakatCalculator";
import SunnahTracker from "./pages/SunnahTracker";
import HealthBMI from "./pages/health/HealthBMI";
import HealthWeight from "./pages/health/HealthWeight";
import HealthHydration from "./pages/health/HealthHydration";
import HealthSleep from "./pages/health/HealthSleep";
import HealthFasting from "./pages/health/HealthFasting";
import HealthIFTimer from "./pages/health/HealthIFTimer";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ErrorBoundary>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected pillar pages with bottom nav */}
            <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/deen" element={<Deen />} />
              <Route path="/health" element={<Health />} />
              <Route path="/wealth" element={<Wealth />} />
              <Route path="/productivity" element={<Productivity />} />
              <Route path="/family" element={<Family />} />
            </Route>

            {/* Protected feature sub-pages (no bottom nav) */}
            <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
            <Route path="/qada-solat/setup" element={<AuthGuard><QadaSolatSetup /></AuthGuard>} />
            <Route path="/qada-solat/track" element={<AuthGuard><QadaSolatTrack /></AuthGuard>} />
            <Route path="/ramadhan-qada/setup" element={<AuthGuard><RamadhanQadaSetup /></AuthGuard>} />
            <Route path="/ramadhan-qada/track" element={<AuthGuard><RamadhanQadaTrack /></AuthGuard>} />
            <Route path="/fidyah" element={<AuthGuard><Fidyah /></AuthGuard>} />
            <Route path="/deen/dhikr" element={<AuthGuard><DhikrCounter /></AuthGuard>} />
            <Route path="/deen/zakat" element={<AuthGuard><ZakatCalculator /></AuthGuard>} />
            <Route path="/deen/sunnah" element={<AuthGuard><SunnahTracker /></AuthGuard>} />
            <Route path="/health/bmi" element={<AuthGuard><HealthBMI /></AuthGuard>} />
            <Route path="/health/weight" element={<AuthGuard><HealthWeight /></AuthGuard>} />
            <Route path="/health/hydration" element={<AuthGuard><HealthHydration /></AuthGuard>} />
            <Route path="/health/sleep" element={<AuthGuard><HealthSleep /></AuthGuard>} />
            <Route path="/health/fasting" element={<AuthGuard><HealthFasting /></AuthGuard>} />
            <Route path="/health/if-timer" element={<AuthGuard><HealthIFTimer /></AuthGuard>} />

            {/* Admin routes */}
            <Route element={<AdminGuard><AdminLayout /></AdminGuard>}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/announcements" element={<AdminAnnouncements />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
