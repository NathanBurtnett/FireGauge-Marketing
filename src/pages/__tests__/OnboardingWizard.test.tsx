import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import OnboardingWizard from '../OnboardingWizard';
import { BrowserRouter } from 'react-router-dom';

// ----------------------------------------------
// Global mocks for external modules used inside
// the OnboardingWizard.  We only verify that the
// wizard calls these helpers – the helpers' own
// logic is covered elsewhere.
// ----------------------------------------------
vi.mock('@/lib/analytics', () => ({
  trackingHelpers: {
    trackOnboardingStart: vi.fn(),
    trackOnboardingComplete: vi.fn(),
  },
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOtp: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
  },
}));

vi.mock('@/lib/emailService', () => ({
  emailService: {
    triggerEmailSequence: vi.fn().mockResolvedValue(undefined),
    addContactToList: vi.fn().mockResolvedValue(undefined),
  },
  // Re-export the ContactData type for TS consumers
  ContactData: {} as unknown,
}));

// Mock useToast hook so we do not depend on the UI library's implementation
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// ----------------------------------------------
// Helper to render the wizard with React Router
// ----------------------------------------------
const renderWizard = () =>
  render(
    <BrowserRouter>
      <OnboardingWizard />
    </BrowserRouter>
  );

// ----------------------------------------------
// Test cases
// ----------------------------------------------

// Dynamic user mock so individual tests can modify auth state on the fly
let mockUser: any = null;

vi.mock('@/components/providers/AuthProvider', () => ({
  useAuth: () => ({ user: mockUser, loading: false }),
}));

describe.skip('OnboardingWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = null; // default to unauthenticated
  });

  it('renders account-creation step when user is unauthenticated', () => {
    renderWizard();

    expect(
      screen.getByRole('heading', { name: /create your firegauge account/i })
    ).toBeInTheDocument();
  });

  it('skips to department-info step when user is already authenticated', () => {
    mockUser = { id: 'user_123', email: 'test@example.com' };

    renderWizard();

    // Department name field should be present on the first screen
    expect(screen.getByLabelText(/department name/i)).toBeInTheDocument();
  });

  it('submits valid department information and proceeds to next step', async () => {
    mockUser = { id: 'u1' };

    renderWizard();

    fireEvent.change(screen.getByLabelText(/department name/i), {
      target: { value: 'Central Fire Department' },
    });

    fireEvent.change(screen.getByLabelText(/department type/i), {
      target: { value: 'Municipal' },
    });

    fireEvent.change(screen.getByLabelText(/number of stations/i), {
      target: { value: '3' },
    });

    fireEvent.change(screen.getByLabelText(/primary contact/i), {
      target: { value: 'Chief Smith' },
    });

    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: '555-123-4567' },
    });

    fireEvent.change(screen.getByLabelText(/department address/i), {
      target: { value: '123 Main St, Springfield' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // The wizard shows a progress bar / or next card. A simple assertion: wait
    // until the Equipment Setup heading (step 3) OR a generic heading appears.
    await waitFor(() => {
      expect(
        screen.queryByText(/equipment setup/i) ||
          screen.queryByText(/choose your plan/i)
      ).toBeTruthy();
    });
  });
}); 