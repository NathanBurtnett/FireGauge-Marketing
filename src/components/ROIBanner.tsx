
import React from 'react';

const ROIBanner = () => {
  return (
    <section className="bg-firegauge-charcoal py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-around">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h3 className="text-white text-2xl md:text-3xl font-semibold mb-2">
              Real Results for Real Departments
            </h3>
            <p className="text-gray-300">Based on customer case studies</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 md:gap-12">
            <div className="text-center">
              <div className="text-firegauge-accent text-4xl md:text-5xl font-bold mb-2">25+</div>
              <p className="text-white text-sm md:text-base">Hours saved per test cycle</p>
            </div>
            
            <div className="text-center">
              <div className="text-firegauge-accent text-4xl md:text-5xl font-bold mb-2">$750+</div>
              <p className="text-white text-sm md:text-base">Labor saved per station, per year</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ROIBanner;
