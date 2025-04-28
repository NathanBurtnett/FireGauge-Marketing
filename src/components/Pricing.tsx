
import React, { useState } from 'react';
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PricingPlan {
  name: string;
  offSeasonPrice: string;
  inSeasonPrice: string;
  stations: string;
  users: string;
  features: string[];
  recommended?: boolean;
}

const Pricing = () => {
  const [isOffSeason, setIsOffSeason] = useState(false);
  const [switchWidth, setSwitchWidth] = useState(0);
  const [switchLeft, setSwitchLeft] = useState(0);

  const plans: PricingPlan[] = [
    {
      name: "Starter",
      offSeasonPrice: "$50",
      inSeasonPrice: "$99",
      stations: "1-5",
      users: "2",
      features: [
        "Offline data capture",
        "Basic NFPA reports",
        "Email support",
        "CSV exports",
        "90-day data retention"
      ]
    },
    {
      name: "Growth",
      offSeasonPrice: "$50",
      inSeasonPrice: "$200",
      stations: "6-15",
      users: "5",
      features: [
        "Everything in Starter",
        "Advanced NFPA reports",
        "Priority email support",
        "QuickBooks integration",
        "1-year data retention",
        "Multi-user roles"
      ],
      recommended: true
    },
    {
      name: "Scale",
      offSeasonPrice: "$50",
      inSeasonPrice: "$300",
      stations: "16+",
      users: "Unlimited",
      features: [
        "Everything in Growth",
        "Phone support",
        "Jobber integration",
        "Unlimited data storage",
        "Custom branding",
        "API access"
      ]
    }
  ];

  React.useEffect(() => {
    // Get the element to set initial dimensions
    const offSeasonButton = document.getElementById('offseason-button');
    const inSeasonButton = document.getElementById('inseason-button');
    const switchWrapper = document.getElementById('switch-wrapper');
    
    if (offSeasonButton && inSeasonButton && switchWrapper) {
      const activeButton = isOffSeason ? offSeasonButton : inSeasonButton;
      setSwitchWidth(activeButton.offsetWidth);
      setSwitchLeft(activeButton.offsetLeft - switchWrapper.offsetLeft);
    }
  }, [isOffSeason]);

  return (
    <section id="pricing" className="section bg-gray-50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-firegauge-charcoal">
            Season-Smart Pricing Plans
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Only pay what you need, when you need it. All plans include our seasonal pricing model.
          </p>
          
          {/* Season toggle */}
          <div className="mt-8 inline-block">
            <div id="switch-wrapper" className="switch-wrapper">
              <div 
                className="switch-bg" 
                style={{ 
                  width: switchWidth, 
                  transform: `translateX(${isOffSeason ? 0 : switchLeft}px)`
                }}
              ></div>
              <button 
                id="offseason-button"
                className={`switch-button ${isOffSeason ? 'text-white' : 'text-gray-700'}`}
                onClick={() => setIsOffSeason(true)}
              >
                Off-Season
              </button>
              <button
                id="inseason-button"
                className={`switch-button ${!isOffSeason ? 'text-white' : 'text-gray-700'}`}
                onClick={() => setIsOffSeason(false)}
              >
                In-Season
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
                plan.recommended ? 'border-2 border-firegauge-accent relative transform -translate-y-2 md:translate-y-0 md:scale-105' : ''
              }`}
            >
              {plan.recommended && (
                <div className="bg-firegauge-accent text-white text-center py-1 font-medium text-sm">
                  MOST POPULAR
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-xl font-bold mb-4 text-firegauge-charcoal">{plan.name}</h3>
                
                <div className="mb-6">
                  <div className="text-4xl font-bold text-firegauge-charcoal">
                    {isOffSeason ? plan.offSeasonPrice : plan.inSeasonPrice}
                    <span className="text-base font-normal text-gray-600">/mo</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {isOffSeason ? 'During Off-Season' : 'During Testing Season (Mar-Jun)'}
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <span className="font-medium mr-2">Stations:</span>
                    <span>{plan.stations}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Users:</span>
                    <span>{plan.users}</span>
                  </div>
                </div>
                
                <div className="mb-8">
                  <div className="font-medium mb-3">Features:</div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="text-firegauge-red h-5 w-5 mr-2 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  className={`w-full ${
                    plan.recommended 
                      ? 'bg-firegauge-red hover:bg-firegauge-red/90' 
                      : 'bg-firegauge-charcoal hover:bg-firegauge-charcoal/90'
                  }`}
                >
                  Start Free 30-Day Trial
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
