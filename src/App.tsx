import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import AppLayout from "./components/AppLayout";
import Landing from "./pages/Landing";
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
            <Route path="/" element={<Landing />} />

            {/* Pillar pages with bottom nav */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/deen" element={<Deen />} />
              <Route path="/health" element={<Health />} />
              <Route path="/wealth" element={<Wealth />} />
              <Route path="/productivity" element={<Productivity />} />
              <Route path="/family" element={<Family />} />
            </Route>

            {/* Feature sub-pages (no bottom nav) */}
            <Route path="/qada-solat/setup" element={<QadaSolatSetup />} />
            <Route path="/qada-solat/track" element={<QadaSolatTrack />} />
            <Route path="/ramadhan-qada/setup" element={<RamadhanQadaSetup />} />
            <Route path="/ramadhan-qada/track" element={<RamadhanQadaTrack />} />
            <Route path="/fidyah" element={<Fidyah />} />
            <Route path="/deen/dhikr" element={<DhikrCounter />} />
            <Route path="/deen/zakat" element={<ZakatCalculator />} />
            <Route path="/deen/sunnah" element={<SunnahTracker />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
