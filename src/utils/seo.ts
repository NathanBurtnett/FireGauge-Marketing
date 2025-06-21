export interface SEOConfig {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  keywords?: string[];
  author?: string;
}

export const defaultSEO: SEOConfig = {
  title: 'FireGauge - The Future of Fire Hose Testing & Compliance',
  description: 'Mobile-first fire hose testing platform. 75% faster than traditional methods, 100% NFPA 1962 compliant. Try it free for 14 days.',
  image: '/firegauge-og-image.jpg',
  type: 'website',
  keywords: [
    'fire hose testing',
    'NFPA 1962',
    'fire compliance',
    'digital testing',
    'fire department software',
    'hose testing equipment',
    'mobile testing platform',
    'fire safety compliance'
  ],
  author: 'FireGauge'
};

export const updateMetaTags = (seoConfig: Partial<SEOConfig>) => {
  const config = { ...defaultSEO, ...seoConfig };
  
  // Update document title
  document.title = config.title;
  
  // Update meta description
  updateMetaTag('description', config.description);
  
  // Update meta keywords
  if (config.keywords) {
    updateMetaTag('keywords', config.keywords.join(', '));
  }
  
  // Update meta author
  if (config.author) {
    updateMetaTag('author', config.author);
  }
  
  // Update Open Graph tags
  updateMetaTag('og:title', config.title, 'property');
  updateMetaTag('og:description', config.description, 'property');
  updateMetaTag('og:type', config.type || 'website', 'property');
  
  if (config.image) {
    updateMetaTag('og:image', config.image, 'property');
  }
  
  if (config.canonical) {
    updateMetaTag('og:url', config.canonical, 'property');
  }
  
  // Update Twitter Card tags
  updateMetaTag('twitter:card', 'summary_large_image', 'name');
  updateMetaTag('twitter:title', config.title, 'name');
  updateMetaTag('twitter:description', config.description, 'name');
  
  if (config.image) {
    updateMetaTag('twitter:image', config.image, 'name');
  }
  
  // Update canonical URL
  if (config.canonical) {
    updateCanonicalLink(config.canonical);
  }
};

const updateMetaTag = (name: string, content: string, attribute: 'name' | 'property' = 'name') => {
  let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  
  element.content = content;
};

const updateCanonicalLink = (url: string) => {
  let element = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }
  
  element.href = url;
};

// Structured Data (JSON-LD) generators
export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "FireGauge",
  "description": "Mobile-first fire hose testing platform for NFPA 1962 compliance",
  "url": "https://firegauge.app",
  "logo": "https://firegauge.app/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-800-347-3428",
    "contactType": "customer service",
    "email": "support@firegauge.app",
    "availableLanguage": ["English"]
  },
  "sameAs": [
    "https://twitter.com/firegauge",
    "https://linkedin.com/company/firegauge"
  ]
});

export const generateSoftwareSchema = () => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "FireGauge",
  "description": "Mobile-first fire hose testing platform for NFPA 1962 compliance",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web, iOS, Android",
  "offers": {
    "@type": "Offer",
    "price": "99",
    "priceCurrency": "USD",
    "priceValidUntil": "2025-12-31",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "247",
    "bestRating": "5"
  }
});

export const injectStructuredData = (data: object) => {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

// Analytics event tracking
export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

export const trackEvent = ({ action, category, label, value }: AnalyticsEvent) => {
  // Google Analytics 4 gtag tracking
  if (typeof gtag !== 'undefined') {
    gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }
  
  // Fallback console logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics Event:', { action, category, label, value });
  }
};

// Common analytics events
export const analyticsEvents = {
  // Navigation
  pageView: (page: string) => trackEvent({
    action: 'page_view',
    category: 'Navigation',
    label: page
  }),
  
  // User engagement
  ctaClick: (location: string) => trackEvent({
    action: 'cta_click',
    category: 'Engagement',
    label: location
  }),
  
  // Conversion tracking
  signupStarted: () => trackEvent({
    action: 'signup_started',
    category: 'Conversion'
  }),
  
  signupCompleted: (plan: string) => trackEvent({
    action: 'signup_completed',
    category: 'Conversion',
    label: plan
  }),
  
  pricingViewed: () => trackEvent({
    action: 'pricing_viewed',
    category: 'Engagement'
  }),
  
  planSelected: (plan: string) => trackEvent({
    action: 'plan_selected',
    category: 'Conversion',
    label: plan
  }),
  
  // Support
  supportRequested: (type: string) => trackEvent({
    action: 'support_requested',
    category: 'Support',
    label: type
  }),
  
  // Content engagement
  videoPlayed: (video: string) => trackEvent({
    action: 'video_played',
    category: 'Content',
    label: video
  }),
  
  downloadStarted: (file: string) => trackEvent({
    action: 'download_started',
    category: 'Content',
    label: file
  })
};

// Performance monitoring utilities
let performanceObserversInitialized = false;
let lastCLSReport = 0;
const CLS_REPORT_INTERVAL = 5000; // Only report CLS every 5 seconds

export const trackCoreWebVitals = () => {
  // Prevent multiple initialization
  if (performanceObserversInitialized) {
    return;
  }
  performanceObserversInitialized = true;

  // Track First Contentful Paint (FCP) - only once
  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        trackEvent({
          action: 'first_contentful_paint',
          category: 'Performance',
          value: Math.round(entry.startTime)
        });
      }
    }
  }).observe({ type: 'paint', buffered: true });
  
  // Track Largest Contentful Paint (LCP) - only report the final value
  let lcpReported = false;
  new PerformanceObserver((entryList) => {
    if (lcpReported) return;
    
    const entries = entryList.getEntries();
    const lastEntry = entries[entries.length - 1];
    
    // Only report after page is fully loaded to get final LCP
    setTimeout(() => {
      if (!lcpReported) {
        lcpReported = true;
        trackEvent({
          action: 'largest_contentful_paint',
          category: 'Performance',
          value: Math.round(lastEntry.startTime)
        });
      }
    }, 2000);
  }).observe({ type: 'largest-contentful-paint', buffered: true });
  
  // Track Cumulative Layout Shift (CLS) - throttled reporting
  let clsValue = 0;
  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
      }
    }
    
    // Throttle CLS reporting
    const now = Date.now();
    if (now - lastCLSReport > CLS_REPORT_INTERVAL) {
      lastCLSReport = now;
      trackEvent({
        action: 'cumulative_layout_shift',
        category: 'Performance',
        value: Math.round(clsValue * 1000)
      });
    }
  }).observe({ type: 'layout-shift', buffered: true });
};

// Sitemap generation utility
export const generateSitemap = () => {
  const baseUrl = 'https://firegauge.app';
  const pages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/pricing', priority: '0.9', changefreq: 'monthly' },
    { url: '/about', priority: '0.7', changefreq: 'monthly' },
    { url: '/contact', priority: '0.7', changefreq: 'monthly' },
    { url: '/help', priority: '0.6', changefreq: 'weekly' },
    { url: '/auth', priority: '0.8', changefreq: 'weekly' }
  ];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  
  return sitemap;
};

// Initialize SEO and analytics
export const initializeSEO = () => {
  // Inject structured data
  injectStructuredData(generateOrganizationSchema());
  injectStructuredData(generateSoftwareSchema());
  
  // Track core web vitals
  if (typeof window !== 'undefined') {
    trackCoreWebVitals();
  }
};

declare global {
  function gtag(...args: any[]): void;
} 