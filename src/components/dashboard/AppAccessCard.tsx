
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { ExternalLink } from 'lucide-react';

const AppAccessCard: React.FC = () => {
  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3 bg-firegauge-red text-white shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <ExternalLink className="mr-3 h-7 w-7" /> Access Your FireGauge App
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-gray-100">
          Ready to start testing? Access your full FireGauge application for equipment testing, reporting, and compliance management.
        </p>
        <Button 
          size="lg"
          className="bg-white text-firegauge-red hover:bg-gray-100 font-semibold py-3 px-6"
          onClick={() => window.open('https://app.firegauge.app', '_blank')} 
        >
          Go to app.firegauge.app
        </Button>
      </CardContent>
    </Card>
  );
};

export default AppAccessCard;
