
import React from 'react';
import TopBar from './TopBar';
import AppSidebar from './AppSidebar';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/sonner';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col h-screen">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar isCollapsed={false} />
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default Layout;
