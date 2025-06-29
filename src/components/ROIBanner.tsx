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
          <div className="text-center max-w-xs">
            <p className="text-firegauge-accent text-4xl md:text-5xl font-bold mb-2">Less Paperwork</p>
            <p className="text-white text-sm md:text-base">Free your team from manual data entry with digital-first workflows.</p>
          </div>

          <div className="text-center max-w-xs">
            <p className="text-firegauge-accent text-4xl md:text-5xl font-bold mb-2">Faster Reports</p>
            <p className="text-white text-sm md:text-base">Generate NFPA-ready PDFs in&nbsp;under&nbsp;30&nbsp;seconds.</p>
          </div>

          <div className="text-center max-w-xs">
            <p className="text-firegauge-accent text-4xl md:text-5xl font-bold mb-2">Compliance Support</p>
            <p className="text-white text-sm md:text-base">Built-in checks help you stay aligned with industry standards.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ROIBanner;
