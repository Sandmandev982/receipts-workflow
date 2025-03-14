
import { Task } from '@/components/tasks/types';
import { format, subDays } from 'date-fns';

export interface TaskStatusData {
  status: string;
  count: number;
  color?: string;
}

export interface TaskPriorityData {
  priority: string;
  count: number;
  color?: string;
}

export interface TagUsageData {
  tag: string;
  count: number;
}

export interface OverdueTask {
  id: string;
  title: string;
  dueDate: Date;
  priority: string;
  daysOverdue: number;
}

export interface ProductivityScoreData {
  score: number;
  completedTasks: number;
  totalTasks: number;
  trend?: 'up' | 'down' | 'stable';
  completionRate?: number;
  averageCompletionTime?: number | null;
}

export interface TaskCompletionData {
  date: Date;
  completed: number;
  created: number;
}

export class ReportingService {
  static getTaskStatusDistribution(tasks: Task[]): TaskStatusData[] {
    const statusCounts: { [key: string]: number } = {};
    tasks.forEach(task => {
      statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
    });

    const colors: { [key: string]: string } = {
      'pending': '#FF9800',
      'in-progress': '#2196F3',
      'complete': '#4CAF50'
    };

    return Object.entries(statusCounts).map(([status, count]) => ({ 
      status, 
      count,
      color: colors[status] || '#CCCCCC'
    }));
  }

  static getTaskPriorityDistribution(tasks: Task[]): TaskPriorityData[] {
    const priorityCounts: { [key: string]: number } = {};
    tasks.forEach(task => {
      priorityCounts[task.priority] = (priorityCounts[task.priority] || 0) + 1;
    });

    const colors: { [key: string]: string } = {
      'high': '#F44336',
      'medium': '#FF9800',
      'low': '#4CAF50'
    };

    return Object.entries(priorityCounts).map(([priority, count]) => ({ 
      priority, 
      count,
      color: colors[priority] || '#CCCCCC'
    }));
  }

  static getTagUsage(tasks: Task[]): TagUsageData[] {
    const tagCounts: { [key: string]: number } = {};
    tasks.forEach(task => {
      task.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a) // Sort by count descending
      .slice(0, 5) // Take top 5
      .map(([tag, count]) => ({ tag, count }));
  }

  static getOverdueTasks(tasks: Task[]): OverdueTask[] {
    const today = new Date();
    return tasks
      .filter(task => task.dueDate && new Date(task.dueDate) < today && task.status !== 'complete')
      .map(task => {
        const dueDate = new Date(task.dueDate as Date);
        const timeDiff = today.getTime() - dueDate.getTime();
        const daysOverdue = Math.ceil(timeDiff / (1000 * 3600 * 24));

        return {
          id: task.id,
          title: task.title,
          dueDate: dueDate,
          priority: task.priority,
          daysOverdue: daysOverdue,
        };
      });
  }

  static getProductivityScore(tasks: Task[]): ProductivityScoreData {
    const completedTasks = tasks.filter(task => task.status === 'complete').length;
    const totalTasks = tasks.length;
    const score = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
    
    // Calculate completion rate
    const completionRate = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
    
    // Calculate average completion time for completed tasks
    const completedTasksWithDates = tasks.filter(
      task => task.status === 'complete' && task.completed_at && task.created_at
    );
    
    let averageCompletionTime = null;
    if (completedTasksWithDates.length > 0) {
      const totalCompletionTime = completedTasksWithDates.reduce((total, task) => {
        const createdDate = new Date(task.created_at as string);
        const completedDate = new Date(task.completed_at as string);
        const timeToComplete = (completedDate.getTime() - createdDate.getTime()) / (1000 * 3600 * 24); // in days
        return total + timeToComplete;
      }, 0);
      
      averageCompletionTime = totalCompletionTime / completedTasksWithDates.length;
    }
    
    // Determine trend (this would ideally use historical data)
    const trend: 'up' | 'down' | 'stable' = 'stable';

    return {
      score: parseFloat(score.toFixed(2)),
      completedTasks,
      totalTasks,
      trend,
      completionRate: parseFloat(completionRate.toFixed(2)),
      averageCompletionTime
    };
  }

  static getCompletionTrend(tasks: Task[]): TaskCompletionData[] {
    const today = new Date();
    const numberOfDays = 7;
    const completionData: TaskCompletionData[] = [];

    for (let i = numberOfDays - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const formattedDate = format(date, 'yyyy-MM-dd');

      const createdCount = tasks.filter(task => 
        task.created_at && format(new Date(task.created_at), 'yyyy-MM-dd') === formattedDate
      ).length;
      
      const completedCount = tasks.filter(task => 
        task.completed_at && 
        format(new Date(task.completed_at), 'yyyy-MM-dd') === formattedDate && 
        task.status === 'complete'
      ).length;

      completionData.push({
        date: new Date(formattedDate),
        completed: completedCount,
        created: createdCount,
      });
    }

    return completionData;
  }
}
