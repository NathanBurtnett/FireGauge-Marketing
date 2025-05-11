import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button'; // Assuming you have a Button component
import { Input } from '../components/ui/input';   // Assuming you have an Input component
import { Textarea } from '../components/ui/textarea'; // Assuming you have a Textarea component
import { Label } from '../components/ui/label'; // Assuming you have a Label component

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitted(false);
    // TODO: Implement actual form submission logic (e.g., API call)
    console.log('Form data submitted:', formData);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-12 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-firegauge-charcoal mb-8 text-center">Contact Us</h1>
          <p className="text-gray-600 mb-8 text-center">
            Have questions or need assistance? Fill out the form below, and we'll get back to you as soon as possible.
          </p>

          {isSubmitted && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline"> Your message has been sent. We'll be in touch soon.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 shadow-lg rounded-lg">
            <div>
              <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</Label>
              <Input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full"
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</Label>
              <Input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <Label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</Label>
              <Textarea
                name="message"
                id="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full"
                placeholder="How can we help you?"
              />
            </div>
            <div>
              <Button type="submit" className="w-full bg-firegauge-red hover:bg-firegauge-red-dark">
                Send Message
              </Button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ContactPage; 