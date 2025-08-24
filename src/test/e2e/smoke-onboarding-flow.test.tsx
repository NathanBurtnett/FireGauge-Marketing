import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '@/App';
import { supabase } from '@/lib/supabase';

// Minimal smoke test to ensure buttons exist and flows navigate as expected.
// We mock networked pieces (Supabase functions + onboarding POST) to keep this deterministic.

describe('Marketing smoke onboarding flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Ensure a clean URL at test start
    window.history.pushState({}, '', '/');

    // Override mocked Supabase functions.invoke from setup to return a checkout URL
    // @ts-ignore - supabase is a mocked object from setup.ts
    supabase.functions.invoke.mockImplementation((name: string) => {
      if (name === 'create-checkout') {
        return Promise.resolve({
          data: { url: 'http://localhost/payment-success?session_id=dummy' },
          error: null,
        });
      }
      if (name === 'customer-portal') {
        return Promise.resolve({ data: { url: 'http://stripe.test/portal' }, error: null });
      }
      return Promise.resolve({ data: {}, error: null });
    });

    // Mock fetch for marketing->main onboarding completion call
    global.fetch = vi.fn().mockImplementation((url: string, options?: any) => {
      if (url.includes('/api/onboarding/complete-from-marketing')) {
        return Promise.resolve(new Response(
          JSON.stringify({ success: true, message: 'Account created successfully!', redirect_url: '/dashboard' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        ));
      }
      return Promise.resolve(new Response('{}', { status: 200 }));
    }) as unknown as typeof fetch;
  });

  it('pilot button navigates to onboarding', async () => {
    render(<App />);

    // Pricing component is on the home page; click pilot CTA
    const pilotButtons = await screen.findAllByRole('button', { name: /Start Free Trial|Start Free Pilot/i });
    fireEvent.click(pilotButtons[0]);

    // Should route to onboarding
    await waitFor(() => {
      expect(window.location.pathname).toBe('/onboarding');
    });
  });

  it('paid plan button triggers checkout then shows PaymentSuccess and onboarding redirect', async () => {
    render(<App />);

    // Navigate to pricing page where paid CTAs live
    window.history.pushState({}, '', '/pricing');

    // Wait for pricing plans to render and click a paid plan button
    const paidButton = await screen.findByRole('button', { name: /Choose Essential|Upgrade to Pro|Get Contractor/i });
    fireEvent.click(paidButton);

    // Our mocked checkout redirects to payment-success
    await waitFor(() => {
      expect(window.location.pathname).toBe('/payment-success');
    });

    // PaymentSuccess waits then shows Continue to Setup button
    const continueBtn = await screen.findByRole('button', { name: /Continue to Setup/i });
    fireEvent.click(continueBtn);

    // Should navigate to onboarding
    await waitFor(() => {
      expect(window.location.pathname).toBe('/onboarding');
    });
  });

  it('completes onboarding and posts to main app', async () => {
    render(<App />);

    // Go straight to onboarding as if pilot selected
    window.history.pushState({}, '', '/onboarding?plan=pilot');

    // Fill minimal required fields and continue
    const deptName = await screen.findByLabelText(/Department Name/i);
    fireEvent.change(deptName, { target: { value: 'Smoke Test FD' } });

    const contact = screen.getByLabelText(/Primary Contact/i);
    fireEvent.change(contact, { target: { value: 'Chief Test' } });

    const continueBtn = screen.getByRole('button', { name: /Continue Setup/i });
    fireEvent.click(continueBtn);

    // Now on completion step, click Launch
    const launchBtn = await screen.findByRole('button', { name: /Launch FireGauge|Setting up your account/i });
    fireEvent.click(launchBtn);

    // Our mocked API responds with success and redirect_url
    await waitFor(() => {
      // Final redirect to app URL is done via window.location.href; we can at least assert fetch was called
      expect((global.fetch as any)).toHaveBeenCalledWith(
        expect.stringContaining('/api/onboarding/complete-from-marketing'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});


