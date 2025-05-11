import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
// You might want to import an image component or use a direct <img> tag
// import { Image } from '../components/ui/image'; // Example if you have one

const AboutUsPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-12 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-firegauge-charcoal mb-8 text-center">About FireGauge</h1>
          
          <div className="bg-white p-8 shadow-lg rounded-lg space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              FireGauge was born from a simple mission: to revolutionize how fire departments manage their critical equipment testing and compliance.
              We understand the challenges faced by departments in keeping up with NFPA standards, managing paper trails, and ensuring every piece of gear is ready when seconds count.
            </p>

            {/* Optional: Add an image here */}
            {/* <img src="/placeholder-team.jpg" alt="FireGauge Team" className="rounded-lg shadow-md my-6" /> */}

            <h2 className="text-2xl font-semibold text-firegauge-charcoal pt-4">Our Vision</h2>
            <p className="text-gray-700 leading-relaxed">
              We envision a future where every fire department, regardless of size, has access to intuitive, powerful tools that simplify compliance, 
              enhance safety, and allow firefighters to focus on what they do best: saving lives and protecting communities.
            </p>

            <h2 className="text-2xl font-semibold text-firegauge-charcoal pt-4">Our Values</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 pl-4 leading-relaxed">
              <li><strong>Reliability:</strong> Building software that departments can depend on.</li>
              <li><strong>Simplicity:</strong> Creating user-friendly interfaces that require minimal training.</li>
              <li><strong>Innovation:</strong> Continuously improving our platform to meet evolving needs.</li>
              <li><strong>Support:</strong> Providing exceptional customer service to our partners.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-firegauge-charcoal pt-4">Meet the (Placeholder) Team</h2>
            <p className="text-gray-700 leading-relaxed">
              Our team is composed of experienced software developers, user experience designers, and individuals passionate about public safety. 
              We work closely with fire service professionals to ensure FireGauge meets the real-world demands of the field.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              <em>More detailed team information and profiles can be added here.</em>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AboutUsPage; 