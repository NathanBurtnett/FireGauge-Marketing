import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, LogOut, UserCircle, Settings as SettingsIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/providers/AuthProvider";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface DashboardHeaderProps {
  onToggleOffline?: () => void;
}

const DashboardHeader = ({ onToggleOffline }: DashboardHeaderProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
    } else {
      navigate('/auth');
    }
  };

  const userFullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";
  const userEmail = user?.email || "No email";
  const userInitials = userFullName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || "U";

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
              <Button variant="ghost" className="relative h-9 w-9 rounded-full flex items-center space-x-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} alt={userFullName} />
                  <AvatarFallback className="bg-firegauge-red text-white font-semibold">{userInitials}</AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2 border-b mb-1">
                <p className="font-semibold text-sm truncate">{userFullName}</p>
                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
              </div>
              <DropdownMenuItem onClick={() => navigate('/account')}>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profile & Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500 hover:!text-red-600 hover:!bg-red-50 focus:!bg-red-50 focus:!text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
