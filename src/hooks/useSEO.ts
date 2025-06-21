import { useEffect } from 'react';
import { updateMetaTags, SEOConfig, analyticsEvents } from '@/utils/seo';

export const useSEO = (seoConfig: Partial<SEOConfig>) => {
  useEffect(() => {
    // Update meta tags when component mounts or config changes
    updateMetaTags(seoConfig);
    
    // Track page view
    const pageName = seoConfig.title || document.title;
    analyticsEvents.pageView(pageName);
    
    // Cleanup function to reset to defaults if needed
    return () => {
      // Reset to default when component unmounts (optional)
      // updateMetaTags(defaultSEO);
    };
  }, [seoConfig]);
};

// Predefined SEO configurations for different pages
export const seoConfigs = {
  home: {
    title: 'FireGauge - The Future of Fire Hose Testing & Compliance',
    description: 'Mobile-first fire hose testing platform. 75% faster than traditional methods, 100% NFPA 1962 compliant. Try it free for 14 days.',
    canonical: 'https://firegauge.app/',
    keywords: [
      'fire hose testing',
      'NFPA 1962',
      'fire compliance',
      'digital testing',
      'fire department software'
    ]
  },
  
  pricing: {
    title: 'Pricing Plans - FireGauge Fire Hose Testing Platform',
    description: 'Choose the perfect plan for your fire department or contractor business. Free trial available. Plans starting at $99/month.',
    canonical: 'https://firegauge.app/pricing',
    keywords: [
      'fire hose testing pricing',
      'fire department software cost',
      'NFPA compliance pricing',
      'fire testing subscription'
    ]
  },
  
  about: {
    title: 'About FireGauge - Leading Fire Hose Testing Innovation',
    description: 'Learn about FireGauge\'s mission to revolutionize fire hose testing with mobile-first technology and NFPA 1962 compliance.',
    canonical: 'https://firegauge.app/about',
    keywords: [
      'fire safety company',
      'fire hose testing innovation',
      'NFPA compliance experts',
      'fire department technology'
    ]
  },
  
  contact: {
    title: 'Contact FireGauge - Get Support & Demo',
    description: 'Contact our fire safety experts for support, demos, or questions about our fire hose testing platform. Available 24/7.',
    canonical: 'https://firegauge.app/contact',
    keywords: [
      'fire safety support',
      'fire hose testing demo',
      'NFPA compliance help',
      'fire department contact'
    ]
  },
  
  help: {
    title: 'Help & Support - FireGauge Documentation',
    description: 'Complete help center with guides, FAQs, and support for FireGauge fire hose testing platform. Get answers quickly.',
    canonical: 'https://firegauge.app/help',
    keywords: [
      'fire hose testing help',
      'NFPA compliance guide',
      'fire testing documentation',
      'platform support'
    ]
  },
  
  auth: {
    title: 'Sign In - FireGauge Platform Access',
    description: 'Sign in to your FireGauge account to access fire hose testing tools, compliance reports, and digital asset management.',
    canonical: 'https://firegauge.app/auth',
    keywords: [
      'fire hose testing login',
      'platform access',
      'compliance dashboard',
      'fire testing portal'
    ]
  },
  
  dashboard: {
    title: 'Dashboard - FireGauge Platform',
    description: 'Access your fire hose testing dashboard with compliance reports, testing history, and account management.',
    canonical: 'https://firegauge.app/dashboard',
    keywords: [
      'fire testing dashboard',
      'compliance reports',
      'testing history',
      'account management'
    ]
  }
};

export default useSEO; 