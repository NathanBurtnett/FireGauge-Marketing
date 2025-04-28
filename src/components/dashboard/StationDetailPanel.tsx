
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Pencil } from "lucide-react";
import { Station, Test, Asset } from '@/types/dashboard';
import { Card, CardContent } from "@/components/ui/card";

interface StationDetailPanelProps {
  isOpen: boolean;
  station: Station | null;
  onClose: () => void;
}

const StationDetailPanel = ({ isOpen, station, onClose }: StationDetailPanelProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const stats = {
    testsThisSeason: 23,
    failRate: 12,
    pending: 5
  };

  const tests: Test[] = [
    { id: '1', date: '2025-04-02', type: 'Annual inspection', result: 'pass', technician: 'John Doe' },
    { id: '2', date: '2025-03-15', type: 'Pressure test', result: 'pass', technician: 'Jane Smith' },
    { id: '3', date: '2025-02-10', type: 'Annual inspection', result: 'fail', technician: 'John Doe' },
  ];

  const assets: Asset[] = [
    { id: '1', name: 'Hose #1243', serialNumber: 'H-12345', type: 'Fire hose', lastInspection: '2025-04-02' },
    { id: '2', name: 'Pump #456', serialNumber: 'P-98765', type: 'Water pump', lastInspection: '2025-03-20' },
    { id: '3', name: 'Extinguisher #789', serialNumber: 'E-67890', type: 'Fire extinguisher', lastInspection: '2025-02-15' },
  ];

  if (!isOpen || !station) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white border-l shadow-lg z-20 overflow-auto">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold">{station.name}</h2>
          <Button variant="ghost" size="icon" className="ml-2">
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <Tabs defaultValue="overview" className="p-4">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <h3 className="text-3xl font-bold">{stats.testsThisSeason}</h3>
                <p className="text-gray-500 text-sm">Tests this season</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <h3 className="text-3xl font-bold">{stats.failRate}%</h3>
                <p className="text-gray-500 text-sm">Fail rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <h3 className="text-3xl font-bold">{stats.pending}</h3>
                <p className="text-gray-500 text-sm">Pending</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="pt-4">
            <p className="text-gray-700 mb-2">
              <strong>Location:</strong> {station.location}
            </p>
            <p className="text-gray-700">
              <strong>Last test:</strong> {new Date(station.lastTestDate).toLocaleDateString()}
            </p>
          </div>
          
          <div className="pt-4">
            <Button className="w-full bg-firegauge-red hover:bg-firegauge-red/90 text-white py-6">
              Run New Test
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="tests" className="space-y-4">
          <h3 className="font-semibold">Recent Tests</h3>
          <div className="space-y-3">
            {tests.map(test => (
              <Card key={test.id}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{test.type}</h4>
                      <p className="text-sm text-gray-500">{new Date(test.date).toLocaleDateString()} • {test.technician}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      test.result === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {test.result.toUpperCase()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Button variant="outline" className="w-full">
            View All Tests
          </Button>
        </TabsContent>
        
        <TabsContent value="assets" className="space-y-4">
          <h3 className="font-semibold">Assets</h3>
          <div className="space-y-3">
            {assets.map(asset => (
              <Card key={asset.id}>
                <CardContent className="p-3">
                  <div>
                    <h4 className="font-medium">{asset.name}</h4>
                    <p className="text-sm text-gray-500">{asset.type} • SN: {asset.serialNumber}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Last inspection: {new Date(asset.lastInspection).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Button variant="outline" className="w-full">
            View All Assets
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StationDetailPanel;
