
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";

const GetStartedCard: React.FC = () => {
  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3 border-2 border-firegauge-accent bg-gradient-to-r from-firegauge-accent/5 to-firegauge-red/5">
      <CardHeader>
        <CardTitle className="text-xl text-firegauge-charcoal">Get Started with FireGauge</CardTitle>
        <CardDescription>Choose a plan to start managing your equipment testing and compliance.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="bg-firegauge-red hover:bg-firegauge-red/90" onClick={() => window.location.href = '/pricing'}>
            View Pricing Plans
          </Button>
          <Button variant="outline" onClick={() => window.location.href = 'mailto:sales@firegauge.app'}>
            Contact Sales
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GetStartedCard;
