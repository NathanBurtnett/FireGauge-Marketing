import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Mail, Phone, MapPin, Calendar, Play, MessageSquare, Users } from 'lucide-react';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    inquiryType: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      inquiryType: value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitted(false);
    setIsSubmitting(true);
    setError(null);

    try {
      // Create mailto link with form data
      const subject = formData.inquiryType === 'demo' 
        ? `Demo Request from ${formData.name} - ${formData.organization}`
        : `Contact Form: ${formData.inquiryType} - ${formData.name}`;
      
      const body = `Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Organization: ${formData.organization}
Inquiry Type: ${formData.inquiryType}

Message:
${formData.message}

---
Submitted from: firegauge.app/contact`;

      const mailtoLink = `mailto:contact@firegauge.app?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // Open email client
      window.open(mailtoLink, '_blank');
      
      // Simulate successful submission
      setTimeout(() => {
        setIsSubmitted(true);
        setFormData({ 
          name: '', 
          email: '', 
          phone: '', 
          organization: '', 
          inquiryType: '', 
          message: '' 
        });
        setIsSubmitting(false);
      }, 1000);

    } catch (err: any) {
      console.error('Error submitting contact form:', err);
      setError('Please ensure you have an email client configured, or contact us directly at contact@firegauge.app');
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = () => {
    const subject = 'Quick Demo Request';
    const body = `I'd like to schedule a 15-minute demo of FireGauge.

Please send me available times or a calendar link.

Best regards,
[Your Name]
[Your Organization]`;
    
    window.open(`mailto:demo@firegauge.app?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-12 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-firegauge-charcoal mb-4">Get in Touch</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ready to revolutionize your fire equipment testing? We're here to help you get started.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Quick Actions */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Play className="mr-2 h-5 w-5 text-firegauge-red" />
                    Quick Demo
                  </CardTitle>
                  <CardDescription>
                    See FireGauge in action in just 15 minutes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleQuickDemo}
                    className="w-full bg-firegauge-red hover:bg-firegauge-red/90"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Demo
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5 text-firegauge-red" />
                    Contact Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="mr-3 h-4 w-4 text-gray-500" />
                    <a href="mailto:contact@firegauge.app" className="text-firegauge-red hover:underline">
                      contact@firegauge.app
                    </a>
                  </div>
                  <div className="flex items-center">
                    <Phone className="mr-3 h-4 w-4 text-gray-500" />
                    <a href="tel:+1234567890" className="text-firegauge-red hover:underline">
                      (123) 456-7890
                    </a>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-3 h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">
                      Remote-first company
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Send us a message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
                      <strong className="font-bold">Message sent!</strong>
                      <span className="block sm:inline"> Your email client should have opened. We'll be in touch soon!</span>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                      <strong className="font-bold">Note:</strong>
                      <span className="block sm:inline"> {error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="john@firedept.gov"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div>
                        <Label htmlFor="organization">Fire Department / Organization</Label>
                        <Input
                          type="text"
                          name="organization"
                          id="organization"
                          value={formData.organization}
                          onChange={handleChange}
                          placeholder="City Fire Department"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="inquiryType">How can we help? *</Label>
                      <Select onValueChange={handleSelectChange} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select inquiry type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="demo">Schedule a Demo</SelectItem>
                          <SelectItem value="pricing">Pricing Questions</SelectItem>
                          <SelectItem value="implementation">Implementation Support</SelectItem>
                          <SelectItem value="technical">Technical Questions</SelectItem>
                          <SelectItem value="partnership">Partnership Opportunities</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        name="message"
                        id="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        placeholder="Tell us about your fire equipment testing needs..."
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-firegauge-red hover:bg-firegauge-red/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Opening Email Client...' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ContactPage; 