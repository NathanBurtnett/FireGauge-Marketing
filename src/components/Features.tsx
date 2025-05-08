
import React, { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";

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
            Features Built for Fire Professionals
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto animate-on-scroll">
            Streamlined workflows designed with input from real fire departments.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Feature mockups in device frames */}
          <Card className="overflow-hidden shadow-lg animate-on-scroll">
            <CardContent className="p-0">
              <div className="relative pb-[178%]">
                <div className="absolute inset-0 bg-black rounded-t-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1563206767-5b18f218e8de?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Barcode scan workflow" 
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h3 className="text-white font-bold text-lg">Barcode Scan Workflow</h3>
                    <p className="text-white/80 text-sm">Quick inventory tracking with scan-to-test</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden shadow-lg animate-on-scroll">
            <CardContent className="p-0">
              <div className="relative pb-[178%]">
                <div className="absolute inset-0 bg-black rounded-t-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Scheduled reminders dashboard" 
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h3 className="text-white font-bold text-lg">Scheduled Reminders</h3>
                    <p className="text-white/80 text-sm">Never miss another test date or inspection</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden shadow-lg animate-on-scroll">
            <CardContent className="p-0">
              <div className="relative pb-[178%]">
                <div className="absolute inset-0 bg-black rounded-t-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Failure analytics" 
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h3 className="text-white font-bold text-lg">Failure Analytics</h3>
                    <p className="text-white/80 text-sm">Track trends and forecast replacement needs</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-3xl mx-auto animate-on-scroll">
          <h3 className="text-xl font-bold mb-4 text-center text-firegauge-charcoal">More Power, Less Paperwork</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <li className="flex items-start">
              <div className="bg-firegauge-red/10 rounded-full p-1 mr-2 mt-1">
                <div className="w-2 h-2 bg-firegauge-red rounded-full"></div>
              </div>
              <span className="text-gray-700">Digital record keeping</span>
            </li>
            <li className="flex items-start">
              <div className="bg-firegauge-red/10 rounded-full p-1 mr-2 mt-1">
                <div className="w-2 h-2 bg-firegauge-red rounded-full"></div>
              </div>
              <span className="text-gray-700">E-signature capture</span>
            </li>
            <li className="flex items-start">
              <div className="bg-firegauge-red/10 rounded-full p-1 mr-2 mt-1">
                <div className="w-2 h-2 bg-firegauge-red rounded-full"></div>
              </div>
              <span className="text-gray-700">Full test history archives</span>
            </li>
            <li className="flex items-start">
              <div className="bg-firegauge-red/10 rounded-full p-1 mr-2 mt-1">
                <div className="w-2 h-2 bg-firegauge-red rounded-full"></div>
              </div>
              <span className="text-gray-700">Instant report generation</span>
            </li>
            <li className="flex items-start">
              <div className="bg-firegauge-red/10 rounded-full p-1 mr-2 mt-1">
                <div className="w-2 h-2 bg-firegauge-red rounded-full"></div>
              </div>
              <span className="text-gray-700">Multi-user collaboration</span>
            </li>
            <li className="flex items-start">
              <div className="bg-firegauge-red/10 rounded-full p-1 mr-2 mt-1">
                <div className="w-2 h-2 bg-firegauge-red rounded-full"></div>
              </div>
              <span className="text-gray-700">Automatic backups</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Features;
