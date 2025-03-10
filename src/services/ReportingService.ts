
import { Task } from '@/components/tasks/types';
import { format, subDays, differenceInCalendarDays } from 'date-fns';

export interface TaskStatusDistribution {
  status: string;
  count: number;
  color: string;
}

export interface TaskPriorityDistribution {
  priority: string;
  count: number;
  color: string;
}

export interface CompletionTrendData {
  date: string;
  completed: number;
  created: number;
}

export interface ProductivityScore {
  score: number;
  trend: 'up' | 'down' | 'stable';
  completionRate: number;
  averageCompletionTime: number | null; // in days
}

export interface TagUsageData {
  tag: string;
  count: number;
}

export interface OverdueTask {
  id: string;
  title: string;
  dueDate: Date;
  daysOverdue: number;
  priority: string;
}

export class ReportingService {
  static getTaskStatusDistribution(tasks: Task[]): TaskStatusDistribution[] {
    const statusCounts: Record<string, number> = {
      'pending': 0,
      'in-progress': 0,
      'complete': 0
    };
    
    tasks.forEach(task => {
      if (statusCounts[task.status] !== undefined) {
        statusCounts[task.status]++;
      }
    });
    
    const statusColors: Record<string, string> = {
      'pending': '#FCD34D', // Yellow
      'in-progress': '#60A5FA', // Blue
      'complete': '#34D399' // Green
    };
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      color: statusColors[status]
    }));
  }
  
  static getTaskPriorityDistribution(tasks: Task[]): TaskPriorityDistribution[] {
    const priorityCounts: Record<string, number> = {
      'low': 0,
      'medium': 0,
      'high': 0
    };
    
    tasks.forEach(task => {
      if (priorityCounts[task.priority] !== undefined) {
        priorityCounts[task.priority]++;
      }
    });
    
    const priorityColors: Record<string, string> = {
      'low': '#A3E635', // Light green
      'medium': '#FBBF24', // Amber
      'high': '#EF4444' // Red
    };
    
    return Object.entries(priorityCounts).map(([priority, count]) => ({
      priority,
      count,
      color: priorityColors[priority]
    }));
  }
  
  static getCompletionTrend(tasks: Task[], days: number = 14): CompletionTrendData[] {
    const result: CompletionTrendData[] = [];
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);
    
    // Create a map for all dates in the range
    const dateMap: Record<string, CompletionTrendData> = {};
    
    for (let i = 0; i < days; i++) {
      const date = subDays(endDate, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      dateMap[dateStr] = {
        date: format(date, 'MMM dd'),
        completed: 0,
        created: 0
      };
    }
    
    // Count tasks created and completed for each date
    tasks.forEach(task => {
      const createdDate = task.created_at ? 
        format(new Date(task.created_at), 'yyyy-MM-dd') : null;
      
      const completedDate = task.completed_at ? 
        format(new Date(task.completed_at), 'yyyy-MM-dd') : null;
      
      if (createdDate && dateMap[createdDate]) {
        dateMap[createdDate].created++;
      }
      
      if (completedDate && dateMap[completedDate]) {
        dateMap[completedDate].completed++;
      }
    });
    
    // Sort dates in ascending order
    return Object.values(dateMap).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }
  
  static getProductivityScore(tasks: Task[]): ProductivityScore {
    const completedTasks = tasks.filter(task => task.status === 'complete');
    const completionRate = tasks.length > 0 ? 
      (completedTasks.length / tasks.length) * 100 : 0;
    
    // Calculate average completion time for tasks with both created_at and completed_at
    let totalCompletionDays = 0;
    let tasksWithCompletionTime = 0;
    
    completedTasks.forEach(task => {
      if (task.created_at && task.completed_at) {
        const createdDate = new Date(task.created_at);
        const completedDate = new Date(task.completed_at);
        const days = differenceInCalendarDays(completedDate, createdDate);
        if (days >= 0) { // Validate to avoid negative days
          totalCompletionDays += days;
          tasksWithCompletionTime++;
        }
      }
    });
    
    const averageCompletionTime = tasksWithCompletionTime > 0 ? 
      totalCompletionDays / tasksWithCompletionTime : null;
    
    // Calculate productivity score (0-100)
    // High completion rate and low completion time = higher score
    let score = completionRate;
    
    if (averageCompletionTime !== null) {
      // Adjust score based on completion time (lower is better)
      // If avg completion time > 7 days, start reducing the score
      const timeScore = averageCompletionTime <= 1 ? 100 :
                        averageCompletionTime <= 3 ? 80 :
                        averageCompletionTime <= 7 ? 60 : 
                        Math.max(0, 100 - (averageCompletionTime - 7) * 5);
      
      score = (score + timeScore) / 2;
    }
    
    // Determine trend (this would ideally compare to a previous period)
    // For now, we'll use a placeholder logic
    const trend: 'up' | 'down' | 'stable' = 
      score >= 70 ? 'up' : 
      score >= 40 ? 'stable' : 'down';
    
    return {
      score: Math.round(score),
      trend,
      completionRate: Math.round(completionRate),
      averageCompletionTime
    };
  }
  
  static getTagUsage(tasks: Task[]): TagUsageData[] {
    const tagCounts: Record<string, number> = {};
    
    tasks.forEach(task => {
      if (task.tags && task.tags.length > 0) {
        task.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    
    // Convert to array and sort by count (descending)
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Take top 10 tags
  }
  
  static getOverdueTasks(tasks: Task[]): OverdueTask[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return tasks
      .filter(task => 
        task.status !== 'complete' && 
        task.dueDate && 
        new Date(task.dueDate) < today
      )
      .map(task => ({
        id: task.id,
        title: task.title,
        dueDate: new Date(task.dueDate as Date),
        daysOverdue: differenceInCalendarDays(today, new Date(task.dueDate as Date)),
        priority: task.priority
      }))
      .sort((a, b) => b.daysOverdue - a.daysOverdue);
  }
}
