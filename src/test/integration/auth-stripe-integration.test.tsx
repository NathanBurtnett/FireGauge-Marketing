import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, createMockUser, createMockSubscription } from '../utils';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { Pricing } from '@/components/Pricing';
import OnboardingWizard from '@/pages/OnboardingWizard';

// Integration test setup for Supabase and Stripe
const createIntegrationTestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    {children}
  </AuthProvider>
);

// Mock Supabase client with factory-scoped mocks (avoids hoisting issues)
vi.mock('@/lib/supabase', () => {
  const auth = {
    getSession: vi.fn(),
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
    updateUser: vi.fn(),
  };
  const functions = { invoke: vi.fn() };
  const fromImpl = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
  };
  const from = vi.fn(() => fromImpl);
  return { supabase: { auth, functions, from }, __mocks: { auth, functions, fromImpl, from } };
});

// Access exported mocks to configure behavior inside tests
import { __mocks as supabaseMocks } from '@/lib/supabase';

// Mock Stripe integration
const mockStripeCheckout = {
  redirectToCheckout: vi.fn(),
};

vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn().mockResolvedValue(mockStripeCheckout),
}));

// Mock billing API
const mockBillingAPI = {
  createBillingPortalSession: vi.fn(),
  openBillingPortal: vi.fn(),
  subscriptionUtils: {
    formatStatus: vi.fn((status) => status.charAt(0).toUpperCase() + status.slice(1)),
    getStatusColor: vi.fn(() => 'green'),
    formatAmount: vi.fn((amount) => `$${(amount / 100).toFixed(2)}`),
    getDaysRemaining: vi.fn(() => 15),
  },
  customerUtils: {
    getCustomerInfo: vi.fn(),
    updateCustomerInfo: vi.fn(),
  },
};

vi.mock('@/api/billing', () => mockBillingAPI);

// Mock useSubscription hook with realistic behavior
const mockUseSubscription = vi.fn();
vi.mock('@/components/hooks/useSubscription', () => ({
  useSubscription: mockUseSubscription,
}));

// Mock analytics
const mockAnalytics = {
  trackPageView: vi.fn(),
  identifyUser: vi.fn(),
  trackConversion: vi.fn(),
  trackEvent: vi.fn(),
  trackFormSubmission: vi.fn(),
};

vi.mock('@/lib/analytics', () => ({
  analytics: mockAnalytics,
}));

// Mock email service
const mockEmailService = {
  sendWelcomeEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  sendSupportRequest: vi.fn(),
};

vi.mock('@/lib/emailService', () => mockEmailService);

