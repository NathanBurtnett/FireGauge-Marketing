import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LegalPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-12 min-h-screen">
        <section id="privacy" className="mb-16 scroll-mt-20">
          <h1 className="text-3xl font-bold text-firegauge-charcoal mb-6">Privacy Policy</h1>
          <div className="space-y-4 text-gray-700">
            <p>Effective Date: [Date]</p>
            <h2 className="text-xl font-semibold text-firegauge-charcoal mt-4">1. Introduction</h2>
            <p>
              Welcome to FireGauge ("we," "our," or "us"). We are committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you
              visit our website [Your Website URL] and use our services. Please read this privacy policy carefully.
              If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>
            <h2 className="text-xl font-semibold text-firegauge-charcoal mt-4">2. Information We Collect</h2>
            <p>
              We may collect personal information such as your name, email address, company name, and payment information
              when you register for an account, subscribe to our services, or communicate with us. We also collect
              non-personal information such as browser type, operating system, and website usage data through cookies
              and other tracking technologies.
            </p>
            {/* Add more sections as needed: How We Use Your Information, Sharing Your Information, Data Security, Your Rights, etc. */}
            <p className="mt-6">
              [Placeholder for more detailed Privacy Policy content...]
            </p>
          </div>
        </section>

        <section id="terms" className="scroll-mt-20">
          <h1 className="text-3xl font-bold text-firegauge-charcoal mb-6">Terms of Service</h1>
          <div className="space-y-4 text-gray-700">
            <p>Last Updated: [Date]</p>
            <h2 className="text-xl font-semibold text-firegauge-charcoal mt-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using the FireGauge website and services ("Service"), you agree to be bound by these
              Terms of Service ("Terms"). If you disagree with any part of the terms, then you may not access the Service.
            </p>
            <h2 className="text-xl font-semibold text-firegauge-charcoal mt-4">2. Use of Service</h2>
            <p>
              You must be at least 18 years old to use the Service. You are responsible for maintaining the confidentiality
              of your account and password. You agree to accept responsibility for all activities that occur under your
              account or password.
            </p>
            {/* Add more sections as needed: Subscriptions, Payment, Cancellations, Intellectual Property, Limitation of Liability, etc. */}
            <p className="mt-6">
              [Placeholder for more detailed Terms of Service content...]
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default LegalPage; 