
import React from 'react';
import { Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-100 pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <a href="#" className="inline-block mb-4">
              <span className="text-firegauge-red font-poppins font-bold text-2xl">Fire<span className="text-firegauge-charcoal">Gauge</span></span>
            </a>
            <p className="text-gray-600 mb-6 max-w-xs">
              Streamlining fire hose testing and NFPA compliance for fire departments and contractors across the Pacific Northwest.
            </p>
            <div className="flex items-center">
              <a 
                href="#" 
                className="bg-firegauge-charcoal text-white p-2 rounded-full hover:bg-firegauge-red transition-colors"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-firegauge-charcoal font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-firegauge-red transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-600 hover:text-firegauge-red transition-colors">NFPA Guidelines</a></li>
              <li><a href="#" className="text-gray-600 hover:text-firegauge-red transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-600 hover:text-firegauge-red transition-colors">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-firegauge-charcoal font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-firegauge-red transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-600 hover:text-firegauge-red transition-colors">Contact</a></li>
              <li><a href="#" className="text-gray-600 hover:text-firegauge-red transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-firegauge-red transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 mb-8 pt-8 border-t border-gray-300">
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Stripe PCI-DSS Compliant
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 14L12 10L8 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            AWS Secured Cloud
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 9V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 12C3 4.5885 4.5885 3 12 3C19.4115 3 21 4.5885 21 12C21 19.4115 19.4115 21 12 21C4.5885 21 3 19.4115 3 12Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            NFPA Referenced
          </div>
        </div>
        
        {/* Copyright */}
        <div className="text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} FireGauge. All rights reserved.</p>
          <p className="mt-2">
            <a href="mailto:Support@FireGauge.com" className="hover:text-firegauge-red transition-colors">
              Support@FireGauge.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
