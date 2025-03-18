
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import DailyOutcomes from '@/components/productivity/DailyOutcomes';
import WeeklyOutcomes from '@/components/productivity/WeeklyOutcomes';
import Timer from '@/components/productivity/Timer';
import FocusTimer from '@/components/productivity/FocusTimer';

const Productivity = () => {
  const [activeTab, setActiveTab] = useState<string>('focus');

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Productivity Tools</h1>
          <p className="text-muted-foreground mt-1">Tools to help you stay productive and focused</p>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 max-w-md">
            <TabsTrigger value="focus">Focus Timer</TabsTrigger>
            <TabsTrigger value="timer">Simple Timer</TabsTrigger>
            <TabsTrigger value="daily">Daily Outcomes</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Outcomes</TabsTrigger>
          </TabsList>

          <TabsContent value="focus" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Focus Timer</CardTitle>
                <CardDescription>
                  Use the 50/10 timer technique (50 minutes of work followed by a 10-minute break) 
                  to maintain productivity and prevent burnout
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FocusTimer />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Simple Timer</CardTitle>
                <CardDescription>
                  Basic timer for tracking your work sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Timer />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="daily" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Intended Outcomes</CardTitle>
                <CardDescription>
                  Plan and track your daily focus and achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DailyOutcomes />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Outcomes</CardTitle>
                <CardDescription>
                  Set goals and track progress on a weekly basis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WeeklyOutcomes />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Productivity;
