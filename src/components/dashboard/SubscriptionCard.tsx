
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Link as RouterLink } from 'react-router-dom';
import { Settings } from 'lucide-react';

interface SubscriptionCardProps {
  currentPlanName: string;
  subscribed: boolean;
  nextBillingDateFormatted: string;
  subscription_end: string | null;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  currentPlanName,
  subscribed,
  nextBillingDateFormatted,
  subscription_end
}) => {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center text-xl text-firegauge-charcoal">
          <Settings className="mr-2 h-5 w-5" /> Current Subscription
        </CardTitle>
        <CardDescription>Your plan and billing details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Current Plan</p>
            <p className="font-semibold text-lg">{currentPlanName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className={`font-medium ${subscribed ? 'text-green-600' : 'text-gray-500'}`}>
              {subscribed ? 'Active' : 'No Active Subscription'}
            </p>
          </div>
          {subscribed && subscription_end && (
            <div>
              <p className="text-sm text-gray-500">Next Billing</p>
              <p className="font-medium">{nextBillingDateFormatted}</p>
            </div>
          )}
        </div>
        <Button variant="outline" className="mt-4 w-full" asChild>
          <RouterLink to="/billing">Manage Subscription</RouterLink>
        </Button>
      </CardContent>
    </Card>
  );
};

export default SubscriptionCard;
