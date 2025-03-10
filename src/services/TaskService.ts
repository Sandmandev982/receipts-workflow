
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskPriority, TaskStatus } from '@/components/tasks/types';
import { format } from 'date-fns';
import { NotificationService } from './NotificationService';

export class TaskService {
  static async fetchTasks(userId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(task => ({
        ...task,
        dueDate: task.due_date ? new Date(task.due_date) : null,
        dueTime: task.due_time || undefined,
        reminderSet: task.reminder_set || false,
        reminderTime: task.reminder_time || undefined,
        priority: task.priority as TaskPriority,
        status: task.status as TaskStatus,
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
          due_date: task.dueDate ? format(task.dueDate, 'yyyy-MM-dd') : null,
          due_time: task.dueTime,
          reminder_set: task.reminderSet,
          reminder_time: task.reminderTime,
          progress: task.progress,
          tags: task.tags,
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

      return {
        ...data,
        dueDate: data.due_date ? new Date(data.due_date) : null,
        dueTime: data.due_time || undefined,
        reminderSet: data.reminder_set || false,
        reminderTime: data.reminder_time || undefined,
        priority: data.priority as TaskPriority,
        status: data.status as TaskStatus,
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
          due_date: task.dueDate ? format(task.dueDate, 'yyyy-MM-dd') : null,
          due_time: task.dueTime,
          reminder_set: task.reminderSet,
          reminder_time: task.reminderTime,
          progress: task.progress,
          tags: task.tags,
        })
        .eq('id', task.id);

      if (error) throw error;

      // Get user ID for this task
      const { data: taskData } = await supabase
        .from('tasks')
        .select('user_id')
        .eq('id', task.id)
        .single();

      if (taskData) {
        // Create notification for updated task
        await NotificationService.createNotification({
          userId: taskData.user_id,
          title: 'Task Updated',
          message: `Task "${task.title}" has been updated`
        });
      }

      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      return false;
    }
  }

  static async deleteTask(id: string): Promise<boolean> {
    try {
      // First get the task to record its title for the notification
      const { data: taskData } = await supabase
        .from('tasks')
        .select('title, user_id')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (taskData) {
        // Create notification for deleted task
        await NotificationService.createNotification({
          userId: taskData.user_id,
          title: 'Task Deleted',
          message: `Task "${taskData.title}" has been deleted`
        });
      }

      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }

  static async updateTaskStatus(id: string, status: TaskStatus): Promise<boolean> {
    try {
      // Get task data first for notification
      const { data: taskData } = await supabase
        .from('tasks')
        .select('title, user_id')
        .eq('id', id)
        .single();

      // Prepare update object with status
      const updateData: any = { status };
      
      // If status is complete, add completed_at timestamp
      if (status === 'complete') {
        updateData.completed_at = new Date().toISOString();
      } else {
        // If moving from complete to another status, remove the completed_at timestamp
        updateData.completed_at = null;
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      if (taskData) {
        // Create notification for status change
        const statusMessage = status === 'complete' 
          ? `Task "${taskData.title}" has been completed` 
          : `Task "${taskData.title}" is now ${status}`;
          
        await NotificationService.createNotification({
          userId: taskData.user_id,
          title: 'Task Status Update',
          message: statusMessage
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
      // Get task data first for notification
      const { data: taskData } = await supabase
        .from('tasks')
        .select('title, user_id')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('tasks')
        .update({
          reminder_set: true,
          reminder_time: reminderTime
        })
        .eq('id', id);

      if (error) throw error;

      if (taskData) {
        // Create notification for reminder set
        await NotificationService.createNotification({
          userId: taskData.user_id,
          title: 'Reminder Set',
          message: `A reminder has been set for task "${taskData.title}"`
        });
      }

      return true;
    } catch (error) {
      console.error('Error setting task reminder:', error);
      return false;
    }
  }
}
