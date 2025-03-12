
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Calendar,
  MessageSquare,
  BarChart3,
  UserCircle,
  Timer,
  Settings,
  HelpCircle,
  MoonIcon,
  SunIcon,
  BadgeHelp
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';

const AppSidebar = () => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  
  const isDarkMode = theme === 'dark';
  
  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };
  
  const menuItems = [
    { title: 'Dashboard', path: '/', icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: 'Tasks', path: '/tasks', icon: <CheckSquare className="h-5 w-5" /> },
    { title: 'Calendar', path: '/calendar', icon: <Calendar className="h-5 w-5" /> },
    { title: 'Teams', path: '/teams', icon: <Users className="h-5 w-5" /> },
    { title: 'Messages', path: '/messages', icon: <MessageSquare className="h-5 w-5" /> },
    { title: 'Productivity', path: '/productivity', icon: <Timer className="h-5 w-5" /> },
    { title: 'Reports', path: '/reports', icon: <BarChart3 className="h-5 w-5" /> },
  ];
  
  return (
    <div className="flex h-full w-full flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <CheckSquare className="h-6 w-6 text-primary" />
          <span className="text-xl">Receipts</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  location.pathname === item.path && "bg-accent text-accent-foreground"
                )}
              >
                {item.icon}
                {item.title}
              </Button>
            </Link>
          ))}
        </nav>
        
        <div className="mt-6 space-y-1">
          <Link to="/profile">
            <Button variant="ghost" className="w-full justify-start">
              <UserCircle className="mr-2 h-5 w-5" />
              Profile
            </Button>
          </Link>
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-5 w-5" />
            Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <HelpCircle className="mr-2 h-5 w-5" />
            Help & Support
          </Button>
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.email?.split('@')[0]}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppSidebar;
