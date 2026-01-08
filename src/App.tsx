import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Projektek from "./pages/Projektek";
import Nyertes from "./pages/Nyertes";
import Kizart from "./pages/Kizart";
import Terkep from "./pages/Terkep";
import Statisztikak from "./pages/Statisztikak";
import Letoltes from "./pages/Letoltes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/projektek" element={<Projektek />} />
          <Route path="/nyertes" element={<Nyertes />} />
          <Route path="/kizart" element={<Kizart />} />
          <Route path="/terkep" element={<Terkep />} />
          <Route path="/statisztikak" element={<Statisztikak />} />
          <Route path="/letoltes" element={<Letoltes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
