
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Link as RouterLink } from 'react-router-dom';
import { CreditCard } from 'lucide-react';

const BillingCard: React.FC = () => {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center text-xl text-firegauge-charcoal">
          <CreditCard className="mr-2 h-5 w-5" /> Billing & Invoices
        </CardTitle>
        <CardDescription>Payment methods and history</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          View invoices, update payment methods, and manage your billing information.
        </p>
        <Button variant="outline" className="w-full" asChild>
          <RouterLink to="/billing">View Billing</RouterLink>
        </Button>
      </CardContent>
    </Card>
  );
};

export default BillingCard;
