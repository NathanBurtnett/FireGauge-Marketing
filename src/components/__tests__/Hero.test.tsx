import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Hero from '../Hero';

// Mock window.open for demo request
Object.defineProperty(window, 'open', {
  value: vi.fn(),
  writable: true
});

const HeroWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Hero Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders main heading and subheading correctly', () => {
    render(
      <HeroWrapper>
        <Hero />
      </HeroWrapper>
    );
    
    expect(screen.getByText('The Future of Fire Equipment')).toBeInTheDocument();
    expect(screen.getByText('Testing & Compliance')).toBeInTheDocument();
          expect(screen.getByText(/Mobile-first platform designed for fire departments/)).toBeInTheDocument();
  });

  it('displays key value propositions', () => {
    render(
      <HeroWrapper>
        <Hero />
      </HeroWrapper>
    );
    
    // Check for current neutral value props
    expect(screen.getByText('Mobile-First')).toBeInTheDocument();
    expect(screen.getByText('Field-ready testing UI')).toBeInTheDocument();
    expect(screen.getByText('Fast Exports')).toBeInTheDocument();
    expect(screen.getByText('PDF and CSV when you need them')).toBeInTheDocument();
  });

  it('shows feature badges correctly', () => {
    render(
      <HeroWrapper>
        <Hero />
      </HeroWrapper>
    );
    
    // Check for feature badges
    expect(screen.getByText('Mobile-First Testing')).toBeInTheDocument();
    expect(screen.getByText('ISO/NFPA Compliant')).toBeInTheDocument();
    expect(screen.getByText('Multi-Organization Ready')).toBeInTheDocument();
  });

  it('renders call-to-action buttons', () => {
    render(
      <HeroWrapper>
        <Hero />
      </HeroWrapper>
    );
    
    // Check for CTA buttons
    const startTrialButton = screen.getByText('Start Free Trial');
    const requestDemoButton = screen.getByText('Request Demo');
    
    expect(startTrialButton).toBeInTheDocument();
    expect(requestDemoButton).toBeInTheDocument();
    
    // Verify they are clickable
    expect(startTrialButton.closest('a')).toHaveAttribute('href', '/pricing');
  });

  it('handles demo request interaction', () => {
    const mockOpen = vi.fn();
    Object.defineProperty(window, 'open', {
      value: mockOpen,
      writable: true
    });

    // Mock getElementById to return null (no contact section)
    const mockGetElementById = vi.fn().mockReturnValue(null);
    Object.defineProperty(document, 'getElementById', {
      value: mockGetElementById,
      writable: true
    });

    render(
      <HeroWrapper>
        <Hero />
      </HeroWrapper>
    );
    
    const requestDemoButton = screen.getByText('Request Demo');
    fireEvent.click(requestDemoButton);
    
    // Should either scroll to contact or open email
    expect(mockGetElementById).toHaveBeenCalledWith('contact');
    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('mailto:demo@firegauge.app'),
      '_blank'
    );
  });

  it('displays icons and visual elements', () => {
    render(
      <HeroWrapper>
        <Hero />
      </HeroWrapper>
    );
    
    // The component should render without layout issues
    const heroSection = document.querySelector('section');
    expect(heroSection).toBeInTheDocument();
    
    // Check for accessible button elements
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders responsive design elements', () => {
    render(
      <HeroWrapper>
        <Hero />
      </HeroWrapper>
    );
    
    // Component should render without layout issues
    const heroSection = document.querySelector('section');
    expect(heroSection).toBeInTheDocument();
  });

  it('includes proper semantic HTML structure', () => {
    render(
      <HeroWrapper>
        <Hero />
      </HeroWrapper>
    );
    
    // Check for semantic HTML elements
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    
    // Check for links and buttons
    const links = screen.getAllByRole('link');
    const buttons = screen.getAllByRole('button');
    
    expect(links.length).toBeGreaterThan(0);
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders without crashing', () => {
    expect(() => render(
      <HeroWrapper>
        <Hero />
      </HeroWrapper>
    )).not.toThrow();
  });

  it('contains brand-related content', () => {
    render(
      <HeroWrapper>
        <Hero />
      </HeroWrapper>
    );

    // Check for fire equipment related content
    const fireEquipmentText = screen.getByText(/Fire Equipment/i);
    expect(fireEquipmentText).toBeInTheDocument();
    
    // Check for compliance messaging
    expect(screen.getByText(/compliance/i)).toBeInTheDocument();
    
    // Check for mobile-first messaging (multiple occurrences acceptable)
    expect(screen.getAllByText(/mobile/i).length).toBeGreaterThan(0);
  });
}); 