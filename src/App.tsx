import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import QadaSolatSetup from "./pages/QadaSolatSetup";
import QadaSolatTrack from "./pages/QadaSolatTrack";
import RamadhanQadaSetup from "./pages/RamadhanQadaSetup";
import RamadhanQadaTrack from "./pages/RamadhanQadaTrack";
import Fidyah from "./pages/Fidyah";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/qada-solat/setup" element={<QadaSolatSetup />} />
          <Route path="/qada-solat/track" element={<QadaSolatTrack />} />
          <Route path="/ramadhan-qada/setup" element={<RamadhanQadaSetup />} />
          <Route path="/ramadhan-qada/track" element={<RamadhanQadaTrack />} />
          <Route path="/fidyah" element={<Fidyah />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
