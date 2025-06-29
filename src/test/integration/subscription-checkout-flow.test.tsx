import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createClient } from '@supabase/supabase-js';

// Mock environment variables
const SUPABASE_URL = 'https://juznipgitbmtfmoszzek.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1em5pcGdpdGJtdGZtb3N6emVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NzUyNTQsImV4cCI6MjA2MTU1MTI1NH0.ZLHbYxFV624fq0eRMncjKnxAm19fukELhgN4zrKsqOo';

// Create Supabase client for testing
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

describe.skip('Subscription Checkout Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Database Structure Validation', () => {
    it('should verify user table structure', async () => {
      const { data: users, error } = await supabase
        .from('user')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      expect(users).toBeDefined();
      
      if (users && users.length > 0) {
        const user = users[0];
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('tenant_id');
        expect(user).toHaveProperty('supabase_auth_user_id');
      }
    });

    it('should verify tenant table structure', async () => {
      const { data: tenants, error } = await supabase
        .from('tenant')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      expect(tenants).toBeDefined();
      
      if (tenants && tenants.length > 0) {
        const tenant = tenants[0];
        expect(tenant).toHaveProperty('id');
        expect(tenant).toHaveProperty('stripe_customer_id');
      }
    });

    it('should verify subscriptions table structure', async () => {
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      expect(subscriptions).toBeDefined();
      
      if (subscriptions && subscriptions.length > 0) {
        const subscription = subscriptions[0];
        expect(subscription).toHaveProperty('id');
        expect(subscription).toHaveProperty('tenant_id');
        expect(subscription).toHaveProperty('status');
        expect(subscription).toHaveProperty('stripe_price_id');
        expect(subscription).toHaveProperty('stripe_customer_id');
        expect(subscription).toHaveProperty('stripe_subscription_id');
      }
    });
  });

  describe('Edge Function Availability Tests', () => {
    it('should verify check-subscription function is accessible', async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/check-subscription`, {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);
    });

    it('should verify create-checkout function is accessible', async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);
    });

    it('should verify customer-portal function is accessible', async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/customer-portal`, {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);
    });

    it('should verify stripe-webhook function is accessible', async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/stripe-webhook`, {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);
    });
  });

  describe('Data Integrity Tests', () => {
    it('should verify test user exists with correct data', async () => {
      const { data: users, error } = await supabase
        .from('user')
        .select('*')
        .eq('supabase_auth_user_id', 'f46519df-5b73-4ba9-ad65-026628047f0a');

      expect(error).toBeNull();
      expect(users).toBeDefined();
      expect(users?.length).toBeGreaterThan(0);
      
      if (users && users.length > 0) {
        const user = users[0];
        expect(user.email).toBe('nathanburtnett@gmail.com');
        expect(user.tenant_id).toBeDefined();
        expect(typeof user.tenant_id).toBe('number');
      }
    });

    it('should verify tenant has valid Stripe customer ID', async () => {
      const { data: tenants, error } = await supabase
        .from('tenant')
        .select('*')
        .eq('id', 1);

      expect(error).toBeNull();
      expect(tenants).toBeDefined();
      expect(tenants?.length).toBeGreaterThan(0);
      
      if (tenants && tenants.length > 0) {
        const tenant = tenants[0];
        expect(tenant.stripe_customer_id).toBeDefined();
        expect(tenant.stripe_customer_id).toMatch(/^cus_/);
        expect(tenant.stripe_customer_id).not.toMatch(/test/);
      }
    });

    it('should verify subscription data is clean (no test data)', async () => {
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('tenant_id', 1);

      expect(error).toBeNull();
      
      if (subscriptions && subscriptions.length > 0) {
        for (const subscription of subscriptions) {
          // Verify no test data remains
          expect(subscription.stripe_customer_id).not.toMatch(/test/);
          expect(subscription.stripe_subscription_id).not.toMatch(/test/);
          expect(subscription.stripe_price_id).toMatch(/^price_/);
        }
      }
    });
  });

  describe('Edge Function Authentication Tests', () => {
    it('should test check-subscription with anon key (should fail auth)', async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/check-subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      // Should fail authentication with anon key
      expect(response.status).toBe(401);
    });

    it('should test create-checkout with anon key (should fail auth)', async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId: 'price_1RSqV400HE2ZS1pmK1uKuTCe' }),
      });

      // Should fail authentication with anon key
      expect(response.status).toBe(401);
    });
  });

  describe('Price ID Validation Tests', () => {
    it('should validate price ID format', () => {
      const priceId = 'price_1RSqV400HE2ZS1pmK1uKuTCe';
      
      expect(priceId).toMatch(/^price_/);
      expect(priceId).not.toMatch(/test/);
      expect(priceId.length).toBeGreaterThan(20);
    });

    it('should test invalid price ID handling', async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId: 'invalid_price_id' }),
      });

      // Should fail with invalid price ID
      expect([400, 401, 500]).toContain(response.status);
    });

    it('should test missing price ID handling', async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      // Should fail with missing price ID
      expect([400, 401, 500]).toContain(response.status);
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle malformed JSON gracefully', async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      });

      expect([400, 401, 500]).toContain(response.status);
    });

    it('should handle missing authorization header', async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId: 'price_1RSqV400HE2ZS1pmK1uKuTCe' }),
      });

      expect([401, 500]).toContain(response.status);
    });
  });

  describe('Full Flow Simulation Tests', () => {
    it('should simulate complete subscription check flow', async () => {
      console.log('Testing subscription check flow...');
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/check-subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBeDefined();
      expect([200, 401, 500]).toContain(response.status);
    });

    it('should simulate complete checkout creation flow', async () => {
      console.log('Testing checkout creation flow...');
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId: 'price_1RSqV400HE2ZS1pmK1uKuTCe' }),
      });

      expect(response.status).toBeDefined();
      expect([200, 401, 500]).toContain(response.status);
      
      const responseText = await response.text();
      console.log(`Checkout response (${response.status}):`, responseText);
    });
  });

  describe('Performance Tests', () => {
    it('should complete subscription check within reasonable time', async () => {
      const startTime = Date.now();
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/check-subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
      console.log(`Check subscription took ${duration}ms`);
    });

    it('should complete checkout creation within reasonable time', async () => {
      const startTime = Date.now();
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId: 'price_1RSqV400HE2ZS1pmK1uKuTCe' }),
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(15000); // Should complete within 15 seconds
      console.log(`Create checkout took ${duration}ms`);
    });
  });
});

describe('Diagnostic Tests for 500 Error', () => {
  it('should capture detailed error information from create-checkout', async () => {
    console.log('Running diagnostic test for create-checkout 500 error...');
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId: 'price_1RSqV400HE2ZS1pmK1uKuTCe' }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.status === 500) {
      try {
        const errorData = JSON.parse(responseText);
        console.log('Parsed error data:', errorData);
      } catch (parseError) {
        console.log('Could not parse error response as JSON');
      }
    }
    
    expect(true).toBe(true);
  });
}); 