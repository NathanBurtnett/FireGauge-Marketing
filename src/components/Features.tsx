import React, { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  Smartphone, 
  Shield, 
  Users, 
  Zap, 
  FileCheck, 
  Clock,
  DollarSign,
  Building2,
  CheckCircle
} from "lucide-react";

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

  const features = [
    {
      icon: <Smartphone className="h-12 w-12 text-firegauge-red" />,
      title: "Mobile-First Testing Interface", 
      description: "Purpose-built for field operations. Test fire hoses, hydrants, ladders, pumps, extinguishers and custom equipment directly from your smartphone—even offline. Our intuitive mobile interface reduces training time and eliminates the need for separate devices or clipboards.",
      highlight: "Cuts admin workload up to 75 %"
    },
    {
      icon: <Shield className="h-12 w-12 text-firegauge-red" />,
      title: "Automated NFPA/ISO Compliance",
      description: "Every test automatically generates audit-ready reports that meet NFPA 1962, ISO standards, and AHJ requirements. Built-in validation prevents non-compliant data entry and ensures your documentation passes every inspection.",
      highlight: "Aids NFPA compliance"
    },
    {
      icon: <Users className="h-12 w-12 text-firegauge-red" />,
      title: "Multi-Organization Contractor Platform",
      description: "Designed for testing contractors serving multiple fire departments. Manage unlimited departments, white-label reports, and maintain separate data silos while centralizing operations and billing—all in one platform.",
      highlight: "Unlimited departments & users"
    },
    {
      icon: <Zap className="h-12 w-12 text-firegauge-red" />,
      title: "Instant Report Generation",
      description: "Generate professional, branded PDF reports upon test completion. Digital signatures, automatic calculations, and customizable templates reduce manual report writing and follow-up paperwork.",
      highlight: "Fast report creation"
    },
    {
      icon: <FileCheck className="h-12 w-12 text-firegauge-red" />,
      title: "Digital Asset Management",
      description: "Complete equipment lifecycle tracking with automated test scheduling, maintenance reminders, and performance analytics. Barcode scanning integrates seamlessly with existing asset management systems.",
      highlight: "Automated scheduling & alerts"
    },
    {
      icon: <Clock className="h-12 w-12 text-firegauge-red" />,
      title: "Offline-First Architecture",
      description: "Record tests in any environment—basements, remote stations, or areas with poor connectivity. Data automatically syncs when connection is restored, ensuring zero test data loss and uninterrupted workflow.",
      highlight: "Works anywhere, syncs everywhere"
    },
    {
      icon: <DollarSign className="h-12 w-12 text-firegauge-red" />,
      title: "Time Savings & Efficiency",
      description: "Designed to reduce administrative workload, re-entry, and follow-up paperwork with fast, guided workflows and exports. Actual results vary by department and process.",
      highlight: "Time-saving workflows"
    },
    {
      icon: <Building2 className="h-12 w-12 text-firegauge-red" />,
      title: "Scalable for Any Size Operation",
      description: "From single-station volunteer departments to county-wide contractor operations. Our flexible architecture scales with your needs while maintaining performance and simplicity.",
      highlight: "Volunteer to Enterprise ready"
    },
    {
      icon: <CheckCircle className="h-12 w-12 text-firegauge-red" />,
      title: "Data Export & Interoperability",
      description: "Export your data via CSV and PDF for easy sharing with AHJs and existing systems. API access is on our roadmap and will be introduced with clear documentation.",
      highlight: "CSV/PDF exports"
    }
  ];

  return (
    <section id="features" className="section bg-white">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-firegauge-charcoal">
            Why Fire Departments Choose FireGauge
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Built from the ground up for modern fire safety professionals who demand efficiency, compliance, and reliability in their testing operations.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group p-6 rounded-xl border border-gray-200 hover:border-firegauge-red/30 hover:shadow-lg transition-all duration-300 bg-white">
              <div className="mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-firegauge-charcoal group-hover:text-firegauge-red transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {feature.description}
              </p>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-firegauge-red/10 text-firegauge-red text-sm font-medium">
                <CheckCircle className="h-4 w-4 mr-1" />
                {feature.highlight}
              </div>
            </div>
          ))}
        </div>
        
        {/* Metrics section removed to align with current real-world data and avoid unfounded claims */}
      </div>
    </section>
  );
};

export default Features;
