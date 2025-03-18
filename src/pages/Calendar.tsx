
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { CalendarView } from '@/components/calendar/CalendarView';
import GoogleCalendarSync from '@/components/calendar/GoogleCalendarSync';
import { useTasks } from '@/hooks/useTasks';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation } from 'react-router-dom';

const Calendar = () => {
  const [activeTab, setActiveTab] = useState('calendar');
  const { tasks, loading } = useTasks();
  const location = useLocation();

  useEffect(() => {
    // If returning from OAuth flow with success, show the integration tab
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('connection') === 'success') {
      setActiveTab('integration');
    }
  }, [location]);

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <h1 className="text-3xl font-bold">Calendar</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="integration">Google Calendar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar" className="pt-4">
            <Card className="p-4">
              <CalendarView tasks={tasks} loading={loading} />
            </Card>
          </TabsContent>
          
          <TabsContent value="integration" className="pt-4">
            <GoogleCalendarSync />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Calendar;
