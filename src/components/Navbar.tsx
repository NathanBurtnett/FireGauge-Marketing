import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const isHome = location.pathname === '/';

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
              
              <Button 
                className="ml-4 bg-firegauge-red hover:bg-firegauge-red/90"
                asChild
              >
                <Link to="/pricing">Get Started</Link>
              </Button>
            </>
          ) : (
            // Other pages navigation
            <>
              <Link to="/" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300">Home</Link>
              <Link to="/pricing" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300">Pricing</Link>
              <Link to="/about" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300">About</Link>
              <Link to="/contact" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300">Contact</Link>
              
              <Button 
                className="ml-4 bg-firegauge-red hover:bg-firegauge-red/90"
                asChild
              >
                <Link to="/pricing">Get Started</Link>
              </Button>
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
                
                <Button 
                  className="bg-firegauge-red hover:bg-firegauge-red/90 w-full"
                  asChild
                >
                  <Link to="/pricing" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                </Button>
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
                
                <Button 
                  className="bg-firegauge-red hover:bg-firegauge-red/90 w-full"
                  asChild
                >
                  <Link to="/pricing" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
