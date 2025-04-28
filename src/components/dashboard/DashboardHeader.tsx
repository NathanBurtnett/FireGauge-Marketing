
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sun, Moon, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardHeaderProps {
  onToggleOffline?: () => void;
}

const DashboardHeader = ({ onToggleOffline }: DashboardHeaderProps) => {
  const [season, setSeason] = useState<'off' | 'in'>('in');

  const toggleSeason = () => {
    setSeason(season === 'off' ? 'in' : 'off');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <div className="text-firegauge-red font-bold text-2xl">
            <span className="flex items-center">
              FireGauge
              <span className="ml-1 text-xs bg-firegauge-red text-white px-1 rounded">BETA</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Season Toggle */}
          <div className="bg-gray-100 rounded-full p-1 flex items-center">
            <Button
              variant={season === 'off' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-full ${
                season === 'off' 
                  ? 'bg-firegauge-red text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={toggleSeason}
            >
              <Moon size={16} className="mr-1" />
              Off-Season
            </Button>
            <Button
              variant={season === 'in' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-full ${
                season === 'in' 
                  ? 'bg-firegauge-red text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={toggleSeason}
            >
              <Sun size={16} className="mr-1" />
              In-Season
            </Button>
          </div>

          {/* Debug button for offline mode toggle */}
          {onToggleOffline && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onToggleOffline}
              className="text-xs"
            >
              Toggle Offline
            </Button>
          )}

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt="@user" />
                  <AvatarFallback className="bg-firegauge-red text-white">JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 leading-none p-2">
                <p className="font-medium">John Doe</p>
                <p className="text-sm text-muted-foreground">john@firetester.com</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500">Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
