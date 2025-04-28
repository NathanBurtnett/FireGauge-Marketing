
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, CheckCircle, AlertTriangle, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Station } from '@/types/dashboard';

interface DashboardContentProps {
  onStationSelect: (station: Station) => void;
}

const DashboardContent = ({ onStationSelect }: DashboardContentProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data for stations
  const stations: Station[] = [
    {
      id: '1',
      name: 'North Portland Station',
      location: 'Portland, OR',
      lastTestDate: '2025-03-15',
      nextDueDate: '2025-09-15',
      status: 'ok'
    },
    {
      id: '2',
      name: 'Southeast District HQ',
      location: 'Portland, OR',
      lastTestDate: '2025-02-20',
      nextDueDate: '2025-05-20',
      status: 'warning'
    },
    {
      id: '3',
      name: 'Beaverton Municipal FD',
      location: 'Beaverton, OR',
      lastTestDate: '2025-01-10',
      nextDueDate: '2025-04-10',
      status: 'error'
    },
    {
      id: '4',
      name: 'Gresham Fire Station 71',
      location: 'Gresham, OR',
      lastTestDate: '2025-04-02',
      nextDueDate: '2025-10-02',
      status: 'ok'
    },
    {
      id: '5',
      name: 'Vancouver Central',
      location: 'Vancouver, WA',
      lastTestDate: '2025-03-25',
      nextDueDate: '2025-09-25',
      status: 'ok'
    },
  ];

  // Filter stations based on search term
  const filteredStations = stations.filter(station => 
    station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Stations</h1>
        <Button className="bg-firegauge-red hover:bg-firegauge-red/90 text-white">
          <Plus className="mr-2 h-4 w-4" /> Add Station
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input 
            placeholder="Search stations..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Last Test Date</TableHead>
              <TableHead>Next Due</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStations.map((station, idx) => (
              <TableRow 
                key={station.id}
                className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                onClick={() => onStationSelect(station)}
                style={{ cursor: 'pointer' }}
              >
                <TableCell className="font-medium">{station.name}</TableCell>
                <TableCell>{station.location}</TableCell>
                <TableCell>{new Date(station.lastTestDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(station.nextDueDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {getStatusIcon(station.status)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-4">
        {filteredStations.map((station) => (
          <div 
            key={station.id}
            className="bg-white rounded-lg border p-4 shadow-sm"
            onClick={() => onStationSelect(station)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{station.name}</h3>
                <p className="text-sm text-gray-500">{station.location}</p>
              </div>
              <div>
                {getStatusIcon(station.status)}
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500">Last Test:</p>
                <p>{new Date(station.lastTestDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Next Due:</p>
                <p>{new Date(station.nextDueDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardContent;
