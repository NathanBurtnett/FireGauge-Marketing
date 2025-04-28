
import React from 'react';
import { Button } from "@/components/ui/button";
import { WifiOff, RefreshCw } from "lucide-react";

interface OfflineBannerProps {
  unsyncedTests: number;
  onSync: () => void;
}

const OfflineBanner = ({ unsyncedTests, onSync }: OfflineBannerProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-firegauge-charcoal text-white p-3 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <WifiOff className="mr-2 h-5 w-5" />
          <span>
            Offline mode active – {unsyncedTests} unsynced {unsyncedTests === 1 ? 'test' : 'tests'}
          </span>
        </div>
        <Button 
          variant="outline" 
          className="border-white text-white hover:bg-white/10"
          onClick={onSync}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Sync Now
        </Button>
      </div>
    </div>
  );
};

export default OfflineBanner;
