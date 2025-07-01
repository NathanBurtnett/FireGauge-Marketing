import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, ExternalLink } from "lucide-react";
import { useAuth } from '@/components/providers/AuthProvider';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  
  const isHome = location.pathname === '/';

  // Get the main app URL from environment
  const appUrl = import.meta.env.VITE_API_URL || 'https://app.firegauge.com';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled || !isHome ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
    }`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <span className="text-firegauge-red font-poppins font-bold text-2xl">
              Fire
              <span className={`${isScrolled || !isHome ? 'text-firegauge-charcoal' : 'text-white drop-shadow-lg'} transition-colors duration-300`}>
                Gauge
              </span>
            </span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          {isHome ? (
            // Marketing page navigation
            <>
              <a href="#benefits" className={`${isScrolled || !isHome ? 'text-firegauge-charcoal' : 'text-white'} hover:text-firegauge-red transition-colors duration-300`}>Benefits</a>
              <a href="#features" className={`${isScrolled || !isHome ? 'text-firegauge-charcoal' : 'text-white'} hover:text-firegauge-red transition-colors duration-300`}>Features</a>
              <a href="#testimonials" className={`${isScrolled || !isHome ? 'text-firegauge-charcoal' : 'text-white'} hover:text-firegauge-red transition-colors duration-300`}>Testimonials</a>
              <a href="#pricing" className={`${isScrolled || !isHome ? 'text-firegauge-charcoal' : 'text-white'} hover:text-firegauge-red transition-colors duration-300`}>Pricing</a>
              <a href="#faq" className={`${isScrolled || !isHome ? 'text-firegauge-charcoal' : 'text-white'} hover:text-firegauge-red transition-colors duration-300`}>FAQ</a>
              
              {/* Show app access for authenticated users */}
              {user ? (
                <div className="flex gap-2">
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    asChild
                  >
                    <a href={appUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      Open FireGauge App
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ) : (
                <Button 
                  className="ml-4 bg-firegauge-red hover:bg-firegauge-red/90"
                  asChild
                >
                  <Link to="/pricing">Get Started</Link>
                </Button>
              )}
            </>
          ) : (
            // Other pages navigation
            <>
              <Link to="/" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300">Home</Link>
              <Link to="/pricing" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300">Pricing</Link>
              <Link to="/about" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300">About</Link>
              <Link to="/contact" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300">Contact</Link>
              
              {/* Show app access for authenticated users */}
              {user ? (
                <div className="flex gap-2">
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    asChild
                  >
                    <a href={appUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      Open FireGauge App
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-firegauge-red text-firegauge-red hover:bg-firegauge-red hover:text-white"
                    asChild
                  >
                    <Link to="/dashboard">Account</Link>
                  </Button>
                </div>
              ) : (
                <Button 
                  className="ml-4 bg-firegauge-red hover:bg-firegauge-red/90"
                  asChild
                >
                  <Link to="/pricing">Get Started</Link>
                </Button>
              )}
            </>
          )}
        </div>
        
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={isScrolled || !isHome ? "text-firegauge-charcoal" : "text-white"}
          >
            <Menu size={24} />
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white py-4 px-4 shadow-lg absolute top-full left-0 right-0">
          <div className="flex flex-col space-y-4">
            {isHome ? (
              // Marketing mobile navigation
              <>
                <a href="#benefits" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300" onClick={() => setMobileMenuOpen(false)}>Benefits</a>
                <a href="#features" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300" onClick={() => setMobileMenuOpen(false)}>Features</a>
                <a href="#testimonials" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300" onClick={() => setMobileMenuOpen(false)}>Testimonials</a>
                <a href="#pricing" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
                <a href="#faq" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
                
                {/* Mobile app access for authenticated users */}
                {user ? (
                  <div className="space-y-2 pt-2 border-t">
                    <Button 
                      className="bg-green-600 hover:bg-green-700 w-full"
                      asChild
                    >
                      <a href={appUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                        Open FireGauge App
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-firegauge-red text-firegauge-red hover:bg-firegauge-red hover:text-white w-full"
                      asChild
                    >
                      <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Account Dashboard</Link>
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="bg-firegauge-red hover:bg-firegauge-red/90 w-full"
                    asChild
                  >
                    <Link to="/pricing" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                  </Button>
                )}
              </>
            ) : (
              // Other pages mobile navigation
              <>
                <Link 
                  to="/" 
                  className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/pricing" 
                  className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link 
                  to="/about" 
                  className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  to="/contact" 
                  className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                
                {/* Mobile app access for authenticated users */}
                {user ? (
                  <div className="space-y-2 pt-2 border-t">
                    <Button 
                      className="bg-green-600 hover:bg-green-700 w-full"
                      asChild
                    >
                      <a href={appUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                        Open FireGauge App
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-firegauge-red text-firegauge-red hover:bg-firegauge-red hover:text-white w-full"
                      asChild
                    >
                      <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Account Dashboard</Link>
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="bg-firegauge-red hover:bg-firegauge-red/90 w-full"
                    asChild
                  >
                    <Link to="/pricing" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
