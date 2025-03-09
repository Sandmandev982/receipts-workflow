import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sidebar, SidebarSection } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { CalendarIcon, LayoutDashboardIcon, ListTodoIcon, UsersIcon, UserIcon, LogOutIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const AppSidebar = () => {
  const isMobile = useIsMobile();
  const { signOut } = useAuth();

  return (
    <Sidebar collapsible={isMobile ? false : true}>
      <SidebarSection title="Menu" collapsible={false}>
        <NavLink to="/" className={({ isActive }) => cn("sidebar-link", { "is-active": isActive })}>
          <LayoutDashboardIcon className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/tasks" className={({ isActive }) => cn("sidebar-link", { "is-active": isActive })}>
          <ListTodoIcon className="mr-2 h-4 w-4" />
          <span>Tasks</span>
        </NavLink>
        <NavLink to="/teams" className={({ isActive }) => cn("sidebar-link", { "is-active": isActive })}>
          <UsersIcon className="mr-2 h-4 w-4" />
          <span>Teams</span>
        </NavLink>
        <NavLink to="/calendar" className={({ isActive }) => cn("sidebar-link", { "is-active": isActive })}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>Calendar</span>
        </NavLink>
      </SidebarSection>

      <SidebarSection title="Account" collapsible={true}>
        <NavLink to="/profile" className={({ isActive }) => cn("sidebar-link", { "is-active": isActive })}>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </NavLink>
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
          <LogOutIcon className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </SidebarSection>
    </Sidebar>
  );
};

export default AppSidebar;
