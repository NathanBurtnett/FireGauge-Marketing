
import React from 'react';
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative pt-20 md:pt-28 overflow-hidden min-h-[85vh] flex items-center">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
          filter: "brightness(0.4)"
        }}
      ></div>
      
      {/* Subtle flame overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-firegauge-red/20 to-firegauge-accent/20 mix-blend-overlay"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto md:mx-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 opacity-0 animate-fade-in">
            Ditch Hose-Test Paperwork—Go Digital in 5 Minutes.
          </h1>
          
          <p className="text-xl text-white/90 mb-8 opacity-0 animate-fade-in-delay-1">
            Capture pass/fail offline, auto-sync reports, cut compliance time by 50%.
            The smart way to handle NFPA 1962 compliance for modern fire departments.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 opacity-0 animate-fade-in-delay-2">
            <Button className="bg-firegauge-red hover:bg-firegauge-red/90 text-white py-6 px-8 text-lg">
              Start Free 30-Day Pilot
            </Button>
            
            <Button variant="outline" className="border-white text-white hover:bg-white/10 py-6 px-8 text-lg flex items-center gap-2">
              <Play size={18} className="fill-white" /> Watch 90-sec Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
