import React, { useEffect } from 'react';
import { useSEO, seoConfigs } from '@/hooks/useSEO';
import { analyticsEvents } from '@/utils/seo';
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Benefits from "@/components/Benefits";
import ROIBanner from "@/components/ROIBanner";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

const Index = () => {
  // Initialize SEO for home page
  useSEO(seoConfigs.home);

  useEffect(() => {
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));

    // Cleanup on unmount
    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // Track engagement events
  const handleCTAClick = (location: string) => {
    analyticsEvents.ctaClick(location);
  };

  const handlePricingView = () => {
    analyticsEvents.pricingViewed();
  };

  return (
    <div className="min-h-screen relative">
      <Navbar />
      <main>
        <Hero onCTAClick={() => handleCTAClick('hero')} />
        <Benefits />
        <ROIBanner />
        <Features />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTASection 
          onCTAClick={() => handleCTAClick('bottom')} 
          onPricingClick={handlePricingView}
        />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Index;
