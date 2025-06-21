// Stripe Billing Portal API Integration
// This module handles creating billing portal sessions for customer subscription management

export interface BillingPortalSessionRequest {
  customer_id: string;
  return_url?: string;
}

export interface BillingPortalSessionResponse {
  url: string;
  session_id: string;
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
  openBillingPortal,
  subscriptionUtils,
  customerUtils
}; 