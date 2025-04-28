
import React, { useEffect } from 'react';

const Features = () => {
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
    <section id="features" className="section bg-gray-50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-firegauge-charcoal animate-on-scroll">
            Powerful Features Built for Fire Professionals
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto animate-on-scroll">
            Every feature is designed with input from real fire departments and contractors to streamline your workflow.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Feature 1 - Station Dashboard */}
          <div className="flex flex-col md:flex-row gap-6 items-start animate-on-scroll">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full md:w-64 h-48 transform rotate-2">
              <img 
                src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Station Dashboard" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-firegauge-charcoal">Station Dashboard</h3>
              <p className="text-gray-600">
                Get a bird's-eye view of all your stations, test status, and upcoming maintenance schedules in one place.
              </p>
            </div>
          </div>
          
          {/* Feature 2 - Hose Asset History */}
          <div className="flex flex-col md:flex-row gap-6 items-start animate-on-scroll">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full md:w-64 h-48 transform -rotate-2">
              <img 
                src="https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Hose Asset History" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-firegauge-charcoal">Hose Asset History</h3>
              <p className="text-gray-600">
                Track the complete lifecycle of each hose with detailed test records, maintenance history, and automatic reminders.
              </p>
            </div>
          </div>
          
          {/* Feature 3 - Photo Evidence */}
          <div className="flex flex-col md:flex-row gap-6 items-start animate-on-scroll">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full md:w-64 h-48 transform rotate-2">
              <img 
                src="https://images.unsplash.com/photo-1473091534298-04dcbce3278c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Photo Evidence" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-firegauge-charcoal">Photo Evidence</h3>
              <p className="text-gray-600">
                Capture and store photos of damaged equipment directly in the app for better documentation and accountability.
              </p>
            </div>
          </div>
          
          {/* Feature 4 - QuickBooks/Jobber Integration */}
          <div className="flex flex-col md:flex-row gap-6 items-start animate-on-scroll">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full md:w-64 h-48 transform -rotate-2">
              <img 
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="QuickBooks Integration" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-firegauge-charcoal">QuickBooks/Jobber Integration</h3>
              <p className="text-gray-600">
                Seamlessly export test data for faster invoicing and project management with popular accounting software.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
