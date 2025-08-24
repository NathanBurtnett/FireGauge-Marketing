import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// We will import components after setting up needed mocks inside each test.

describe('Marketing onboarding/payment smoke checks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Home Pricing component: pilot CTA navigates to onboarding', async () => {
    const navigateMock = vi.fn();
    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual<any>('react-router-dom');
      return { ...actual, useNavigate: () => navigateMock };
    });

    const { default: Pricing } = await import('@/components/Pricing');

    render(
      <MemoryRouter>
        <Pricing />
      </MemoryRouter>
    );

    const pilotCtas = await screen.findAllByRole('button', { name: /Start Free Trial|Start Free Pilot/i });
    fireEvent.click(pilotCtas[0]);

    expect(navigateMock).toHaveBeenCalled();
    const pathArg = String(navigateMock.mock.calls[0][0]);
    expect(pathArg).toMatch(/\/onboarding\?plan=pilot/);
  });

  it('PricingPage: paid plan CTA calls create-checkout function', async () => {
    vi.resetModules();
    const { supabase } = await import('@/lib/supabase');
    // @ts-ignore mocked in setup
    supabase.functions.invoke.mockResolvedValue({ data: { url: 'http://local/checkout' }, error: null });

    const { default: PricingPage } = await import('../PricingPage');

    render(
      <MemoryRouter initialEntries={[{ pathname: '/pricing' }]}>
        <PricingPage />
      </MemoryRouter>
    );

    const paidButton = await screen.findByRole('button', { name: 'Upgrade to Pro' });
    fireEvent.click(paidButton);

    // @ts-ignore mocked in setup
    expect(supabase.functions.invoke).toHaveBeenCalledWith('create-checkout', expect.any(Object));
  });

  it('PaymentSuccess: continue moves user to onboarding', async () => {
    const navigateMock = vi.fn();
    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual<any>('react-router-dom');
      return { ...actual, useNavigate: () => navigateMock };
    });

    const { default: PaymentSuccess } = await import('../PaymentSuccess');

    render(
      <MemoryRouter initialEntries={[{ pathname: '/payment-success', search: '?session_id=abc&test=1' }]}>
        <PaymentSuccess />
      </MemoryRouter>
    );

    const continueBtn = await screen.findByRole('button', { name: /Continue to Setup/i });
    fireEvent.click(continueBtn);

    expect(navigateMock).toHaveBeenCalledWith('/onboarding');
  }, 15000);

  it('OnboardingWizard: completes and posts to main app', async () => {
    vi.doMock('@/components/providers/AuthProvider', () => ({
      useAuth: () => ({ user: { id: 'u1', email: 'e@x.com' }, session: null, loading: false, signOut: vi.fn() }),
      AuthProvider: ({ children }: any) => children,
    }));

    const { supabase } = await import('@/lib/supabase');
    // @ts-ignore mocked in setup
    supabase.auth.getSession.mockResolvedValue({ data: { session: { access_token: 'token' } }, error: null });

    const fetchSpy = vi.spyOn(global, 'fetch' as any).mockImplementation((url: string) => {
      if (url.includes('/api/onboarding/complete-from-marketing')) {
        return Promise.resolve(new Response(JSON.stringify({ success: true, message: 'ok' }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }
      return Promise.resolve(new Response('{}', { status: 200 }));
    }) as unknown as typeof fetch;

    const { default: OnboardingWizard } = await import('../OnboardingWizard');

    render(
      <MemoryRouter initialEntries={[{ pathname: '/onboarding', search: '?plan=pilot' }]}>
        <OnboardingWizard />
      </MemoryRouter>
    );

    const deptInput = await screen.findByLabelText(/Department Name/i);
    fireEvent.change(deptInput, { target: { value: 'Dept' } });

    const contactInput = screen.getByLabelText(/Primary Contact/i);
    fireEvent.change(contactInput, { target: { value: 'Chief' } });

    fireEvent.click(screen.getByRole('button', { name: /Continue Setup/i }));

    const launchBtn = await screen.findByRole('button', { name: /Launch FireGauge|Setting up your account/i });
    fireEvent.click(launchBtn);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('/api/onboarding/complete-from-marketing'), expect.any(Object));
    });
  }, 15000);
});


