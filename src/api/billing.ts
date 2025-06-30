// Stripe Billing Portal API Integration
// This module handles creating billing portal sessions for customer subscription management
// and supports both subscription checkout and invoice/quote creation

import { BillingMethod, BillingCycle, type BillingSelection } from '@/config/stripe-config';

export interface BillingPortalSessionRequest {
  customer_id: string;
  return_url?: string;
}

export interface BillingPortalSessionResponse {
  url: string;
  session_id: string;
}

export interface CheckoutSessionRequest {
  priceId: string;
  planName: string;
  billingMethod: BillingMethod;
  billingCycle: BillingCycle;
  metadata?: Record<string, string>;
}

export interface InvoiceRequest {
  priceId: string;
  planName: string;
  billingCycle: BillingCycle;
  customerInfo: {
    email: string;
    name?: string;
    phone?: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code: string;
      country?: string;
    };
  };
  metadata?: Record<string, string>;
}

export interface CheckoutResponse {
  url: string;
  sessionId: string;
  flowType: string;
}

export interface InvoiceResponse {
  success: boolean;
  invoice: {
    id: string;
    total: number;
    currency: string;
    status: string;
    hostedInvoiceUrl: string;
    invoicePdf?: string;
  };
  customer: {
    id: string;
    email: string;
  };
  message: string;
}

/**
 * Creates a Stripe billing portal session for a customer
 * In production, this would be implemented on your backend server
 */
export const createBillingPortalSession = async (
  customerId: string,
  returnUrl?: string
): Promise<BillingPortalSessionResponse> => {
  const baseUrl = window.location.origin;
  const defaultReturnUrl = `${baseUrl}/dashboard`;

  try {
    const response = await fetch('/api/create-billing-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`, // Add auth as needed
      },
      body: JSON.stringify({
        customer_id: customerId,
        return_url: returnUrl || defaultReturnUrl
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create billing portal session: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    throw error;
  }
};

/**
 * Creates a Stripe checkout session for subscription billing
 */
export const createCheckoutSession = async (
  request: CheckoutSessionRequest
): Promise<CheckoutResponse> => {
  try {
    console.log(`[BILLING] Creating checkout session for ${request.planName}`);
    
    const { supabase } = await import('@/lib/supabase');
    
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: {
        priceId: request.priceId,
        metadata: {
          plan_name: request.planName,
          billing_method: request.billingMethod,
          billing_cycle: request.billingCycle,
          source: 'marketing_site',
          checkout_session_id: Date.now().toString(),
          requires_account_creation: 'true',
          ...request.metadata,
        }
      }
    });

    if (error) {
      console.error('[BILLING] Supabase function error:', error);
      throw error;
    }

    if (!data?.url) {
      console.error('[BILLING] No checkout URL returned:', data);
      throw new Error('No checkout URL returned from server');
    }

    console.log('[BILLING] Checkout session created successfully:', data.url);
    return {
      url: data.url,
      sessionId: data.sessionId,
      flowType: data.flowType || 'subscription'
    };
  } catch (error) {
    console.error('[BILLING] Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Creates a Stripe invoice for quote/invoice billing
 */
export const createInvoice = async (
  request: InvoiceRequest
): Promise<InvoiceResponse> => {
  try {
    console.log(`[BILLING] Creating invoice for ${request.planName}`);
    
    const { supabase } = await import('@/lib/supabase');
    
    const { data, error } = await supabase.functions.invoke('create-invoice', {
      body: {
        priceId: request.priceId,
        planName: request.planName,
        billingCycle: request.billingCycle,
        customerInfo: request.customerInfo,
        metadata: {
          source: 'marketing_site',
          billing_method: 'invoice',
          billing_cycle: request.billingCycle,
          ...request.metadata,
        }
      }
    });

    if (error) {
      console.error('[BILLING] Supabase invoice function error:', error);
      throw error;
    }

    if (!data?.success) {
      console.error('[BILLING] Invoice creation failed:', data);
      throw new Error(data?.error || 'Invoice creation failed');
    }

    console.log('[BILLING] Invoice created successfully:', data.invoice.id);
    return data;
  } catch (error) {
    console.error('[BILLING] Error creating invoice:', error);
    throw error;
  }
};

/**
 * Universal billing handler that routes to appropriate method
 */
export const processBilling = async (
  selection: BillingSelection,
  customerInfo?: InvoiceRequest['customerInfo']
): Promise<CheckoutResponse | InvoiceResponse> => {
  const { planId, method, cycle, priceId } = selection;
  
  console.log(`[BILLING] Processing ${method} billing for plan ${planId} (${cycle})`);

  if (method === BillingMethod.SUBSCRIPTION) {
    return createCheckoutSession({
      priceId,
      planName: planId,
      billingMethod: method,
      billingCycle: cycle,
    });
  } else if (method === BillingMethod.INVOICE) {
    if (!customerInfo) {
      throw new Error('Customer information is required for invoice billing');
    }
    return createInvoice({
      priceId,
      planName: planId,
      billingCycle: cycle,
      customerInfo,
    });
  } else {
    throw new Error(`Unsupported billing method: ${method}`);
  }
};

/**
 * Opens the Stripe billing portal in a new tab
 * Handles both production and demo modes
 */
export const openBillingPortal = async (
  customerId: string,
  returnUrl?: string,
  isDemo: boolean = false
): Promise<void> => {
  if (isDemo) {
    // For demo purposes, open Stripe's test billing portal
    window.open('https://billing.stripe.com/p/login/test_demo', '_blank');
    return;
  }

  try {
    const session = await createBillingPortalSession(customerId, returnUrl);
    window.open(session.url, '_blank');
  } catch (error) {
    console.error('Failed to open billing portal:', error);
    throw error;
  }
};

/**
 * Get auth token for API requests
 * Replace with your actual authentication implementation
 */
const getAuthToken = (): string => {
  // In production, get this from your auth provider (e.g., Supabase, Auth0, etc.)
  return localStorage.getItem('auth_token') || '';
};

/**
 * Subscription management utilities
 */
export const subscriptionUtils = {
  /**
   * Format subscription status for display
   */
  formatStatus: (status: string): string => {
    return status.replace('_', ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  /**
   * Get status color for badges
   */
  getStatusColor: (status: string): string => {
    switch (status) {
      case 'active':
        return 'green';
      case 'trialing':
        return 'blue';
      case 'past_due':
        return 'red';
      case 'canceled':
        return 'gray';
      default:
        return 'gray';
    }
  },

  /**
   * Format currency amount for display
   */
  formatAmount: (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount / 100); // Stripe amounts are in cents
  },

  /**
   * Calculate days remaining in subscription period
   */
  getDaysRemaining: (periodEnd: string): number => {
    const endDate = new Date(periodEnd);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }
};

/**
 * Customer data utilities
 */
export const customerUtils = {
  /**
   * Get customer info from your backend
   */
  getCustomerInfo: async (customerId: string) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customer info');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching customer info:', error);
      throw error;
    }
  },

  /**
   * Update customer information
   */
  updateCustomerInfo: async (customerId: string, updates: Record<string, any>) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update customer info');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating customer info:', error);
      throw error;
    }
  }
};

export default {
  createBillingPortalSession,
  createCheckoutSession,
  createInvoice,
  processBilling,
  openBillingPortal,
  subscriptionUtils,
  customerUtils
}; 