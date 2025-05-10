import React from 'react';

const ROIBanner = () => {
  return (
    <section className="bg-firegauge-charcoal py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h3 className="text-white text-2xl md:text-3xl font-semibold mb-2">
            Boost Efficiency & Slash Compliance Risks
          </h3>
          <p className="text-gray-300">See the FireGauge impact—based on real department results.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-start justify-around gap-8 md:gap-12">
          <div className="text-center">
            <div className="text-firegauge-accent text-4xl md:text-5xl font-bold mb-2">20-30</div>
            <p className="text-white text-sm md:text-base">Minutes saved per hose test</p>
          </div>
          
          <div className="text-center">
            <div className="text-firegauge-accent text-4xl md:text-5xl font-bold mb-2">Dozens</div>
            <p className="text-white text-sm md:text-base">Staff hours reclaimed annually</p>
          </div>

          <div className="text-center">
            <div className="text-firegauge-accent text-4xl md:text-5xl font-bold mb-2">Zero</div>
            <p className="text-white text-sm md:text-base">Missed inspections or penalties* <span className="text-xs block text-gray-400">(*with proper use)</span></p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ROIBanner;
