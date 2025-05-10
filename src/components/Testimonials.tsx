import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Testimonial {
  quote: string;
  author: string;
  position: string;
  company: string;
}

const Testimonials = () => {
  const testimonials: Testimonial[] = [
    {
      quote: "FireGauge slashed our hose-report time by half—best tool we've adopted in 20 years. The offline capability lets us work in basements and remote areas without worrying about connectivity.",
      author: "John Firemark",
      position: "Owner",
      company: "Firemark Testing Services"
    },
    {
      quote: "As a small fire department, we needed something simple that just worked. FireGauge delivered exactly what we needed without overwhelming us with features we'd never use.",
      author: "Sarah Johnson",
      position: "Chief Officer",
      company: "Westlake Fire Department"
    },
    {
      quote: "Generating NFPA-compliant reports used to be a nightmare. With FireGauge, it's one click. Our audit process is smoother than ever, and we have peace of mind knowing our records are always up-to-date.",
      author: "David Miller",
      position: "Battalion Chief",
      company: "Metro City Fire Rescue"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  return (
    <section id="testimonials" className="section bg-white">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-firegauge-charcoal">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Don't just take our word for it—hear from fire departments and contractors who use FireGauge daily.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gray-50 rounded-xl p-8 md:p-12 shadow-lg">
            {/* Quote icon */}
            <div className="absolute top-6 left-6 text-firegauge-red/20 text-6xl font-serif">"</div>
            
            <div className="relative z-10">
              <p className="text-lg md:text-xl text-gray-700 mb-8">
                {testimonials[currentIndex].quote}
              </p>
              
              <div className="flex items-center">
                <div className="w-12 h-12 bg-firegauge-red rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {testimonials[currentIndex].author.charAt(0)}
                </div>
                <div className="ml-4">
                  <div className="font-bold text-firegauge-charcoal">
                    {testimonials[currentIndex].author}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonials[currentIndex].position}, {testimonials[currentIndex].company}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={prev}
                className="rounded-full border-gray-300 hover:border-firegauge-red hover:text-firegauge-red"
              >
                <ArrowLeft size={18} />
              </Button>
              
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === currentIndex ? "bg-firegauge-red" : "bg-gray-300"
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={next}
                className="rounded-full border-gray-300 hover:border-firegauge-red hover:text-firegauge-red"
              >
                <ArrowRight size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
