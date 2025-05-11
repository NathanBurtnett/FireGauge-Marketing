import React from 'react';
import { Building, FileText, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Stations", icon: Building, url: "/dashboard/stations" },
  { title: "Reports", icon: FileText, url: "/dashboard/reports" },
  { title: "Settings", icon: Settings, url: "/account" }
];

const DashboardSidebar = () => {
  return (
    <Sidebar>
      <div className="flex h-full flex-col">
        <div className="flex h-[60px] items-center justify-between border-b px-4">
          <SidebarTrigger />
        </div>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <a 
                    href={item.url} 
                    className="group/link flex justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </div>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </div>
    </Sidebar>
  );
};

export default DashboardSidebar;
