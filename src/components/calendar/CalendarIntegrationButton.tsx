import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarPlus, CheckCircle, Loader2 } from 'lucide-react';
import { useCalendarIntegration } from '@/hooks/useCalendarIntegration';

interface CalendarIntegrationButtonProps {
  taskIds?: string[];
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const CalendarIntegrationButton: React.FC<CalendarIntegrationButtonProps> = ({ 
  taskIds = [], 
  variant = 'default',
  size = 'default'
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const { 
    loading, 
    connected, 
    syncingTasks,
    checkConnection, 
    connect, 
    syncTasks 
  } = useCalendarIntegration();

  useEffect(() => {
    setIsMounted(true);
    checkConnection();
  }, []);

  // Don't render during SSR to prevent hydration errors
  if (!isMounted) return null;

  // If we have taskIds, show a sync button for those specific tasks
  if (taskIds.length > 0) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={() => syncTasks(taskIds)}
        disabled={loading || syncingTasks || !connected}
      >
        {syncingTasks ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Syncing...
          </>
        ) : (
          <>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Add to Calendar
          </>
        )}
      </Button>
    );
  }

  // Otherwise show connect/connected button
  return (
    <Button
      variant={connected ? 'outline' : variant}
      size={size}
      onClick={connected ? undefined : connect}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : connected ? (
        <>
          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
          Calendar Connected
        </>
      ) : (
        <>
          <Calendar className="mr-2 h-4 w-4" />
          Connect Calendar
        </>
      )}
    </Button>
  );
};

export default CalendarIntegrationButton;
