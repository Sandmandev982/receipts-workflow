
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Calendar, MessageSquare, Users, Settings, User } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const AppSidebar: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <Sidebar>
      <SidebarHeader className="py-6 px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-xl">
          <span className="bg-primary text-primary-foreground p-1 rounded">R</span>
          <span>Receipts</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-3">
        <div className="space-y-1 py-2">
          <p className="text-sm font-medium text-muted-foreground px-4 py-1">Main</p>
          <Link to="/">
            <Button 
              variant={isActive('/') ? 'secondary' : 'ghost'} 
              className="w-full justify-start gap-2"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Button>
          </Link>
          <Link to="/tasks">
            <Button 
              variant={isActive('/tasks') ? 'secondary' : 'ghost'} 
              className="w-full justify-start gap-2"
            >
              <CheckSquare size={18} />
              Tasks
            </Button>
          </Link>
          <Link to="/calendar">
            <Button 
              variant={isActive('/calendar') ? 'secondary' : 'ghost'} 
              className="w-full justify-start gap-2"
            >
              <Calendar size={18} />
              Calendar
            </Button>
          </Link>
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-1 py-2">
          <p className="text-sm font-medium text-muted-foreground px-4 py-1">Collaboration</p>
          <Link to="/messages">
            <Button 
              variant={isActive('/messages') ? 'secondary' : 'ghost'} 
              className="w-full justify-start gap-2"
            >
              <MessageSquare size={18} />
              Messages
            </Button>
          </Link>
          <Link to="/team">
            <Button 
              variant={isActive('/team') ? 'secondary' : 'ghost'} 
              className="w-full justify-start gap-2"
            >
              <Users size={18} />
              Team
            </Button>
          </Link>
        </div>
      </SidebarContent>
      
      <SidebarFooter className="px-3 py-4">
        <div className="space-y-1">
          <Link to="/profile">
            <Button 
              variant={isActive('/profile') ? 'secondary' : 'ghost'} 
              className="w-full justify-start gap-2"
            >
              <User size={18} />
              Profile
            </Button>
          </Link>
          <Link to="/settings">
            <Button 
              variant={isActive('/settings') ? 'secondary' : 'ghost'} 
              className="w-full justify-start gap-2"
            >
              <Settings size={18} />
              Settings
            </Button>
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
