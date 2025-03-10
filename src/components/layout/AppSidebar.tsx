import React from 'react';
import {
  Home,
  Calendar,
  ListChecks,
  Users,
  Settings,
  BarChart
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AppSidebarProps {
  isCollapsed: boolean;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ isCollapsed }) => {
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
    <aside className={`bg-card border-r border-border w-60 flex-none transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-60'}`}>
      <div className="p-4">
        <div className="flex items-center justify-center mb-6">
          <Avatar className="w-16 h-16">
            <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || "User Avatar"} />
            <AvatarFallback>{user?.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
        <nav>
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.title}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary hover:text-foreground transition-colors ${
                      isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground'
                    }`
                  }
                >
                  <div className="mr-2">{item.icon}</div>
                  <span>{item.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
