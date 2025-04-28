
import React, { useEffect, useRef } from 'react';
import { Wifi, FileText, Calendar } from "lucide-react";

const Benefits = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const animatedElements = document.querySelectorAll(".animate-on-scroll");
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <section id="benefits" className="section bg-white relative" ref={sectionRef}>
      {/* Subtle flame background */}
      <div className="absolute inset-0 bg-flame-gradient opacity-30"></div>
      
      <div className="container relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-firegauge-charcoal animate-on-scroll">
            Why Fire Departments Trust FireGauge
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto animate-on-scroll">
            Designed specifically for fire equipment testing professionals and fire departments to reduce paperwork and improve compliance.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Benefit 1 */}
          <div className="bg-white p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl animate-on-scroll">
            <div className="bg-firegauge-red/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <Wifi className="text-firegauge-red w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-firegauge-charcoal">Offline First</h3>
            <p className="text-gray-600">
              Record tests anywhere with our offline-capable app, then auto-sync your data when you're back online. Never lose data due to spotty cell coverage again.
            </p>
          </div>
          
          {/* Benefit 2 */}
          <div className="bg-white p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl animate-on-scroll">
            <div className="bg-firegauge-red/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <FileText className="text-firegauge-red w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-firegauge-charcoal">Instant NFPA Reports</h3>
            <p className="text-gray-600">
              Generate professional PDF & CSV exports with one tap. Complete with digital e-signatures and full compliance with NFPA 1962 requirements.
            </p>
          </div>
          
          {/* Benefit 3 */}
          <div className="bg-white p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl animate-on-scroll">
            <div className="bg-firegauge-red/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <Calendar className="text-firegauge-red w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-firegauge-charcoal">Season-Smart Pricing</h3>
            <p className="text-gray-600">
              Full app power during March–June testing season, then just $50 during off-season. Pay only for what you need when you need it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
