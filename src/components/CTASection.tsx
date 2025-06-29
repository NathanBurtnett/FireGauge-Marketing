import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Play, ArrowRight } from "lucide-react";

interface CTASectionProps {
  onCTAClick?: () => void;
  onPricingClick?: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ onCTAClick, onPricingClick }) => {
  const handleDemoRequest = () => {
    // Scroll to contact section or open email client
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.open('mailto:demo@firegauge.app?subject=Demo Request&body=I would like to schedule a demo of FireGauge.', '_blank');
    }
  };
  
  return (
    <section className="bg-firegauge-charcoal py-16" id="cta-section">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Lose the Clipboards?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Be among the first departments to upgrade to digital testing. Your 30-day free trial is just a click away.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
            <Button 
              asChild
              className="bg-firegauge-red hover:bg-firegauge-red/90 text-white py-3 px-8 text-lg w-full sm:w-auto order-1 transform transition-all duration-300 hover:scale-105"
              onClick={() => {
                onCTAClick?.();
                onPricingClick?.();
              }}
            >
              <Link to="/pricing">
                Start Free 30-Day Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-firegauge-charcoal py-3 px-8 text-lg w-full sm:w-auto order-2 transition-all duration-300"
              onClick={handleDemoRequest}
            >
              <Play className="mr-2 h-5 w-5" />
              Book a 15-Min Demo
            </Button>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              No credit card required • Set up in under 5 minutes • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
