
import React from 'react';
import { Bell, Search, Moon, Sun, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const TopBar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error signing out');
    }
  };
  
  return (
    <header className="border-b border-border h-16 flex items-center px-4 bg-background">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-9 w-[300px] bg-secondary focus-visible:ring-primary" 
            placeholder="Search..." 
          />
        </div>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
          aria-label="Sign out"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default TopBar;
