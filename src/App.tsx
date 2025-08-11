import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AboutUsPage from "./pages/AboutUsPage";
import ContactPage from "./pages/ContactPage";
import LegalPage from "./pages/LegalPage";
import ScrollToTop from "./components/ScrollToTop";
import PricingPage from "./pages/PricingPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import OnboardingWizard from "./pages/OnboardingWizard";
import AuthCallback from "./components/AuthCallback";
import AuthCallbackHandler from "./pages/AuthCallbackHandler";
import { initializeSEO } from "./utils/seo";
import { analytics } from "./lib/analytics";
import { useAuth, AuthProvider } from "@/components/providers/AuthProvider";
import FeedbackWidget from "@/components/FeedbackWidget";
import FeedbackPage from "./pages/FeedbackPage";

const queryClient = new QueryClient();

// Simple full-screen loader
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-firegauge-charcoal to-gray-800">
    <div className="text-center text-white p-8 rounded-lg bg-white/10 backdrop-blur-sm max-w-md mx-4">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-firegauge-accent mx-auto mb-6" />
      <p className="text-xl font-semibold">Loading…</p>
    </div>
  </div>
);

// Main App Content Component
const AppContent = () => {
  const { loading } = useAuth();

  // Initialize SEO and analytics on app load
  useEffect(() => {
    initializeSEO();
    
    // Initialize analytics and track initial page view
    analytics.trackPageView();
    
    // Track page views on route changes
    const handleRouteChange = () => {
      analytics.trackPageView();
    };

    // Listen for route changes (for client-side routing)
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <AuthCallback />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/legal" element={<LegalPage />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/onboarding" element={<OnboardingWizard />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/auth/callback" element={<AuthCallbackHandler />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ScrollToTop />
      <FeedbackWidget />
    </BrowserRouter>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
