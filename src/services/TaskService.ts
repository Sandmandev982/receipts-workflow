
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskStatus } from '@/components/tasks/types';
import { format } from 'date-fns';
import { NotificationService } from './NotificationService';
import { scheduleTaskReminder } from '@/lib/api';

export class TaskService {
  static async fetchTasks(userId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (!data) return [];
      
      return data.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        priority: task.priority as Task['priority'],
        status: task.status as Task['status'],
        dueDate: task.due_date ? new Date(task.due_date) : null,
        dueTime: task.due_time || undefined,
        reminderSet: task.reminder_set || false,
        reminderTime: task.reminder_time || undefined,
        progress: task.progress || 0,
        tags: task.tags || [],
        created_at: task.created_at,
        completed_at: task.completed_at
      }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  static async addTask(task: Omit<Task, 'id'>, userId: string): Promise<Task | null> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          due_date: task.dueDate ? task.dueDate.toISOString() : null,
          due_time: task.dueTime,
          reminder_set: task.reminderSet,
          reminder_time: task.reminderTime,
          progress: task.progress || 0,
          tags: task.tags || [],
          user_id: userId
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Create notification for new task
      await NotificationService.createNotification({
        userId,
        title: 'New Task Created',
        message: `You've created a new task: ${task.title}`
      });
      
      // Schedule reminder if enabled
      if (task.reminderSet && task.dueDate) {
        try {
          await scheduleTaskReminder({
            ...task,
            id: data.id,
            notificationEmail: task.notificationEmail || '',
            emailNotification: task.emailNotification || false
          });
        } catch (reminderError) {
          console.error('Error scheduling reminder:', reminderError);
          // Continue even if reminder scheduling fails
        }
      }
      
      return {
        id: data.id,
        title: data.title,
        description: data.description || '',
        priority: data.priority as Task['priority'],
        status: data.status as Task['status'],
        dueDate: data.due_date ? new Date(data.due_date) : null,
        dueTime: data.due_time || undefined,
        reminderSet: data.reminder_set || false,
        reminderTime: data.reminder_time || undefined,
        progress: data.progress || 0,
        tags: data.tags || [],
        created_at: data.created_at,
        completed_at: data.completed_at
      };
    } catch (error) {
      console.error('Error adding task:', error);
      return null;
    }
  }

  static async updateTask(task: Task): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          due_date: task.dueDate ? task.dueDate.toISOString() : null,
          due_time: task.dueTime,
          reminder_set: task.reminderSet,
          reminder_time: task.reminderTime,
          progress: task.progress,
          tags: task.tags
        })
        .eq('id', task.id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      return false;
    }
  }

  static async deleteTask(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }

  static async updateTaskStatus(id: string, status: TaskStatus): Promise<boolean> {
    try {
      // Get the current task to compare status
      const { data: currentTask, error: fetchError } = await supabase
        .from('tasks')
        .select('status, user_id, title')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Data to update
      const updateData: Record<string, any> = { status };
      
      // If task is being marked as complete, set completed_at
      if (status === 'complete' && currentTask.status !== 'complete') {
        updateData.completed_at = new Date().toISOString();
      } 
      // If task is being moved from complete to another status, clear completed_at
      else if (status !== 'complete' && currentTask.status === 'complete') {
        updateData.completed_at = null;
      }
      
      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      
      // Create notification for status change if status actually changed
      if (currentTask && currentTask.status !== status) {
        await NotificationService.createNotification({
          userId: currentTask.user_id,
          title: `Task ${status === 'complete' ? 'Completed' : 'Status Updated'}`,
          message: `"${currentTask.title}" is now ${status === 'complete' ? 'completed' : status}`
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error updating task status:', error);
      return false;
    }
  }

  static async setTaskReminder(id: string, reminderTime: string): Promise<boolean> {
    try {
      // First update the task in the database
      const { data, error } = await supabase
        .from('tasks')
        .update({
          reminder_set: true,
          reminder_time: reminderTime
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Schedule the reminder
      if (data) {
        const task: Task = {
          id: data.id,
          title: data.title,
          description: data.description || '',
          priority: data.priority as Task['priority'],
          status: data.status as Task['status'],
          dueDate: data.due_date ? new Date(data.due_date) : null,
          dueTime: data.due_time || undefined,
          reminderSet: true,
          reminderTime: reminderTime,
          emailNotification: true, // Assuming we want email notification
          notificationEmail: '', // This would need to be retrieved from the user profile
          progress: data.progress || 0,
          tags: data.tags || []
        };
        
        try {
          await scheduleTaskReminder(task);
        } catch (reminderError) {
          console.error('Error scheduling reminder:', reminderError);
          // Continue even if reminder scheduling fails
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error setting task reminder:', error);
      return false;
    }
  }
}
