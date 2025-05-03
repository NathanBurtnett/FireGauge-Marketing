
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="bg-firegauge-charcoal py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Lose the Clipboards?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join fire departments across the Pacific Northwest who've upgraded to digital testing. Your 30-day free trial is just a click away.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              className="bg-firegauge-red hover:bg-firegauge-red/90 text-white py-6 px-8 text-lg"
              onClick={() => window.open('https://calendly.com', '_blank')}
            >
              Book a 15-Minute Call
            </Button>
            
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white/10 py-6 px-8 text-lg"
              onClick={() => navigate('/auth')}
            >
              Start Free 30-Day Pilot
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
