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
import EmailTemplateManager from "./components/EmailTemplateManager";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import CustomerDashboard from "./components/CustomerDashboard";
import { initializeSEO } from "./utils/seo";
import { analytics } from "./lib/analytics";
import { AuthProvider } from "@/components/providers/AuthProvider";

const queryClient = new QueryClient();

function App() {
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

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/legal" element={<LegalPage />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/onboarding" element={<OnboardingWizard />} />
            <Route path="/admin/emails" element={<EmailTemplateManager />} />
            <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
            <Route path="/dashboard" element={<CustomerDashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <ScrollToTop />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
