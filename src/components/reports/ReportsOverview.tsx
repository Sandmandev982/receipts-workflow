
import React from 'react';
import { Task } from '@/components/tasks/types';
import { ReportingService } from '@/services/ReportingService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TaskDistributionChart from './TaskDistributionChart';
import CompletionTrendChart from './CompletionTrendChart';
import TopTagsChart from './TopTagsChart';
import ProductivityCard from './ProductivityCard';
import OverdueTasksList from './OverdueTasksList';

interface ReportsOverviewProps {
  tasks: Task[];
  loading: boolean;
}

const ReportsOverview: React.FC<ReportsOverviewProps> = ({ tasks, loading }) => {
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-[300px]">
              <CardHeader>
                <div className="h-7 bg-gray-200 rounded animate-pulse w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statusDistribution = ReportingService.getTaskStatusDistribution(tasks);
  const priorityDistribution = ReportingService.getTaskPriorityDistribution(tasks);
  const completionTrend = ReportingService.getCompletionTrend(tasks);
  const productivityScore = ReportingService.getProductivityScore(tasks);
  const tagUsage = ReportingService.getTagUsage(tasks);
  const overdueTasks = ReportingService.getOverdueTasks(tasks);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
      </div>

      {/* Productivity Score */}
      <div className="mb-8">
        <ProductivityCard data={productivityScore} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
        <TopTagsChart data={tagUsage} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Task Completion Trend</CardTitle>
              <CardDescription>Tasks created vs completed over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <CompletionTrendChart data={completionTrend} />
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <OverdueTasksList tasks={overdueTasks} />
        </div>
      </div>
    </div>
  );
};

export default ReportsOverview;
