
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
      question: "What if we lose connection in the field?",
      answer: "FireGauge is designed to work offline. All your data is stored locally on your device and will automatically sync when you regain connection. You can continue testing and recording results even in areas with no cell coverage or in deep basements with concrete walls."
    },
    {
      question: "Can we import existing Excel logs?",
      answer: "Yes! FireGauge supports importing your existing hose inventory and test records from Excel or CSV files. Our onboarding team will help you format and import your historical data to ensure a smooth transition."
    },
    {
      question: "How long does setup take?",
      answer: "Most departments are up and running in less than a day. The initial setup takes about 30 minutes, and our team provides free onboarding support to help you import your data and train your team. We also offer video tutorials and documentation to get you started quickly."
    },
    {
      question: "Is FireGauge NFPA 1962 compliant?",
      answer: "Absolutely. FireGauge was designed specifically to meet all NFPA 1962 requirements for fire hose testing and documentation. Our reports include all required fields and metrics, and we regularly update the platform to stay current with the latest NFPA standards."
    },
    {
      question: "Do you support pressure testing for other equipment?",
      answer: "Yes, besides fire hoses, FireGauge supports testing and documentation for ground ladders (NFPA 1932), fire pumps (NFPA 1911), and other fire equipment. All with the same easy-to-use interface and comprehensive reporting."
    },
    {
      question: "What happens after the 30-day trial?",
      answer: "After your 30-day trial, you can select one of our pricing plans based on your needs. There's no automatic billing—you'll have the opportunity to decide if FireGauge is right for you before making any payment."
    }
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
