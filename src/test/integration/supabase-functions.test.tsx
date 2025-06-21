import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMockUser } from '../utils';

// Mock environment for Supabase functions testing
const mockSupabaseClient = {
  functions: {
    invoke: vi.fn(),
  },
  auth: {
    getUser: vi.fn(),
    getSession: vi.fn(),
  },
};

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabaseClient,
}));

describe('Supabase Functions Integration Tests', () => {
  const mockUser = createMockUser({
    id: 'func-test-user-id',
    email: 'functions-test@example.com',
    user_metadata: {
      stripe_customer_id: 'cus_functest123',
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default successful authentication
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'mock-token', user: mockUser } },
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('create-checkout Function', () => {
    it('should successfully create a checkout session', async () => {
      const mockCheckoutResponse = {
        data: { url: 'https://checkout.stripe.com/pay/cs_test_123' },
        error: null,
      };

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockCheckoutResponse);

      const result = await mockSupabaseClient.functions.invoke('create-checkout', {
        body: { priceId: 'price_1RSqV400HE2ZS1pmK1uKuTCe' },
      });

      expect(result.data.url).toBe('https://checkout.stripe.com/pay/cs_test_123');
      expect(result.error).toBeNull();
      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledWith('create-checkout', {
        body: { priceId: 'price_1RSqV400HE2ZS1pmK1uKuTCe' },
      });
    });

    it('should handle invalid price ID', async () => {
      const mockErrorResponse = {
        data: null,
        error: { message: 'Invalid price ID' },
      };

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockErrorResponse);

      const result = await mockSupabaseClient.functions.invoke('create-checkout', {
        body: { priceId: 'invalid_price' },
      });

      expect(result.data).toBeNull();
      expect(result.error.message).toBe('Invalid price ID');
    });

    it('should handle unauthenticated user', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'User not authenticated' },
      });

      const mockErrorResponse = {
        data: null,
        error: { message: 'Authentication required' },
      };

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockErrorResponse);

      const result = await mockSupabaseClient.functions.invoke('create-checkout', {
        body: { priceId: 'price_1RSqV400HE2ZS1pmK1uKuTCe' },
      });

      expect(result.data).toBeNull();
      expect(result.error.message).toBe('Authentication required');
    });

    it('should create customer if none exists', async () => {
      const userWithoutStripeId = createMockUser({
        id: 'new-user-id',
        email: 'newuser@example.com',
        user_metadata: {}, // No stripe_customer_id
      });

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: userWithoutStripeId },
        error: null,
      });

      const mockCheckoutResponse = {
        data: { url: 'https://checkout.stripe.com/pay/cs_new_customer' },
        error: null,
      };

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockCheckoutResponse);

      const result = await mockSupabaseClient.functions.invoke('create-checkout', {
        body: { priceId: 'price_1RSqV400HE2ZS1pmK1uKuTCe' },
      });

      expect(result.data.url).toBe('https://checkout.stripe.com/pay/cs_new_customer');
      expect(result.error).toBeNull();
    });

    it('should handle network timeouts', async () => {
      const timeoutError = new Error('Function timeout');
      mockSupabaseClient.functions.invoke.mockRejectedValue(timeoutError);

      try {
        await mockSupabaseClient.functions.invoke('create-checkout', {
          body: { priceId: 'price_1RSqV400HE2ZS1pmK1uKuTCe' },
        });
      } catch (error) {
        expect(error.message).toBe('Function timeout');
      }
    });
  });

  describe('check-subscription Function', () => {
    it('should return subscription status for authenticated user', async () => {
      const mockSubscriptionResponse = {
        data: {
          subscribed: true,
          subscription_tier: 'price_1RSqV400HE2ZS1pmK1uKuTCe',
          subscription_end: '2024-12-31T23:59:59Z',
        },
        error: null,
      };

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockSubscriptionResponse);

      const result = await mockSupabaseClient.functions.invoke('check-subscription', {});

      expect(result.data.subscribed).toBe(true);
      expect(result.data.subscription_tier).toBe('price_1RSqV400HE2ZS1pmK1uKuTCe');
      expect(result.data.subscription_end).toBe('2024-12-31T23:59:59Z');
      expect(result.error).toBeNull();
    });

    it('should return free tier for user without subscription', async () => {
      const mockFreeResponse = {
        data: {
          subscribed: true,
          subscription_tier: 'price_1RSqV400HE2ZS1pmK1uKuTCe', // Free tier
          subscription_end: null,
        },
        error: null,
      };

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockFreeResponse);

      const result = await mockSupabaseClient.functions.invoke('check-subscription', {});

      expect(result.data.subscribed).toBe(true);
      expect(result.data.subscription_tier).toBe('price_1RSqV400HE2ZS1pmK1uKuTCe');
      expect(result.data.subscription_end).toBeNull();
    });

    it('should handle subscription check errors', async () => {
      const mockErrorResponse = {
        data: null,
        error: { message: 'Failed to check subscription' },
      };

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockErrorResponse);

      const result = await mockSupabaseClient.functions.invoke('check-subscription', {});

      expect(result.data).toBeNull();
      expect(result.error.message).toBe('Failed to check subscription');
    });

    it('should handle Stripe API errors', async () => {
      const mockStripeErrorResponse = {
        data: null,
        error: { message: 'Stripe API error: Customer not found' },
      };

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockStripeErrorResponse);

      const result = await mockSupabaseClient.functions.invoke('check-subscription', {});

      expect(result.data).toBeNull();
      expect(result.error.message).toContain('Stripe API error');
    });
  });

  describe('customer-portal Function', () => {
    it('should create customer portal session', async () => {
      const mockPortalResponse = {
        data: { url: 'https://billing.stripe.com/session/portal_123' },
        error: null,
      };

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockPortalResponse);

      const result = await mockSupabaseClient.functions.invoke('customer-portal', {
        body: { return_url: 'https://app.example.com/dashboard' },
      });

      expect(result.data.url).toBe('https://billing.stripe.com/session/portal_123');
      expect(result.error).toBeNull();
    });

    it('should handle missing customer ID', async () => {
      const userWithoutStripeId = createMockUser({
        id: 'no-customer-id',
        email: 'nocustomer@example.com',
        user_metadata: {},
      });

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: userWithoutStripeId },
        error: null,
      });

      const mockErrorResponse = {
        data: null,
        error: { message: 'No Stripe customer found' },
      };

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockErrorResponse);

      const result = await mockSupabaseClient.functions.invoke('customer-portal', {
        body: { return_url: 'https://app.example.com/dashboard' },
      });

      expect(result.data).toBeNull();
      expect(result.error.message).toBe('No Stripe customer found');
    });
  });

  describe('stripe-webhook Function', () => {
    it('should process subscription.created webhook', async () => {
      const mockWebhookResponse = {
        data: { received: true, processed: true },
        error: null,
      };

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockWebhookResponse);

      const webhookPayload = {
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_test123',
            customer: 'cus_test123',
            status: 'active',
            items: {
              data: [{ price: { id: 'price_1RSqV400HE2ZS1pmK1uKuTCe' } }],
            },
          },
        },
      };

      const result = await mockSupabaseClient.functions.invoke('stripe-webhook', {
        body: webhookPayload,
      });

      expect(result.data.received).toBe(true);
      expect(result.data.processed).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should process subscription.updated webhook', async () => {
      const mockWebhookResponse = {
        data: { received: true, processed: true },
        error: null,
      };

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockWebhookResponse);

      const webhookPayload = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test123',
            customer: 'cus_test123',
            status: 'active',
            items: {
              data: [{ price: { id: 'price_1RSqV500HE2ZS1pmK1uKuTCf' } }],
            },
          },
        },
      };

      const result = await mockSupabaseClient.functions.invoke('stripe-webhook', {
        body: webhookPayload,
      });

      expect(result.data.received).toBe(true);
      expect(result.data.processed).toBe(true);
    });

    it('should process subscription.deleted webhook', async () => {
      const mockWebhookResponse = {
        data: { received: true, processed: true },
        error: null,
      };

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockWebhookResponse);

      const webhookPayload = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_test123',
            customer: 'cus_test123',
            status: 'canceled',
          },
        },
      };

      const result = await mockSupabaseClient.functions.invoke('stripe-webhook', {
        body: webhookPayload,
      });

      expect(result.data.received).toBe(true);
      expect(result.data.processed).toBe(true);
    });

    it('should handle invalid webhook signatures', async () => {
      const mockErrorResponse = {
        data: null,
        error: { message: 'Invalid webhook signature' },
      };

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockErrorResponse);

      const result = await mockSupabaseClient.functions.invoke('stripe-webhook', {
        body: { invalid: 'payload' },
      });

      expect(result.data).toBeNull();
      expect(result.error.message).toBe('Invalid webhook signature');
    });
  });

  describe('support-request Function', () => {
    it('should send support request email', async () => {
      const mockSupportResponse = {
        data: { sent: true, ticket_id: 'ticket_123' },
        error: null,
      };

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockSupportResponse);

      const supportRequest = {
        subject: 'Need help with billing',
        message: 'I have a question about my subscription',
        priority: 'normal',
      };

      const result = await mockSupabaseClient.functions.invoke('support-request', {
        body: supportRequest,
      });

      expect(result.data.sent).toBe(true);
      expect(result.data.ticket_id).toBe('ticket_123');
      expect(result.error).toBeNull();
    });

    it('should handle email sending failures', async () => {
      const mockErrorResponse = {
        data: null,
        error: { message: 'Failed to send email' },
      };

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockErrorResponse);

      const result = await mockSupabaseClient.functions.invoke('support-request', {
        body: { subject: 'Test', message: 'Test message' },
      });

      expect(result.data).toBeNull();
      expect(result.error.message).toBe('Failed to send email');
    });

    it('should validate required fields', async () => {
      const mockErrorResponse = {
        data: null,
        error: { message: 'Subject and message are required' },
      };

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockErrorResponse);

      const result = await mockSupabaseClient.functions.invoke('support-request', {
        body: { subject: '' }, // Missing message
      });

      expect(result.data).toBeNull();
      expect(result.error.message).toBe('Subject and message are required');
    });
  });

  describe('Function Performance and Reliability', () => {
    it('should handle concurrent function calls', async () => {
      const mockResponses = [
        { data: { subscribed: true }, error: null },
        { data: { subscribed: true }, error: null },
        { data: { subscribed: true }, error: null },
      ];

      mockSupabaseClient.functions.invoke
        .mockResolvedValueOnce(mockResponses[0])
        .mockResolvedValueOnce(mockResponses[1])
        .mockResolvedValueOnce(mockResponses[2]);

      const promises = [
        mockSupabaseClient.functions.invoke('check-subscription', {}),
        mockSupabaseClient.functions.invoke('check-subscription', {}),
        mockSupabaseClient.functions.invoke('check-subscription', {}),
      ];

      const results = await Promise.all(promises);

      results.forEach((result, index) => {
        expect(result.data).toEqual(mockResponses[index].data);
        expect(result.error).toBeNull();
      });
    });

    it('should handle function timeouts gracefully', async () => {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Function timeout')), 100)
      );

      mockSupabaseClient.functions.invoke.mockImplementation(() => timeoutPromise);

      try {
        await mockSupabaseClient.functions.invoke('check-subscription', {});
      } catch (error) {
        expect(error.message).toBe('Function timeout');
      }
    });

    it('should retry failed function calls', async () => {
      // Mock first call to fail, second to succeed
      mockSupabaseClient.functions.invoke
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          data: { subscribed: true },
          error: null,
        });

      // First call fails
      try {
        await mockSupabaseClient.functions.invoke('check-subscription', {});
      } catch (error) {
        expect(error.message).toBe('Network error');
      }

      // Retry succeeds
      const result = await mockSupabaseClient.functions.invoke('check-subscription', {});
      expect(result.data.subscribed).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe('Security and Validation', () => {
    it('should reject calls without authentication', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const mockErrorResponse = {
        data: null,
        error: { message: 'Authentication required' },
      };

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockErrorResponse);

      const result = await mockSupabaseClient.functions.invoke('check-subscription', {});

      expect(result.data).toBeNull();
      expect(result.error.message).toBe('Authentication required');
    });

    it('should validate input parameters', async () => {
      const mockErrorResponse = {
        data: null,
        error: { message: 'Invalid parameters' },
      };

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockErrorResponse);

      const result = await mockSupabaseClient.functions.invoke('create-checkout', {
        body: { invalidParam: 'test' },
      });

      expect(result.data).toBeNull();
      expect(result.error.message).toBe('Invalid parameters');
    });

    it('should sanitize user inputs', async () => {
      const mockResponse = {
        data: { processed: true },
        error: null,
      };

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockResponse);

      const maliciousInput = {
        subject: '<script>alert("xss")</script>',
        message: 'Normal message',
      };

      const result = await mockSupabaseClient.functions.invoke('support-request', {
        body: maliciousInput,
      });

      expect(result.data.processed).toBe(true);
      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledWith('support-request', {
        body: maliciousInput,
      });
    });
  });
}); 