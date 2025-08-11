import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Features from '../Features';

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('Features Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main features section heading', () => {
    render(<Features />);
    
    expect(screen.getByText('Why Fire Departments Choose FireGauge')).toBeInTheDocument();
    expect(screen.getByText(/Built from the ground up for modern fire safety professionals/)).toBeInTheDocument();
  });

  it('displays all feature cards with titles', () => {
    render(<Features />);
    
    // Check for all 9 feature titles
    expect(screen.getByText('Mobile-First Testing Interface')).toBeInTheDocument();
    expect(screen.getByText('Automated NFPA/ISO Compliance')).toBeInTheDocument();
    expect(screen.getByText('Multi-Organization Contractor Platform')).toBeInTheDocument();
    expect(screen.getByText('Instant Report Generation')).toBeInTheDocument();
    expect(screen.getByText('Digital Asset Management')).toBeInTheDocument();
    expect(screen.getByText('Offline-First Architecture')).toBeInTheDocument();
    expect(screen.getByText('Time Savings & Efficiency')).toBeInTheDocument();
    expect(screen.getByText('Scalable for Any Size Operation')).toBeInTheDocument();
    expect(screen.getByText('Data Export & Interoperability')).toBeInTheDocument();
  });

  it('shows feature highlights and benefits', () => {
    render(<Features />);
    
    // Check for specific highlight badges
    // Neutral highlights
    expect(screen.getByText('Unlimited departments & users')).toBeInTheDocument();
    expect(screen.getByText('Fast report creation')).toBeInTheDocument();
    expect(screen.getByText('Automated scheduling & alerts')).toBeInTheDocument();
    expect(screen.getByText('Works anywhere, syncs everywhere')).toBeInTheDocument();
    expect(screen.queryByText('$50K+ annual savings')).toBeNull();
    expect(screen.getByText('Volunteer to Enterprise ready')).toBeInTheDocument();
    expect(screen.getByText('CSV/PDF exports')).toBeInTheDocument();
  });

  it('displays trust metrics and statistics', () => {
    render(<Features />);
    
    // Check for the trust section
    expect(screen.queryByText('Trusted by Progressive Fire Departments & Contractors')).toBeNull();
    
    // Check for statistics
    expect(screen.queryByText('25+')).toBeNull();
    expect(screen.queryByText('Fire Departments Served')).toBeNull();
    expect(screen.queryByText('10,000+')).toBeNull();
    expect(screen.queryByText('Tests Completed')).toBeNull();
    expect(screen.queryByText('100%')).toBeNull();
    expect(screen.queryByText('Audit Pass Rate')).toBeNull();
  });

  it('includes mobile-first and compliance messaging', () => {
    render(<Features />);
    
    // Check for mobile-first content
    expect(screen.getByText(/Purpose-built for field operations/)).toBeInTheDocument();
    expect(screen.getByText(/smartphone—even offline/)).toBeInTheDocument();
    
    // Check for compliance content
    expect(screen.getByText(/NFPA 1962, ISO standards, and AHJ requirements/)).toBeInTheDocument();
    expect(screen.getByText(/audit-ready reports/)).toBeInTheDocument();
  });

  it('shows contractor-specific features', () => {
    render(<Features />);
    
    // Check for contractor platform features
    expect(screen.getByText(/testing contractors serving multiple fire departments/)).toBeInTheDocument();
    expect(screen.getByText(/white-label reports/)).toBeInTheDocument();
    expect(screen.getByText(/separate data silos/)).toBeInTheDocument();
  });

  it('displays cost savings and ROI information', () => {
    render(<Features />);
    
    // ROI copy removed, ensure conservative language exists
    expect(screen.getByText(/Time Savings & Efficiency/)).toBeInTheDocument();
  });

  it('includes offline capabilities and technical features', () => {
    render(<Features />);
    
    // Check for offline functionality
    expect(screen.getByText(/Record tests in any environment/)).toBeInTheDocument();
    expect(screen.getByText(/poor connectivity/)).toBeInTheDocument();
    expect(screen.getByText(/automatically syncs/)).toBeInTheDocument();
    
    // Check for API integration
    expect(screen.queryByText(/robust API/)).toBeNull();
    expect(screen.getByText(/Export your data via CSV and PDF/)).toBeInTheDocument();
  });

  it('shows scalability messaging', () => {
    render(<Features />);
    
    // Check for scalability content
    expect(screen.getByText(/single-station volunteer departments/)).toBeInTheDocument();
    expect(screen.getByText(/county-wide contractor operations/)).toBeInTheDocument();
    expect(screen.getByText(/flexible architecture scales/)).toBeInTheDocument();
  });

  it('has proper section structure and accessibility', () => {
    render(<Features />);

    // Check for proper section element
    const featuresSection = document.querySelector('#features');
    expect(featuresSection).toBeInTheDocument();

    // Check for headings structure
    const mainHeading = screen.getByRole('heading', { level: 2 });
    expect(mainHeading).toBeInTheDocument();
    
    const subHeadings = screen.getAllByRole('heading', { level: 3 });
    expect(subHeadings.length).toBeGreaterThan(0);
  });

  it('renders without crashing', () => {
    expect(() => render(<Features />)).not.toThrow();
  });

  it('includes professional and branded content', () => {
    render(<Features />);
    
    // Check for professional terminology
    expect(screen.getByText(/professional, branded PDF reports/)).toBeInTheDocument();
    expect(screen.getByText(/Digital signatures/)).toBeInTheDocument();
    expect(screen.getByText(/customizable templates/)).toBeInTheDocument();
    
    // Check for equipment lifecycle content
    expect(screen.getByText(/Complete equipment lifecycle tracking/)).toBeInTheDocument();
    expect(screen.getByText(/Barcode scanning/)).toBeInTheDocument();
  });
}); 