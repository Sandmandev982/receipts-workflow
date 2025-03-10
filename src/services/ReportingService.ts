
import { Task, TaskPriority, TaskStatus } from '@/components/tasks/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns';

export interface TaskCompletionData {
  date: string;
  completed: number;
  created: number;
}

export interface TaskStatusDistribution {
  status: TaskStatus;
  count: number;
  color: string;
}

export interface TaskPriorityDistribution {
  priority: TaskPriority;
  count: number;
  color: string;
}

export interface TagUsageData {
  tag: string;
  count: number;
}

export interface ProductivityScore {
  score: number;
  trend: 'up' | 'down' | 'stable';
  completionRate: number;
}

export class ReportingService {
  // Get completion rate over time (for line chart)
  static getTaskCompletionTrend(tasks: Task[]): TaskCompletionData[] {
    // Get the current month's date range
    const start = startOfMonth(new Date());
    const end = new Date(); // Today
    
    // Create an array of all days in the current month until today
    const days = eachDayOfInterval({ start, end });
    
    // Initialize the result array with zeros for each day
    const result: TaskCompletionData[] = days.map(day => ({
      date: format(day, 'MMM dd'),
      completed: 0,
      created: 0
    }));
    
    // Count tasks created and completed for each day
    tasks.forEach(task => {
      const createdAt = new Date(task.created_at || new Date());
      const createdDay = format(createdAt, 'MMM dd');
      
      // Find the day in our result array
      const createdDayIndex = result.findIndex(item => item.date === createdDay);
      if (createdDayIndex !== -1) {
        result[createdDayIndex].created += 1;
      }
      
      // If task is completed, count it for the completion date
      if (task.status === 'complete' && task.completed_at) {
        const completedAt = new Date(task.completed_at);
        const completedDay = format(completedAt, 'MMM dd');
        
        // Find the day in our result array
        const completedDayIndex = result.findIndex(item => item.date === completedDay);
        if (completedDayIndex !== -1) {
          result[completedDayIndex].completed += 1;
        }
      }
    });
    
    return result;
  }
  
  // Get task distribution by status
  static getTaskStatusDistribution(tasks: Task[]): TaskStatusDistribution[] {
    const statusCounts = {
      pending: 0,
      'in-progress': 0,
      complete: 0
    };
    
    tasks.forEach(task => {
      statusCounts[task.status] += 1;
    });
    
    return [
      { status: 'pending', count: statusCounts.pending, color: '#FFC107' },
      { status: 'in-progress', count: statusCounts['in-progress'], color: '#007BFF' },
      { status: 'complete', count: statusCounts.complete, color: '#28A745' }
    ];
  }
  
  // Get task distribution by priority
  static getTaskPriorityDistribution(tasks: Task[]): TaskPriorityDistribution[] {
    const priorityCounts = {
      high: 0,
      medium: 0,
      low: 0
    };
    
    tasks.forEach(task => {
      priorityCounts[task.priority] += 1;
    });
    
    return [
      { priority: 'high', count: priorityCounts.high, color: '#DC3545' },
      { priority: 'medium', count: priorityCounts.medium, color: '#FD7E14' },
      { priority: 'low', count: priorityCounts.low, color: '#20C997' }
    ];
  }
  
  // Get most used tags
  static getTopTags(tasks: Task[], limit: number = 10): TagUsageData[] {
    const tagCounts: Record<string, number> = {};
    
    tasks.forEach(task => {
      if (task.tags) {
        task.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
  
  // Calculate productivity score (simplified)
  static getProductivityScore(tasks: Task[]): ProductivityScore {
    const totalTasks = tasks.length;
    if (totalTasks === 0) {
      return { score: 0, trend: 'stable', completionRate: 0 };
    }
    
    const completedTasks = tasks.filter(task => task.status === 'complete').length;
    const completionRate = (completedTasks / totalTasks) * 100;
    
    // Check for trend (simplified - just using task completion rate)
    // In a real app, you would compare with previous periods
    const trend: 'up' | 'down' | 'stable' = 
      completionRate >= 70 ? 'up' : 
      completionRate <= 30 ? 'down' : 
      'stable';
    
    // Calculate score (simplified)
    const score = Math.round(completionRate);
    
    return {
      score,
      trend,
      completionRate
    };
  }
  
  // Get tasks overdue
  static getOverdueTasks(tasks: Task[]): Task[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return tasks.filter(task => {
      return task.status !== 'complete' && 
        task.dueDate && 
        new Date(task.dueDate) < today;
    });
  }
}
