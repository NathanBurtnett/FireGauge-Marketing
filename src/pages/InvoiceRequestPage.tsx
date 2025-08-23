import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FileText, Loader2, CheckCircle, Building, User, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/sonner";
import { createInvoice } from "@/api/billing";
import { FIREGAUGE_PLANS, BillingCycle } from "@/config/stripe-config";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface InvoiceFormData {
  email: string;
  firstName: string;
  lastName: string;
  departmentName: string;
  phone: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  notes: string;
}

const InvoiceRequestPage = () => {
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref') || '';
  const promoCode = searchParams.get('promo') || '';
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);

  // Get plan details from URL params
  const planName = searchParams.get('plan') || '';
  const priceId = searchParams.get('priceId') || '';
  const billingCycle = searchParams.get('cycle') as BillingCycle || BillingCycle.MONTHLY;
  
  const plan = Object.values(FIREGAUGE_PLANS).find(p => p.name === planName);

  const [formData, setFormData] = useState<InvoiceFormData>({
    email: '',
    firstName: '',
    lastName: '',
    departmentName: '',
    phone: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US'
    },
    notes: ''
  });

  useEffect(() => {
    if (!plan || !priceId) {
      toast.error("Invalid request", {
        description: "Please select a plan from the pricing page first.",
      });
      navigate('/pricing');
    }
  }, [plan, priceId, navigate]);

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.departmentName) {
      toast.error("Missing required fields", {
        description: "Please fill in all required fields marked with *",
      });
      return false;
    }

    if (!formData.address.line1 || !formData.address.city || !formData.address.state || !formData.address.postal_code) {
      toast.error("Incomplete address", {
        description: "Please provide a complete billing address",
      });
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Invalid email", {
        description: "Please enter a valid email address",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!plan || !priceId) return;

    setIsLoading(true);

    try {
      console.log('[INVOICE REQUEST] Creating invoice for:', plan.name);
      
      const result = await createInvoice({
        priceId,
        planName: plan.name,
        billingCycle,
        promoCode: promoCode || undefined,
        customerInfo: {
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          address: formData.address.line1 ? {
            line1: formData.address.line1,
            line2: formData.address.line2,
            city: formData.address.city,
            state: formData.address.state,
            postal_code: formData.address.postal_code,
            country: formData.address.country
          } : undefined
        },
        metadata: {
          department_name: formData.departmentName,
          notes: formData.notes,
          source: 'invoice_request_page',
          billing_cycle: billingCycle,
          ...(referralCode ? { referral_code: referralCode } : {})
        }
      });

      console.log('[INVOICE REQUEST] Invoice created successfully:', result);
      
      setInvoiceData(result);
      setIsSuccess(true);
      
      toast.success("Invoice created!", {
        description: "Your invoice has been generated and sent to your email.",
      });

    } catch (error) {
      console.error('[INVOICE REQUEST] Error creating invoice:', error);
      toast.error("Failed to create invoice", {
        description: "Please try again or contact support at sales@firegauge.app",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Request</h1>
            <p className="text-gray-600 mb-8">Please select a plan from the pricing page first.</p>
            <Button onClick={() => navigate('/pricing')}>
              Go to Pricing
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isSuccess && invoiceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Invoice Created Successfully!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Invoice #{invoiceData.invoice.id}</strong> has been created and sent to{' '}
                    <strong>{invoiceData.customer.email}</strong>
                  </AlertDescription>
                </Alert>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Invoice Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-medium">{plan.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Billing Cycle:</span>
                      <span className="font-medium">{billingCycle === BillingCycle.ANNUAL ? 'Annual' : 'Monthly'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium">${(invoiceData.invoice.total / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium capitalize">{invoiceData.invoice.status}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">What's Next?</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start space-x-2">
                      <span className="text-firegauge-red">1.</span>
                      <span>Check your email for the invoice with payment instructions</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-firegauge-red">2.</span>
                      <span>Pay the invoice within 30 days using the provided link</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-firegauge-red">3.</span>
                      <span>Your FireGauge account will be activated upon payment confirmation</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-firegauge-red">4.</span>
                      <span>You'll receive onboarding instructions to get started</span>
                    </li>
                  </ul>
                </div>

                <div className="flex space-x-4">
                  {invoiceData.invoice.hostedInvoiceUrl && (
                    <Button 
                      className="flex-1 bg-firegauge-red hover:bg-firegauge-red/90"
                      onClick={() => window.open(invoiceData.invoice.hostedInvoiceUrl, '_blank')}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View Invoice
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate('/')}
                  >
                    Back to Home
                  </Button>
                </div>

                <div className="text-center text-sm text-gray-500">
                  Questions? Contact us at{' '}
                  <a href="mailto:sales@firegauge.app" className="text-firegauge-red hover:underline">
                    sales@firegauge.app
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Request Invoice for {plan.name}
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Fill out the form below to receive an invoice for your {plan.name} plan
              </p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Plan Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Plan Summary</h3>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-medium">{plan.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">{plan.displayPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Billing:</span>
                      <span className="font-medium">{billingCycle === BillingCycle.ANNUAL ? 'Annual' : 'Monthly'}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-900">Contact Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="john.doe@department.gov"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                {/* Department Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Building className="h-5 w-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-900">Department Information</h3>
                  </div>
                  
                  <div>
                    <Label htmlFor="departmentName">Department Name *</Label>
                    <Input
                      id="departmentName"
                      value={formData.departmentName}
                      onChange={(e) => handleInputChange('departmentName', e.target.value)}
                      placeholder="Springfield Fire Department"
                      required
                    />
                  </div>
                </div>

                {/* Billing Address */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-900">Billing Address</h3>
                  </div>
                  
                  <div>
                    <Label htmlFor="line1">Address Line 1 *</Label>
                    <Input
                      id="line1"
                      value={formData.address.line1}
                      onChange={(e) => handleInputChange('address.line1', e.target.value)}
                      placeholder="123 Main Street"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="line2">Address Line 2</Label>
                    <Input
                      id="line2"
                      value={formData.address.line2}
                      onChange={(e) => handleInputChange('address.line2', e.target.value)}
                      placeholder="Suite 100"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.address.city}
                        onChange={(e) => handleInputChange('address.city', e.target.value)}
                        placeholder="Springfield"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={formData.address.state}
                        onChange={(e) => handleInputChange('address.state', e.target.value)}
                        placeholder="IL"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="postal_code">ZIP Code *</Label>
                      <Input
                        id="postal_code"
                        value={formData.address.postal_code}
                        onChange={(e) => handleInputChange('address.postal_code', e.target.value)}
                        placeholder="62701"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any special instructions or requirements..."
                    rows={3}
                  />
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Payment Terms:</strong> Net 30 days. You'll receive an email with the invoice and payment instructions. 
                    Your FireGauge account will be activated upon payment confirmation.
                  </AlertDescription>
                </Alert>

                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-firegauge-red hover:bg-firegauge-red/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="mr-2 h-4 w-4" />
                    )}
                    {isLoading ? 'Creating Invoice...' : 'Request Invoice'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/pricing')}
                    disabled={isLoading}
                  >
                    Back to Pricing
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default InvoiceRequestPage; 