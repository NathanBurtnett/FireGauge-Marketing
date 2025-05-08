
import React from 'react';
import { Linkedin, CreditCard, ShieldCheck } from "lucide-react";

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
              Hose & gear testing—signed, synced, DONE. Streamlining NFPA compliance for fire departments nationwide.
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
            <CreditCard className="w-5 h-5 mr-2" />
            Stripe PCI-DSS Compliant
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <ShieldCheck className="w-5 h-5 mr-2" />
            AWS Secured Cloud
          </div>
        </div>
        
        {/* Copyright */}
        <div className="text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} FireGauge. All rights reserved.</p>
          <p className="mt-2">
            <a href="mailto:support@firegauge.com" className="hover:text-firegauge-red transition-colors">
              support@firegauge.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
