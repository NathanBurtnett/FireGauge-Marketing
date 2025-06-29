import React from 'react';
import { Button } from "./ui/button";
import { ArrowRight, Smartphone, Shield, Users, Play } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  const handleDemoRequest = () => {
    // Scroll to contact section or open demo modal
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Fallback: open email client
      window.open('mailto:demo@firegauge.app?subject=Demo Request&body=I would like to schedule a demo of FireGauge.', '_blank');
    }
  };

  return (
    <section className="hero bg-gradient-to-br from-firegauge-charcoal via-gray-800 to-firegauge-red text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="container relative z-10 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center items-center space-x-8 mb-6">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-6 w-6 text-firegauge-accent" />
              <span className="text-sm font-medium">Mobile-First Testing</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-firegauge-accent" />
              <span className="text-sm font-medium">ISO/NFPA Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-firegauge-accent" />
              <span className="text-sm font-medium">Multi-Tenant Ready</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            The Future of Fire Hose
            <span className="text-firegauge-accent block">Testing & Compliance</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Mobile-first platform designed for contractors and fire departments.
            Streamlines workflows, <span className="font-semibold">cuts administrative effort by&nbsp;up&nbsp;to&nbsp;75 %</span>,
            and eliminates manual paperwork—all from your smartphone.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              asChild
              size="lg" 
              className="bg-firegauge-red hover:bg-firegauge-red/90 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <Link to="/pricing">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              onClick={handleDemoRequest}
              variant="outline" 
              size="lg"
              className="bg-white/20 border-white text-white hover:bg-white hover:text-firegauge-charcoal backdrop-blur-sm px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300"
            >
              <Play className="mr-2 h-5 w-5" />
              Request Demo
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-firegauge-accent mb-2">Up&nbsp;to&nbsp;75 %</div>
              <div className="text-sm">Less Admin Time</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-firegauge-accent mb-2">&lt;30&nbsp;s</div>
              <div className="text-sm">Report Generation</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
