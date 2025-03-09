import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sidebar } from '@/components/ui/sidebar';
import { SidebarSection } from '@/components/ui/sidebar';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useMobile } from '@/hooks/use-mobile';
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
  const { needsOnboarding } = useOnboarding();
  const isMobile = useMobile();

  // Modified to use "icon" for mobile and "none" for desktop instead of boolean
  const collapsedMode = isMobile ? "icon" : "none";

  return (
    <Sidebar collapsed={collapsedMode}>
      <SidebarSection>
        <NavLink to="/" className="flex items-center space-x-2">
          <Home className="h-4 w-4" />
          <span>Home</span>
        </NavLink>
      </SidebarSection>

      <SidebarSection title="Tasks">
        <NavLink to="/tasks" className="flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>My Tasks</span>
        </NavLink>
        <NavLink to="/tasks/new" className="flex items-center space-x-2">
          <PlusCircle className="h-4 w-4" />
          <span>Add Task</span>
        </NavLink>
        <NavLink to="/calendar" className="flex items-center space-x-2">
          <CalendarDays className="h-4 w-4" />
          <span>Calendar</span>
        </NavLink>
      </SidebarSection>

      <SidebarSection title="Teams">
        <NavLink to="/teams" className="flex items-center space-x-2">
          <Users className="h-4 w-4" />
          <span>Teams</span>
        </NavLink>
      </SidebarSection>

      {needsOnboarding && (
        <SidebarSection title="Setup">
          <NavLink to="/onboarding" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Onboarding</span>
          </NavLink>
        </SidebarSection>
      )}

      <SidebarSection title="Account">
        <NavLink to="/profile" className="flex items-center space-x-2">
          <User className="h-4 w-4" />
          <span>Profile</span>
        </NavLink>
        <NavLink to="/auth/logout" className="flex items-center space-x-2">
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </NavLink>
      </SidebarSection>
    </Sidebar>
  );
};

export default AppSidebar;
