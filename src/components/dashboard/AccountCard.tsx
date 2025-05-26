
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Link as RouterLink } from 'react-router-dom';
import { User } from 'lucide-react';

interface AccountCardProps {
  userEmail: string | null;
}

const AccountCard: React.FC<AccountCardProps> = ({ userEmail }) => {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center text-xl text-firegauge-charcoal">
          <User className="mr-2 h-5 w-5" /> Account Settings
        </CardTitle>
        <CardDescription>Profile and security settings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{userEmail}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full" asChild>
          <RouterLink to="/account">Update Account</RouterLink>
        </Button>
      </CardContent>
    </Card>
  );
};

export default AccountCard;
