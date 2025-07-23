import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X, ExternalLink } from "lucide-react";
import { useAuth } from '@/components/providers/AuthProvider';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  
  const isHome = location.pathname === '/';
  const appUrl = import.meta.env.VITE_API_URL || 'https://app.firegauge.app';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navTextColor = isScrolled || !isHome ? 'text-firegauge-charcoal' : 'text-white drop-shadow-lg';
  const navHoverColor = 'hover:text-firegauge-red';

  const navigation = isHome ? [
    { name: 'Benefits', href: '#benefits' },
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' }
  ] : [
    { name: 'Home', href: '/' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled || !isHome ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-firegauge-red font-poppins font-bold text-2xl">
              Fire
              <span className={`${navTextColor} transition-colors duration-300`}>
                Gauge
              </span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              item.href.startsWith('#') ? (
                <a 
                  key={item.name}
                  href={item.href} 
                  className={`${navTextColor} ${navHoverColor} transition-colors duration-300`}
                >
                  {item.name}
                </a>
              ) : (
                <Link 
                  key={item.name}
                  to={item.href} 
                  className={`${navTextColor} ${navHoverColor} transition-colors duration-300`}
                >
                  {item.name}
                </Link>
              )
            ))}
            
            {/* CTA Button */}
            {user ? (
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => window.open(appUrl, '_blank')}
              >
                <span className="flex items-center gap-2">
                  Open FireGauge App
                  <ExternalLink className="h-4 w-4" />
                </span>
              </Button>
            ) : (
              <Button 
                className="bg-firegauge-red hover:bg-firegauge-red/90"
                asChild
              >
                <Link to="/pricing">Get Started</Link>
              </Button>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={navTextColor}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white py-4 px-4 shadow-lg absolute top-full left-0 right-0 border-t">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                item.href.startsWith('#') ? (
                  <a 
                    key={item.name}
                    href={item.href} 
                    className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ) : (
                  <Link 
                    key={item.name}
                    to={item.href} 
                    className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300"
                  >
                    {item.name}
                  </Link>
                )
              ))}
              
              {/* Mobile CTA */}
              <div className="pt-2 border-t">
                {user ? (
                  <Button 
                    className="bg-green-600 hover:bg-green-700 w-full"
                    onClick={() => {
                      window.open(appUrl, '_blank');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      Open FireGauge App
                      <ExternalLink className="h-4 w-4" />
                    </span>
                  </Button>
                ) : (
                  <Button 
                    className="bg-firegauge-red hover:bg-firegauge-red/90 w-full"
                    asChild
                  >
                    <Link to="/pricing">Get Started</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
