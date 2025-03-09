
import React from 'react';
import { CheckCircle, Clock, AlertCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SummaryCardProps {
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    dueToday: number;
  };
}

const SummaryCards: React.FC<SummaryCardProps> = ({ tasks }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          <CheckCircle className="h-4 w-4 text-receipts-blue" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{tasks.total}</div>
          <p className="text-xs text-muted-foreground">All tasks in your workspace</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          <Clock className="h-4 w-4 text-receipts-blue" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{tasks.inProgress}</div>
          <p className="text-xs text-muted-foreground">Tasks currently in progress</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <AlertCircle className="h-4 w-4 text-receipts-yellow" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{tasks.pending}</div>
          <p className="text-xs text-muted-foreground">Tasks waiting to be started</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Due Today</CardTitle>
          <Calendar className="h-4 w-4 text-receipts-error" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{tasks.dueToday}</div>
          <p className="text-xs text-muted-foreground">Tasks due for today</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;
