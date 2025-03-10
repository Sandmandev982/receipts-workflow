
import React from 'react';
import { Task } from '@/components/tasks/types';
import { ReportingService } from '@/services/ReportingService';
import CompletionTrendChart from './CompletionTrendChart';
import TaskDistributionChart from './TaskDistributionChart';
import ProductivityCard from './ProductivityCard';
import TopTagsChart from './TopTagsChart';
import OverdueTasksList from './OverdueTasksList';
import { format } from 'date-fns';

interface ReportsOverviewProps {
  tasks: Task[];
  loading: boolean;
}

const ReportsOverview: React.FC<ReportsOverviewProps> = ({ tasks, loading }) => {
  // Calculate all the reporting data
  const completionTrendData = ReportingService.getTaskCompletionTrend(tasks);
  const statusDistribution = ReportingService.getTaskStatusDistribution(tasks);
  const priorityDistribution = ReportingService.getTaskPriorityDistribution(tasks);
  const topTags = ReportingService.getTopTags(tasks, 5);
  const productivityScore = ReportingService.getProductivityScore(tasks);
  const overdueTasks = ReportingService.getOverdueTasks(tasks);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Task Reports</h1>
        <p className="text-sm text-muted-foreground">
          Data as of {format(new Date(), 'MMMM d, yyyy')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProductivityCard data={productivityScore} />
        
        <div className="col-span-1 md:col-span-2">
          <div className="grid grid-cols-2 gap-6">
            <TaskDistributionChart 
              title="Tasks by Status" 
              data={statusDistribution} 
              dataKey="status" 
            />
            <TaskDistributionChart 
              title="Tasks by Priority" 
              data={priorityDistribution} 
              dataKey="priority" 
            />
          </div>
        </div>
        
        <CompletionTrendChart data={completionTrendData} />
        
        <TopTagsChart data={topTags} />
        
        <OverdueTasksList tasks={overdueTasks} />
      </div>
    </div>
  );
};

export default ReportsOverview;
