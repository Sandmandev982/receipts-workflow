
import React from 'react';
import {
  Home,
  Calendar,
  ListChecks,
  Users,
  Settings,
  BarChart,
  MessageSquare
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Sidebar, 
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";

const AppSidebar = () => {
  const { user } = useAuth();

  const sidebarItems = [
    {
      title: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      path: '/'
    },
    {
      title: 'Tasks',
      icon: <ListChecks className="h-5 w-5" />,
      path: '/'
    },
    {
      title: 'Teams',
      icon: <Users className="h-5 w-5" />,
      path: '/teams'
    },
    {
      title: 'Calendar',
      icon: <Calendar className="h-5 w-5" />,
      path: '/calendar'
    },
    {
      title: 'Messages',
      icon: <MessageSquare className="h-5 w-5" />,
      path: '/messages'
    },
    {
      title: 'Reports',
      icon: <BarChart className="h-5 w-5" />,
      path: '/reports'
    },
    {
      title: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      path: '/profile'
    },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="p-4">
            <div className="flex items-center justify-center mb-6">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || "User Avatar"} />
                <AvatarFallback>{user?.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center gap-2 ${
                            isActive ? 'font-medium' : ''
                          }`
                        }
                      >
                        {item.icon}
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
