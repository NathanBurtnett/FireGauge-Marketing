
import React, { useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardContent from '@/components/dashboard/DashboardContent';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import OfflineBanner from '@/components/dashboard/OfflineBanner';
import StationDetailPanel from '@/components/dashboard/StationDetailPanel';
import { Station } from '@/types/dashboard';

const Dashboard = () => {
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [unsyncedTests, setUnsyncedTests] = useState(3);

  const handleStationSelect = (station: Station) => {
    setSelectedStation(station);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  // Mock function to simulate going online
  const handleSync = () => {
    setIsOffline(false);
    setUnsyncedTests(0);
  };

  // Toggle offline status (for demo purposes)
  const toggleOfflineStatus = () => {
    setIsOffline(!isOffline);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <DashboardHeader onToggleOffline={toggleOfflineStatus} />
        
        <div className="flex flex-1 overflow-hidden">
          <DashboardSidebar />
          
          <main className="flex-1 overflow-y-auto p-6">
            <DashboardContent onStationSelect={handleStationSelect} />
          </main>
          
          <StationDetailPanel 
            isOpen={isPanelOpen}
            station={selectedStation}
            onClose={handleClosePanel}
          />
        </div>
        
        {isOffline && (
          <OfflineBanner unsyncedTests={unsyncedTests} onSync={handleSync} />
        )}
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
