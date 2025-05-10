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
  value: string;
}

const pricingFaqs: FAQItem[] = [
  {
    question: "What counts as a user?",
    answer: "A user is any individual with login credentials, whether an Administrator or an Inspector/Operator. Each plan includes a specific number of Admin and Inspector users.",
    value: "item-1",
  },
  {
    question: "How is the hose count limit enforced?",
    answer: "The hose count limit refers to the maximum number of unique hoses you can actively manage and test within the system at any given time under your selected plan.",
    value: "item-2",
  },
  {
    question: "Can I change my plan later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Upgrades are effective immediately (pro-rated), and downgrades apply at the end of your current billing cycle.",
    value: "item-3",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) processed securely via Stripe.",
    value: "item-4",
  },
  {
    question: "How do the add-on modules work?",
    answer: "Add-on modules like Ladder Inspections or Pump Testing can be added to Basic, Standard, or Professional plans for an additional monthly fee per module. They are typically included in the Enterprise plan.",
    value: "item-5",
  },
  {
    question: "Is there a free trial?",
    answer: "Yes, we offer a 30-day free trial on our Basic, Standard, and Professional plans. No credit card is required to start your trial.",
    value: "item-6",
  },
  {
    question: "What if I need more users or hoses than the Professional plan offers?",
    answer: "Our Enterprise plan is designed for larger organizations and offers custom limits for users and assets, along with other premium features. Please contact sales to discuss your specific needs.",
    value: "item-7",
  },
];

const PricingFAQ = () => {
  return (
    <section id="pricing-faq" className="py-12 md:py-16 bg-white"> {/* Consistent section styling */}
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-firegauge-charcoal">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-700 mt-2">
            Find answers to common questions about our plans and billing.
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {pricingFaqs.map((faq) => (
            <AccordionItem value={faq.value} key={faq.value}>
              <AccordionTrigger className="text-lg text-left hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-gray-700 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default PricingFAQ; 