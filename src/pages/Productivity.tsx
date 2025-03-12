
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTasks } from '@/hooks/useTasks';
import Timer from '@/components/productivity/Timer';
import DailyOutcomes from '@/components/productivity/DailyOutcomes';
import WeeklyOutcomes from '@/components/productivity/WeeklyOutcomes';

const Productivity = () => {
  const [activeTab, setActiveTab] = useState('timer');
  const { tasks } = useTasks();
  
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Productivity Tools</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full sm:w-auto">
            <TabsTrigger value="timer">50/10 Timer</TabsTrigger>
            <TabsTrigger value="daily">Daily Outcomes</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Outcomes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="timer" className="space-y-4">
            <p className="text-muted-foreground">
              The 50/10 timer helps you stay focused by working for 50 minutes and then taking a 10-minute break.
              This technique, inspired by the Pomodoro method, can boost your productivity and prevent burnout.
            </p>
            <Timer tasks={tasks} />
          </TabsContent>
          
          <TabsContent value="daily" className="space-y-4">
            <p className="text-muted-foreground">
              Track your daily intended outcomes by reviewing yesterday's tasks, setting focus areas for today,
              noting your accomplishments, and reflecting on what you've learned.
            </p>
            <DailyOutcomes />
          </TabsContent>
          
          <TabsContent value="weekly" className="space-y-4">
            <p className="text-muted-foreground">
              Plan your week effectively by setting goals and action steps across three key areas:
              work, education, and health. Weekly reflection helps you stay on track with your long-term objectives.
            </p>
            <WeeklyOutcomes />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Productivity;
