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
    
    expect(screen.getByText('Why Fire Departments & Contractors Choose FireGauge')).toBeInTheDocument();
    expect(screen.getByText(/Built from the ground up for modern fire safety professionals/)).toBeInTheDocument();
  });

  it('displays all feature cards with titles', () => {
    render(<Features />);
    
    // Check for all 9 feature titles
    expect(screen.getByText('Mobile-First Testing Interface')).toBeInTheDocument();
    expect(screen.getByText('Automated NFPA/ISO Compliance')).toBeInTheDocument();
    expect(screen.getByText('Multi-Tenant Contractor Platform')).toBeInTheDocument();
    expect(screen.getByText('Instant Report Generation')).toBeInTheDocument();
    expect(screen.getByText('Digital Asset Management')).toBeInTheDocument();
    expect(screen.getByText('Offline-First Architecture')).toBeInTheDocument();
    expect(screen.getByText('Proven ROI & Cost Savings')).toBeInTheDocument();
    expect(screen.getByText('Scalable for Any Size Operation')).toBeInTheDocument();
    expect(screen.getByText('API Integration & Interoperability')).toBeInTheDocument();
  });

  it('shows feature highlights and benefits', () => {
    render(<Features />);
    
    // Check for specific highlight badges
    expect(screen.getByText('75% faster than traditional methods')).toBeInTheDocument();
    expect(screen.getByText('100% compliance guarantee')).toBeInTheDocument();
    expect(screen.getByText('Unlimited departments & users')).toBeInTheDocument();
    expect(screen.getByText('Reports in under 30 seconds')).toBeInTheDocument();
    expect(screen.getByText('Automated scheduling & alerts')).toBeInTheDocument();
    expect(screen.getByText('Works anywhere, syncs everywhere')).toBeInTheDocument();
    expect(screen.getByText('$50K+ annual savings')).toBeInTheDocument();
    expect(screen.getByText('Volunteer to Enterprise ready')).toBeInTheDocument();
    expect(screen.getByText('Integration-ready architecture')).toBeInTheDocument();
  });

  it('displays trust metrics and statistics', () => {
    render(<Features />);
    
    // Check for the trust section
    expect(screen.getByText('Trusted by Progressive Fire Departments & Contractors')).toBeInTheDocument();
    
    // Check for statistics
    expect(screen.getByText('25+')).toBeInTheDocument();
    expect(screen.getByText('Fire Departments Served')).toBeInTheDocument();
    
    expect(screen.getByText('10,000+')).toBeInTheDocument();
    expect(screen.getByText('Tests Completed')).toBeInTheDocument();
    
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Audit Pass Rate')).toBeInTheDocument();
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
    
    // Check for ROI and savings content
    expect(screen.getByText(/save \$50,000\+ annually/)).toBeInTheDocument();
    expect(screen.getByText(/ROI realized within first quarter/)).toBeInTheDocument();
    expect(screen.getByText(/reduced labor costs/)).toBeInTheDocument();
  });

  it('includes offline capabilities and technical features', () => {
    render(<Features />);
    
    // Check for offline functionality
    expect(screen.getByText(/Record tests in any environment/)).toBeInTheDocument();
    expect(screen.getByText(/poor connectivity/)).toBeInTheDocument();
    expect(screen.getByText(/automatically syncs/)).toBeInTheDocument();
    
    // Check for API integration
    expect(screen.getByText(/robust API/)).toBeInTheDocument();
    expect(screen.getByText(/existing fire department software/)).toBeInTheDocument();
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