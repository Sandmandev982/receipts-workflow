
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sidebar } from '@/components/ui/sidebar';
import { SidebarContent, SidebarGroup, SidebarGroupContent } from '@/components/ui/sidebar';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Home, 
  CalendarDays, 
  Users, 
  Settings, 
  PlusCircle, 
  CheckCircle2,
  User,
  LogOut
} from 'lucide-react';

const AppSidebar: React.FC = () => {
  const { isOnboardingComplete } = useOnboarding();
  const isMobile = useIsMobile();

  // Determine if sidebar should be collapsed based on mobile state
  const collapsedMode = isMobile ? "icon" : "none";

  return (
    <Sidebar defaultCollapsed={collapsedMode === "icon"}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <NavLink to="/" className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </NavLink>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <NavLink to="/tasks" className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent">
              <CheckCircle2 className="h-4 w-4" />
              <span>My Tasks</span>
            </NavLink>
            <NavLink to="/tasks/new" className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent">
              <PlusCircle className="h-4 w-4" />
              <span>Add Task</span>
            </NavLink>
            <NavLink to="/calendar" className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent">
              <CalendarDays className="h-4 w-4" />
              <span>Calendar</span>
            </NavLink>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <NavLink to="/teams" className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent">
              <Users className="h-4 w-4" />
              <span>Teams</span>
            </NavLink>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isOnboardingComplete && (
          <SidebarGroup>
            <SidebarGroupContent>
              <NavLink to="/onboarding" className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent">
                <Settings className="h-4 w-4" />
                <span>Onboarding</span>
              </NavLink>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <NavLink to="/profile" className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </NavLink>
            <NavLink to="/auth/logout" className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </NavLink>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