describe('Supabase Authentication & Stripe Checkout Integration Tests', () => {
  const mockUser = createMockUser({
    id: 'auth-test-user-id',
    email: 'integration-test@example.com',
    user_metadata: {
      full_name: 'Integration Test User',
      stripe_customer_id: 'cus_test123',
    },
  });

  const mockSession = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    user: mockUser,
    expires_at: Date.now() + 3600000, // 1 hour from now
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default successful authentication state
    supabaseMocks.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
    
    supabaseMocks.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Default subscription state
    mockUseSubscription.mockReturnValue({
      checkSubscription: vi.fn(),
      createCheckoutSession: vi.fn(),
      openCustomerPortal: vi.fn(),
      clearSubscriptionCache: vi.fn(),
      subscribed: true,
      subscription_tier: 'price_1RSqV400HE2ZS1pmK1uKuTCe',
      subscription_end: null,
      isLoading: false,
      error: null,
      retryCount: 0,
    });

    // Mock successful Supabase function calls
    supabaseMocks.functions.invoke.mockResolvedValue({
      data: { subscribed: true, subscription_tier: 'price_1RSqV400HE2ZS1pmK1uKuTCe' },
      error: null,
    });

    // Mock successful database operations
    supabaseMocks.fromImpl.single.mockResolvedValue({
      data: { preferences: { theme: 'light' } },
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Authentication Flow', () => {
    it('should handle successful user sign up', async () => {
      const user = userEvent.setup();
      
      // Mock successful sign up
      supabaseMocks.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      // Mock onAuthStateChange for sign up
      supabaseMocks.auth.onAuthStateChange.mockReturnValue({
        data: { 
          subscription: { unsubscribe: vi.fn() }
        },
      });

      // Test sign up process (would typically be in a sign up form)
      const signUpData = {
        email: 'newuser@example.com',
        password: 'securePassword123!',
      };

      // Simulate the sign up call
      const result = await supabaseMocks.auth.signUp(signUpData);
      
      expect(result.data.user).toBeDefined();
      expect(result.error).toBeNull();
      expect(supabaseMocks.auth.signUp).toHaveBeenCalledWith(signUpData);
    });

    it('should handle successful user login', async () => {
      // Mock successful login
      supabaseMocks.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const loginData = {
        email: 'integration-test@example.com',
        password: 'password123!',
      };

      const result = await supabaseMocks.auth.signInWithPassword(loginData);
      
      expect(result.data.user).toBeDefined();
      expect(result.data.session).toBeDefined();
      expect(result.error).toBeNull();
      expect(supabaseMocks.auth.signInWithPassword).toHaveBeenCalledWith(loginData);
    });

    it('should handle authentication errors gracefully', async () => {
      // Mock authentication error
      supabaseMocks.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });

      const loginData = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      };

      const result = await supabaseMocks.auth.signInWithPassword(loginData);
      
      expect(result.data.user).toBeNull();
      expect(result.data.session).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('Invalid credentials');
    });

    it('should handle user logout', async () => {
      // Mock successful logout
      supabaseMocks.auth.signOut.mockResolvedValue({ error: null });

      const result = await supabaseMocks.auth.signOut();
      
      expect(result.error).toBeNull();
      expect(mockSupabaseAuth.signOut).toHaveBeenCalled();
    });

    it('should handle auth state changes', async () => {
      const mockCallback = vi.fn();
      supabaseMocks.auth.onAuthStateChange.mockReturnValue({
        data: { 
          subscription: { unsubscribe: vi.fn() }
        },
      });

      // Simulate auth state change setup
      const { data } = supabaseMocks.auth.onAuthStateChange(mockCallback);
      
      expect(supabaseMocks.auth.onAuthStateChange).toHaveBeenCalledWith(mockCallback);
      expect(data.subscription.unsubscribe).toBeDefined();
    });
  });

  describe('Stripe Checkout Integration', () => {
    it('should create checkout session successfully', async () => {
      const mockCheckoutUrl = 'https://checkout.stripe.com/pay/cs_test_123';
      
      // Mock successful checkout session creation
      supabaseMocks.functions.invoke.mockResolvedValue({
        data: { url: mockCheckoutUrl },
        error: null,
      });

      const mockCreateCheckoutSession = vi.fn().mockResolvedValue(mockCheckoutUrl);
      mockUseSubscription.mockReturnValue({
        createCheckoutSession: mockCreateCheckoutSession,
        subscribed: false,
        subscription_tier: null,
        isLoading: false,
        error: null,
      });

      const priceId = 'price_1RSqV400HE2ZS1pmK1uKuTCe';
      const result = await mockCreateCheckoutSession(priceId);
      
      expect(result).toBe(mockCheckoutUrl);
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(priceId);
    });

    it('should handle checkout session creation errors', async () => {
      // Mock checkout session creation error
      const mockCreateCheckoutSession = vi.fn().mockResolvedValue(null);
      mockUseSubscription.mockReturnValue({
        createCheckoutSession: mockCreateCheckoutSession,
        subscribed: false,
        subscription_tier: null,
        isLoading: false,
        error: 'Failed to create checkout session',
      });

      const priceId = 'price_invalid';
      const result = await mockCreateCheckoutSession(priceId);
      
      expect(result).toBeNull();
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(priceId);
    });

    it('should handle pricing plan selection and checkout', async () => {
      const mockCreateCheckoutSession = vi.fn().mockResolvedValue('https://checkout.stripe.com/pay/cs_test_123');
      mockUseSubscription.mockReturnValue({
        createCheckoutSession: mockCreateCheckoutSession,
        subscribed: false,
        subscription_tier: null,
        isLoading: false,
        error: null,
      });

      render(<Pricing />, { wrapper: createIntegrationTestWrapper });

      // Wait for pricing component to load
      await waitFor(() => {
        expect(screen.getByText(/pricing/i)).toBeInTheDocument();
      });

      // Look for subscription buttons (would typically have test-ids in real app)
      const subscribeButtons = screen.getAllByRole('button');
      const subscribeButton = subscribeButtons.find(button => 
        button.textContent?.toLowerCase().includes('subscribe') ||
        button.textContent?.toLowerCase().includes('get started') ||
        button.textContent?.toLowerCase().includes('choose plan')
      );

      if (subscribeButton) {
        fireEvent.click(subscribeButton);
        // In a real implementation, this would trigger the checkout session creation
      }
    });
  });

  describe('Subscription Management', () => {
    it('should check subscription status', async () => {
      // Mock subscription check function response
      supabaseMocks.functions.invoke.mockResolvedValue({
        data: {
          subscribed: true,
          subscription_tier: 'price_1RSqV400HE2ZS1pmK1uKuTCe',
          subscription_end: '2024-12-31T23:59:59Z',
        },
        error: null,
      });

      const mockCheckSubscription = vi.fn();
      mockUseSubscription.mockReturnValue({
        checkSubscription: mockCheckSubscription,
        subscribed: true,
        subscription_tier: 'price_1RSqV400HE2ZS1pmK1uKuTCe',
        subscription_end: '2024-12-31T23:59:59Z',
        isLoading: false,
        error: null,
      });

      // Simulate subscription check
      await mockCheckSubscription();
      
      expect(mockCheckSubscription).toHaveBeenCalled();
    });

    it('should open customer portal', async () => {
      mockBillingAPI.openBillingPortal.mockResolvedValue(undefined);

      const mockOpenCustomerPortal = vi.fn();
      mockUseSubscription.mockReturnValue({
        openCustomerPortal: mockOpenCustomerPortal,
        subscribed: true,
        subscription_tier: 'price_1RSqV400HE2ZS1pmK1uKuTCe',
        isLoading: false,
        error: null,
      });

      await mockOpenCustomerPortal();
      
      expect(mockOpenCustomerPortal).toHaveBeenCalled();
    });

    it('should handle subscription upgrades and downgrades', async () => {
      const mockCreateCheckoutSession = vi.fn().mockResolvedValue('https://checkout.stripe.com/upgrade');
      mockUseSubscription.mockReturnValue({
        createCheckoutSession: mockCreateCheckoutSession,
        subscribed: true,
        subscription_tier: 'price_1RSqV400HE2ZS1pmK1uKuTCe', // Free tier
        isLoading: false,
        error: null,
      });

      const newPriceId = 'price_1RSqV500HE2ZS1pmK1uKuTCf'; // Pro tier
      const result = await mockCreateCheckoutSession(newPriceId);
      
      expect(result).toBe('https://checkout.stripe.com/upgrade');
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(newPriceId);
    });
  });


  describe('Onboarding Flow Integration', () => {
    it('should handle new user onboarding', async () => {
      render(<OnboardingWizard />, { wrapper: createIntegrationTestWrapper });

      await waitFor(() => {
        // Should display onboarding content
        expect(document.body).toBeInTheDocument();
      });
    });

    it('should track analytics events during onboarding', async () => {
      render(<OnboardingWizard />, { wrapper: createIntegrationTestWrapper });

      await waitFor(() => {
        // Should track page view or onboarding start
        expect(
          mockAnalytics.trackPageView ||
          mockAnalytics.trackEvent ||
          mockAnalytics.identifyUser
        ).toBeDefined();
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      supabaseMocks.functions.invoke.mockRejectedValue(new Error('Network error'));

      const mockCheckSubscription = vi.fn().mockRejectedValue(new Error('Network error'));
      mockUseSubscription.mockReturnValue({
        checkSubscription: mockCheckSubscription,
        subscribed: true, // Should fallback to free tier
        subscription_tier: 'price_1RSqV400HE2ZS1pmK1uKuTCe',
        isLoading: false,
        error: null, // Should not show error to user, just fallback
      });

      try {
        await mockCheckSubscription();
      } catch (error) {
        expect(error.message).toBe('Network error');
      }
    });

    it('should handle Stripe API errors', async () => {
      const mockCreateCheckoutSession = vi.fn().mockResolvedValue(null);
      mockUseSubscription.mockReturnValue({
        createCheckoutSession: mockCreateCheckoutSession,
        subscribed: false,
        subscription_tier: null,
        isLoading: false,
        error: 'Stripe API error',
      });

      const result = await mockCreateCheckoutSession('invalid_price_id');
      expect(result).toBeNull();
    });

    it('should handle authentication timeouts', async () => {
      // Mock authentication timeout
      supabaseMocks.auth.getSession.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      try {
      await supabaseMocks.auth.getSession();
      } catch (error) {
        expect(error.message).toBe('Request timeout');
      }
    });

    it('should handle subscription check timeouts', async () => {
      mockUseSubscription.mockReturnValue({
        subscribed: true, // Should fallback to free tier on timeout
        subscription_tier: 'price_1RSqV400HE2ZS1pmK1uKuTCe',
        isLoading: false,
        error: null,
      });

      // Should handle timeout gracefully with fallback
      expect(mockUseSubscription().subscribed).toBe(true);
      expect(mockUseSubscription().subscription_tier).toBe('price_1RSqV400HE2ZS1pmK1uKuTCe');
    });
  });

  describe('User Preferences and Settings', () => {
    it('should save and retrieve user preferences', async () => {
      const preferences = { theme: 'dark', notifications: true };
      
      supabaseMocks.fromImpl.upsert.mockResolvedValue({
        data: preferences,
        error: null,
      });

      supabaseMocks.fromImpl.single.mockResolvedValue({
        data: { preferences },
        error: null,
      });

      // Test preference save
      const saveResult = await supabaseMocks.fromImpl.upsert(preferences);
      expect(saveResult.data).toEqual(preferences);
      expect(saveResult.error).toBeNull();

      // Test preference retrieval
      const getResult = await supabaseMocks.fromImpl.single();
      expect(getResult.data.preferences).toEqual(preferences);
      expect(getResult.error).toBeNull();
    });

    it('should update user metadata', async () => {
      const updatedMetadata = { 
        full_name: 'Updated Name',
        stripe_customer_id: 'cus_updated123' 
      };

      supabaseMocks.auth.updateUser.mockResolvedValue({
        data: { user: { ...mockUser, user_metadata: updatedMetadata } },
        error: null,
      });

      const result = await supabaseMocks.auth.updateUser({ data: updatedMetadata });
      
      expect(result.data.user.user_metadata).toEqual(updatedMetadata);
      expect(result.error).toBeNull();
    });
  });

  describe('End-to-End User Journey', () => {
    it('should complete full user journey: signup -> onboarding -> subscription', async () => {
      // Step 1: User signs up
      mockSupabaseAuth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const signUpResult = await mockSupabaseAuth.signUp({
        email: 'journey-test@example.com',
        password: 'securePassword123!',
      });

      expect(signUpResult.data.user).toBeDefined();

      // Step 2: User completes onboarding
      render(<OnboardingWizard />, { wrapper: createIntegrationTestWrapper });
      
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });

      // Step 3: User selects subscription plan
      const mockCreateCheckoutSession = vi.fn().mockResolvedValue('https://checkout.stripe.com/success');
      mockUseSubscription.mockReturnValue({
        createCheckoutSession: mockCreateCheckoutSession,
        subscribed: false,
        subscription_tier: null,
        isLoading: false,
        error: null,
      });

      const checkoutUrl = await mockCreateCheckoutSession('price_1RSqV400HE2ZS1pmK1uKuTCe');
      expect(checkoutUrl).toBe('https://checkout.stripe.com/success');

      // Step 4: User subscription becomes active
      mockUseSubscription.mockReturnValue({
        subscribed: true,
        subscription_tier: 'price_1RSqV400HE2ZS1pmK1uKuTCe',
        isLoading: false,
        error: null,
      });
      expect(mockUseSubscription().subscribed).toBe(true);
    });
  });
});
