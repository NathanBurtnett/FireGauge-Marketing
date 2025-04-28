
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
    }`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <a href="#" className="flex items-center">
            <span className="text-firegauge-red font-poppins font-bold text-2xl">Fire<span className="text-firegauge-charcoal">Gauge</span></span>
          </a>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <a href="#benefits" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300">Benefits</a>
          <a href="#features" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300">Features</a>
          <a href="#testimonials" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300">Testimonials</a>
          <a href="#pricing" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300">Pricing</a>
          <a href="#faq" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300">FAQ</a>
          <Button className="ml-4 bg-firegauge-red hover:bg-firegauge-red/90">Start Free Trial</Button>
        </div>
        
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={isScrolled ? "text-firegauge-charcoal" : "text-white"}
          >
            <Menu size={24} />
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white py-4 px-4 shadow-lg absolute top-full left-0 right-0">
          <div className="flex flex-col space-y-4">
            <a href="#benefits" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300" onClick={() => setMobileMenuOpen(false)}>Benefits</a>
            <a href="#features" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#testimonials" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300" onClick={() => setMobileMenuOpen(false)}>Testimonials</a>
            <a href="#pricing" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="#faq" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <Button className="bg-firegauge-red hover:bg-firegauge-red/90 w-full">Start Free Trial</Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
