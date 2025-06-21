declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Analytics configuration interface
export interface AnalyticsConfig {
  measurementId: string;
  debugMode?: boolean;
  cookieFlags?: string;
}

// Event tracking interfaces
export interface ConversionEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  currency?: string;
  transactionId?: string;
}

export interface UserProperties {
  userId?: string;
  email?: string;
  planType?: string;
  departmentName?: string;
  signupDate?: string;
  lifetimeValue?: number;
}

export interface PageViewData {
  page_title?: string;
  page_location?: string;
  page_path?: string;
  custom_map?: Record<string, any>;
}

class AnalyticsService {
  private measurementId: string;
  private isInitialized: boolean = false;
  private debugMode: boolean = false;
  private eventQueue: Array<() => void> = [];

  constructor(config: AnalyticsConfig) {
    this.measurementId = config.measurementId;
    this.debugMode = config.debugMode || false;
    
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize(): void {
    try {
      // Initialize dataLayer
      window.dataLayer = window.dataLayer || [];
      
      // Define gtag function
      window.gtag = function gtag(...args: any[]) {
        window.dataLayer.push(arguments);
      };

      // Load Google Analytics script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
      document.head.appendChild(script);

      // Initialize GA4
      window.gtag('js', new Date());
      window.gtag('config', this.measurementId, {
        send_page_view: false, // We'll handle page views manually
        debug_mode: this.debugMode,
        allow_google_signals: true,
        allow_ad_personalization_signals: true,
        custom_map: {
          custom_parameter_1: 'plan_type',
          custom_parameter_2: 'department_name',
          custom_parameter_3: 'signup_source'
        }
      });

      this.isInitialized = true;
      
      // Process queued events
      this.eventQueue.forEach(eventFn => eventFn());
      this.eventQueue = [];

      if (this.debugMode) {
        console.log('Analytics initialized with Measurement ID:', this.measurementId);
      }
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  private executeOrQueue(fn: () => void): void {
    if (this.isInitialized && typeof window !== 'undefined' && window.gtag) {
      fn();
    } else {
      this.eventQueue.push(fn);
    }
  }

  // Page view tracking
  public trackPageView(data: PageViewData = {}): void {
    this.executeOrQueue(() => {
      const pageData = {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname + window.location.search,
        ...data
      };

      window.gtag('event', 'page_view', pageData);
      
      if (this.debugMode) {
        console.log('Page view tracked:', pageData);
      }
    });
  }

  // User identification and properties
  public identifyUser(properties: UserProperties): void {
    this.executeOrQueue(() => {
      if (properties.userId) {
        window.gtag('config', this.measurementId, {
          user_id: properties.userId
        });
      }

      // Set user properties
      const userProps: Record<string, any> = {};
      
      if (properties.email) userProps.email_hash = this.hashEmail(properties.email);
      if (properties.planType) userProps.plan_type = properties.planType;
      if (properties.departmentName) userProps.department_name = properties.departmentName;
      if (properties.signupDate) userProps.signup_date = properties.signupDate;
      if (properties.lifetimeValue) userProps.lifetime_value = properties.lifetimeValue;

      window.gtag('set', { user_properties: userProps });

      if (this.debugMode) {
        console.log('User identified:', userProps);
      }
    });
  }

  // Conversion tracking
  public trackConversion(event: ConversionEvent): void {
    this.executeOrQueue(() => {
      const eventData: Record<string, any> = {
        event_category: event.category,
        event_label: event.label,
      };

      if (event.value) eventData.value = event.value;
      if (event.currency) eventData.currency = event.currency;
      if (event.transactionId) eventData.transaction_id = event.transactionId;

      window.gtag('event', event.action, eventData);

      if (this.debugMode) {
        console.log('Conversion tracked:', event);
      }
    });
  }

  // E-commerce tracking
  public trackPurchase(data: {
    transactionId: string;
    value: number;
    currency: string;
    items: Array<{
      item_id: string;
      item_name: string;
      category: string;
      quantity: number;
      price: number;
    }>;
    coupon?: string;
  }): void {
    this.executeOrQueue(() => {
      window.gtag('event', 'purchase', {
        transaction_id: data.transactionId,
        value: data.value,
        currency: data.currency,
        coupon: data.coupon,
        items: data.items
      });

      if (this.debugMode) {
        console.log('Purchase tracked:', data);
      }
    });
  }

  // Lead generation tracking
  public trackLead(data: {
    leadType: string;
    value?: number;
    currency?: string;
    source?: string;
  }): void {
    this.executeOrQueue(() => {
      window.gtag('event', 'generate_lead', {
        event_category: 'Lead Generation',
        event_label: data.leadType,
        value: data.value,
        currency: data.currency || 'USD',
        lead_source: data.source
      });

      if (this.debugMode) {
        console.log('Lead tracked:', data);
      }
    });
  }

  // Custom event tracking
  public trackEvent(eventName: string, parameters: Record<string, any> = {}): void {
    this.executeOrQueue(() => {
      window.gtag('event', eventName, parameters);

      if (this.debugMode) {
        console.log('Custom event tracked:', eventName, parameters);
      }
    });
  }

  // Funnel step tracking
  public trackFunnelStep(step: {
    funnelName: string;
    stepNumber: number;
    stepName: string;
    value?: number;
  }): void {
    this.executeOrQueue(() => {
      window.gtag('event', 'funnel_step', {
        event_category: 'Funnel',
        event_label: `${step.funnelName} - Step ${step.stepNumber}: ${step.stepName}`,
        funnel_name: step.funnelName,
        step_number: step.stepNumber,
        step_name: step.stepName,
        value: step.value
      });

      if (this.debugMode) {
        console.log('Funnel step tracked:', step);
      }
    });
  }

  // Form tracking
  public trackFormSubmission(formData: {
    formName: string;
    formLocation: string;
    success: boolean;
    errorMessage?: string;
  }): void {
    this.executeOrQueue(() => {
      const eventName = formData.success ? 'form_submit_success' : 'form_submit_error';
      
      window.gtag('event', eventName, {
        event_category: 'Form',
        event_label: formData.formName,
        form_name: formData.formName,
        form_location: formData.formLocation,
        error_message: formData.errorMessage
      });

      if (this.debugMode) {
        console.log('Form submission tracked:', formData);
      }
    });
  }

  // Engagement tracking
  public trackEngagement(data: {
    engagementType: string;
    duration?: number;
    interactionCount?: number;
  }): void {
    this.executeOrQueue(() => {
      window.gtag('event', 'user_engagement', {
        event_category: 'Engagement',
        event_label: data.engagementType,
        engagement_time_msec: data.duration,
        interaction_count: data.interactionCount
      });
    });
  }

  // Utility functions
  private hashEmail(email: string): string {
    // Simple hash function for privacy compliance
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  // Debug utilities
  public getDebugInfo(): object {
    return {
      measurementId: this.measurementId,
      isInitialized: this.isInitialized,
      debugMode: this.debugMode,
      queuedEvents: this.eventQueue.length
    };
  }

  // Enhanced measurement events (automatically tracked by GA4)
  public enableEnhancedMeasurement(): void {
    if (this.debugMode) {
      console.log('Enhanced measurement is enabled by default in GA4. Events include:');
      console.log('- Page views, Scrolls, Outbound clicks, Site search, Video engagement, File downloads');
    }
  }
}

// Pre-configured analytics instance
const analyticsConfig: AnalyticsConfig = {
  measurementId: import.meta.env.VITE_GA4_MEASUREMENT_ID || 'G-XXXXXXXXXX',
  debugMode: import.meta.env.NODE_ENV === 'development',
};

export const analytics = new AnalyticsService(analyticsConfig);

// Convenience functions for common tracking scenarios
export const trackingHelpers = {
  // Marketing funnel tracking
  trackSignupStart: () => analytics.trackFunnelStep({
    funnelName: 'User Signup',
    stepNumber: 1,
    stepName: 'Signup Started'
  }),

  trackSignupComplete: (planType: string, value: number) => {
    analytics.trackConversion({
      action: 'sign_up',
      category: 'User Acquisition',
      label: planType,
      value: value,
      currency: 'USD'
    });
    analytics.trackFunnelStep({
      funnelName: 'User Signup',
      stepNumber: 2,
      stepName: 'Signup Completed',
      value: value
    });
  },

  trackOnboardingStart: () => analytics.trackFunnelStep({
    funnelName: 'User Onboarding',
    stepNumber: 1,
    stepName: 'Onboarding Started'
  }),

  trackOnboardingComplete: () => {
    analytics.trackConversion({
      action: 'onboarding_complete',
      category: 'User Activation',
      label: 'Onboarding Wizard'
    });
    analytics.trackFunnelStep({
      funnelName: 'User Onboarding',
      stepNumber: 4,
      stepName: 'Onboarding Completed'
    });
  },

  trackPricingView: (planType?: string) => analytics.trackEvent('view_pricing', {
    event_category: 'Marketing',
    plan_viewed: planType
  }),

  trackContactForm: (success: boolean, errorMessage?: string) => analytics.trackFormSubmission({
    formName: 'Contact Form',
    formLocation: 'Contact Page',
    success,
    errorMessage
  }),

  trackTrialStart: (planType: string) => analytics.trackConversion({
    action: 'begin_checkout',
    category: 'Trial',
    label: planType
  }),

  trackSubscriptionUpgrade: (fromPlan: string, toPlan: string, value: number) => {
    analytics.trackConversion({
      action: 'subscription_upgrade',
      category: 'Revenue',
      label: `${fromPlan} to ${toPlan}`,
      value: value,
      currency: 'USD'
    });
  }
};

// React hook for analytics
export const useAnalytics = () => {
  return {
    trackPageView: analytics.trackPageView.bind(analytics),
    trackEvent: analytics.trackEvent.bind(analytics),
    trackConversion: analytics.trackConversion.bind(analytics),
    identifyUser: analytics.identifyUser.bind(analytics),
    trackLead: analytics.trackLead.bind(analytics),
    helpers: trackingHelpers
  };
};

export default analytics;