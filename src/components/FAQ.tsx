import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ = () => {
  const faqs: FAQItem[] = [
    {
      question: "What if I lose connection in the field?",
      answer: "FireGauge is designed to work offline. All your data is stored locally on your device and will automatically sync when you regain connection. You can continue testing and recording results even in areas with no cell coverage or in deep basements with concrete walls."
    },
    {
      question: "Is FireGauge NFPA 1962 compliant?",
      answer: "Absolutely. FireGauge was designed specifically to meet all NFPA 1962 requirements for fire hose testing and documentation. Our reports include all required fields and metrics, and we regularly update the platform to stay current with the latest NFPA standards."
    },
    {
      question: "Do you support testing for other equipment besides hoses?",
      answer: "Yes! FireGauge is a modular platform. While the core is focused on hose testing (NFPA 1962), you can easily add modules for ground ladder inspections (NFPA 1932), fire pump testing (NFPA 1911), and other equipment. Each module provides the same intuitive interface and compliant reporting."
    },
    {
      question: "How does the pricing for add-on modules work?",
      answer: "You can add the Ladder Inspection or Pump Testing modules to any of our core paid plans (Basic, Standard, or Professional) for an additional $50/month per module. This allows you to tailor the system to your specific needs and only pay for the functionalities you use."
    },
    {
      question: "Can I import my existing equipment data?",
      answer: "Yes! We understand you have existing records. FireGauge supports importing your current equipment inventory and test history from common formats like Excel or CSV files. Our onboarding team can assist you in formatting and importing your data for a smooth transition."
    },
    {
      question: "How quickly can we get started with FireGauge?",
      answer: "Most departments are up and running in less than a day. The initial account setup takes about 30 minutes. We provide free onboarding support for all plans to help you import data and train your team. We also offer comprehensive video tutorials and documentation."
    },
    {
      question: "Can I manage multiple users and assign different roles?",
      answer: "Yes. All our plans support multiple users. Our Standard, Professional, and Enterprise plans offer role-based access control, allowing you to define Administrators (who can manage settings, users, and billing) and Field Operators/Inspectors (who focus on testing and data entry)."
    },
    {
      question: "What kind of customer support do you offer?",
      answer: "We offer email support for all plans. The Standard plan includes priority email support, while the Professional plan adds phone support. Enterprise plans benefit from a dedicated account manager and custom support SLAs. Comprehensive documentation and video tutorials are also available 24/7."
    },
    {
      question: "What happens after the 30-day free trial?",
      answer: "Towards the end of your 30-day trial, you can choose to subscribe to one of our paid plans (Basic, Standard, or Professional) that best fits your needs. There is no automatic billing; you'll have the opportunity to make an informed decision. If you choose not to subscribe, your trial account will be deactivated, but you can inquire about data export options."
    },
    // Add more FAQs as needed
  ];

  return (
    <section id="faq" className="section bg-white">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-firegauge-charcoal">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Got questions? We've got answers. If you don't see what you're looking for, reach out to our team.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium text-firegauge-charcoal hover:text-firegauge-red">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
