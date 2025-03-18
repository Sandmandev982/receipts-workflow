
import React, { useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import CalendarView from '@/components/calendar/CalendarView';
import CalendarIntegration from '@/components/calendar/CalendarIntegration';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCalendarIntegration } from '@/hooks/useCalendarIntegration';
import { useAuth } from '@/hooks/useAuth';

const Calendar = () => {
  const { checkConnection } = useCalendarIntegration();
  const { user } = useAuth();
  
  useEffect(() => {
    checkConnection();
  }, []);

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <h1 className="text-3xl font-bold mb-6">Calendar</h1>
          <p>Please log in to view your calendar.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Calendar</h1>
        
        <Tabs defaultValue="view" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="view">Calendar View</TabsTrigger>
            <TabsTrigger value="integration">Google Calendar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="view">
            <CalendarView userId={user.id} />
          </TabsContent>
          
          <TabsContent value="integration">
            <CalendarIntegration userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Calendar;
