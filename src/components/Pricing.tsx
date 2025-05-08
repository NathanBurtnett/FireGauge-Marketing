
import React from 'react';
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PricingPlan {
  name: string;
  price: string;
  stations: string;
  modules: string;
  features: string[];
  recommended?: boolean;
}

const Pricing = () => {
  const navigate = useNavigate();

  const plans: PricingPlan[] = [
    {
      name: "Starter",
      price: "$99",
      stations: "1-5",
      modules: "Hose only",
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
      price: "$199",
      stations: "6-15",
      modules: "Hose + Ladder",
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
      price: "$299",
      stations: "16+",
      modules: "Hose + Ladder + Pump",
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

  return (
    <section id="pricing" className="section bg-gray-50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-firegauge-charcoal">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Choose the plan that fits your department's size and needs. All plans include a 30-day free trial.
          </p>
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
                    {plan.price}
                    <span className="text-base font-normal text-gray-600">/mo</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <span className="font-medium mr-2">Stations:</span>
                    <span>{plan.stations}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Modules:</span>
                    <span>{plan.modules}</span>
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
                  onClick={() => navigate('/auth')}
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
