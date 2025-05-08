
import React, { useEffect, useRef } from 'react';
import { Wifi, FileText, ShieldCheck } from "lucide-react";

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
            3 Key Benefits for Fire Departments
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto animate-on-scroll">
            Designed specifically for fire equipment testing professionals to reduce paperwork and improve compliance.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Benefit 1 */}
          <div className="bg-white p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl animate-on-scroll">
            <div className="bg-firegauge-red/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <Wifi className="text-firegauge-red w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-firegauge-charcoal">Offline-First Capture</h3>
            <p className="text-gray-600">
              Scan barcode, record pass/fail anywhere in the field—even with no cell service. Data auto-syncs when you're back online.
            </p>
          </div>
          
          {/* Benefit 2 */}
          <div className="bg-white p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl animate-on-scroll">
            <div className="bg-firegauge-red/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <FileText className="text-firegauge-red w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-firegauge-charcoal">Audit-Ready Reports</h3>
            <p className="text-gray-600">
              One-tap PDF & CSV exports with digital e-signatures. Have your documentation ready when inspectors arrive.
            </p>
          </div>
          
          {/* Benefit 3 */}
          <div className="bg-white p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl animate-on-scroll">
            <div className="bg-firegauge-red/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <ShieldCheck className="text-firegauge-red w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-firegauge-charcoal">Built for Compliance</h3>
            <p className="text-gray-600">
              NFPA 1962, 1911 & ISO 512C templates included. Meet all standard requirements with our purpose-built forms.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
