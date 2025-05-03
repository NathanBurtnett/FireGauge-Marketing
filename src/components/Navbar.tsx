
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, User, CreditCard, LogOut } from "lucide-react";
import { useAuth } from '@/components/providers/AuthProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isHome = location.pathname === '/';
  const isAuthenticated = !!user;

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

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled || !isHome ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
    }`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <span className="text-firegauge-red font-poppins font-bold text-2xl">Fire<span className="text-firegauge-charcoal">Gauge</span></span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          {isHome ? (
            // Marketing page navigation
            <>
              <a href="#benefits" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300">Benefits</a>
              <a href="#features" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300">Features</a>
              <a href="#testimonials" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300">Testimonials</a>
              <a href="#pricing" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300">Pricing</a>
              <a href="#faq" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300">FAQ</a>
              
              {isAuthenticated ? (
                // User is authenticated, show dashboard button
                <Button 
                  className="ml-4 bg-firegauge-red hover:bg-firegauge-red/90"
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </Button>
              ) : (
                // User is not authenticated, show login button
                <Button 
                  className="ml-4 bg-firegauge-red hover:bg-firegauge-red/90"
                  onClick={() => navigate('/auth')}
                >
                  Sign In
                </Button>
              )}
            </>
          ) : (
            // App navigation (for logged-in users)
            isAuthenticated && (
              <>
                <Link to="/dashboard" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300">
                  Dashboard
                </Link>
                <Link to="/account" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300">
                  Account
                </Link>
                <Link to="/billing" className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300">
                  Billing
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <span className="sr-only">Open user menu</span>
                      <div className="size-8 rounded-full bg-firegauge-red/20 flex items-center justify-center text-firegauge-red">
                        {user?.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="flex flex-col space-y-1 leading-none p-2">
                      <p className="font-medium">{user?.email?.split('@')[0] || 'User'}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/account" className="cursor-pointer flex w-full items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Account</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/billing" className="cursor-pointer flex w-full items-center">
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Billing</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )
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
                
                {isAuthenticated ? (
                  <Button 
                    className="bg-firegauge-red hover:bg-firegauge-red/90 w-full"
                    onClick={() => {
                      navigate('/dashboard');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Dashboard
                  </Button>
                ) : (
                  <Button 
                    className="bg-firegauge-red hover:bg-firegauge-red/90 w-full"
                    onClick={() => {
                      navigate('/auth');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                )}
              </>
            ) : (
              // App mobile navigation
              isAuthenticated && (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/account" 
                    className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Account
                  </Link>
                  <Link 
                    to="/billing" 
                    className="text-firegauge-charcoal hover:text-firegauge-red transition-colors duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Billing
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-red-600 hover:text-red-800 transition-colors duration-300"
                  >
                    Sign out
                  </button>
                </>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
