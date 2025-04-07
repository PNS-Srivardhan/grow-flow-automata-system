
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ESPDownload from "./components/ESPDownload";
import { useEffect } from "react";
import './App.css';

// Create a new query client with retry configuration to avoid infinite loading
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Only retry once to avoid infinite loading
      refetchOnWindowFocus: false, // Disable refetching on window focus
      staleTime: 5000, // Consider data fresh for 5 seconds
    },
  },
});

const App = () => {
  useEffect(() => {
    console.log("App component mounted");
    
    // Check if Tailwind is loaded properly
    const isTailwindLoaded = document.documentElement.classList.contains('js') ||
      typeof window.__TAILWIND_CONFIG !== 'undefined';
    console.log("Tailwind loaded:", isTailwindLoaded);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/esp-download" element={<ESPDownload />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
