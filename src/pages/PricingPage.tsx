import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PricingComponent from "@/components/Pricing"; // Main pricing cards
import FeatureComparisonTable from "@/components/FeatureComparisonTable"; // New import
import PricingFAQ from "@/components/PricingFAQ"; // New import
import ScrollToTop from "@/components/ScrollToTop";
import React from 'react';

// We might want to add a dedicated FAQ component for the pricing page later
// import PricingFAQ from "@/components/PricingFAQ"; 

const PricingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50"> {/* Added bg-gray-50 to page if sections have white bg */}
      <Navbar />
      <main className="flex-grow">
        {/* The PricingComponent is the detailed one we worked on for the homepage section */}
        {/* We will adapt and enhance this for the dedicated page */}
        <PricingComponent />
        <FeatureComparisonTable /> {/* Added the new component */}
        <PricingFAQ /> {/* Added the new FAQ component */}
        {/* Placeholder for additional content specific to the pricing page, like a more detailed FAQ or comparison */}
        {/* <PricingFAQ /> */}
      </main>
      <ScrollToTop />
      <Footer />
    </div>
  );
};

export default PricingPage; 