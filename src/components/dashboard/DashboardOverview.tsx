
import React from 'react';
import SummaryCards from '@/components/dashboard/SummaryCards';
import ProgressChart from '@/components/dashboard/ProgressChart';
import { Task } from '@/components/tasks/types';

interface DashboardOverviewProps {
  taskCounts: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    dueToday: number;
  };
  recentTasks: Task[];
  loading: boolean;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ 
  taskCounts, 
  recentTasks,
  loading 
}) => {
  // Data for progress chart
  const chartData = [
    { name: 'Completed', value: taskCounts.completed, color: '#28A745' },
    { name: 'In Progress', value: taskCounts.inProgress, color: '#007BFF' },
    { name: 'Pending', value: taskCounts.pending, color: '#FFC107' },
  ];

  return (
    <div className="space-y-6">
      <SummaryCards tasks={taskCounts} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressChart data={chartData} />
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : recentTasks.length > 0 ? (
            <div className="space-y-2">
              {recentTasks.map(task => (
                <div key={task.id} className="bg-card p-3 rounded-md border border-border flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date set'}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    task.status === 'complete' ? 'bg-receipts-success/10 text-receipts-success' :
                    task.status === 'in-progress' ? 'bg-receipts-blue/10 text-receipts-blue' :
                    'bg-receipts-yellow/10 text-receipts-yellow'
                  }`}>
                    {task.status.replace('-', ' ')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 bg-card rounded-md border border-border">
              <p className="text-muted-foreground">No tasks found. Add a task to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
