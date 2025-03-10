
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/components/tasks/types';
import { TaskRow } from '@/types/database.types';
import { toast } from 'sonner';

export const TaskService = {
  async fetchTasks(userId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform Supabase data to match our Task interface
      const formattedTasks: Task[] = (data as TaskRow[]).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        priority: task.priority as Task['priority'],
        status: task.status as Task['status'],
        dueDate: task.due_date ? new Date(task.due_date) : new Date(),
        dueTime: task.due_time,
        reminderSet: task.reminder_set,
        reminderTime: task.reminder_time,
        progress: task.progress,
        tags: task.tags,
        assignedTo: {
          id: userId,
          name: userId.split('@')[0] || 'User',
          initials: (userId.substring(0, 2) || 'U').toUpperCase(),
        },
      }));
      
      return formattedTasks;
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
      return [];
    }
  },

  async addTask(task: Omit<Task, 'id'>, userId: string): Promise<Task | null> {
    try {
      // Insert task into Supabase
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          due_date: task.dueDate.toISOString(),
          due_time: task.dueTime,
          reminder_set: task.reminderSet,
          reminder_time: task.reminderTime,
          progress: task.progress,
          tags: task.tags,
          user_id: userId,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Create task object with Supabase data
      const taskData = data as TaskRow;
      const newTask: Task = {
        id: taskData.id,
        title: taskData.title,
        description: taskData.description || '',
        priority: taskData.priority as Task['priority'],
        status: taskData.status as Task['status'],
        dueDate: new Date(taskData.due_date || Date.now()),
        dueTime: taskData.due_time,
        reminderSet: taskData.reminder_set,
        reminderTime: taskData.reminder_time,
        progress: taskData.progress,
        tags: taskData.tags,
        assignedTo: {
          id: userId,
          name: userId.split('@')[0] || 'User',
          initials: (userId.substring(0, 2) || 'U').toUpperCase(),
        },
      };
      
      toast.success('Task added successfully');
      return newTask;
    } catch (error: any) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
      return null;
    }
  },

  async updateTask(task: Task): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          due_date: task.dueDate.toISOString(),
          due_time: task.dueTime,
          reminder_set: task.reminderSet,
          reminder_time: task.reminderTime,
          progress: task.progress,
          tags: task.tags,
        })
        .eq('id', task.id);
      
      if (error) throw error;
      
      toast.success('Task updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      return false;
    }
  },

  async deleteTask(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Task deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      return false;
    }
  },

  async updateTaskStatus(id: string, status: Task['status']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success(`Task marked as ${status}`);
      return true;
    } catch (error: any) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
      return false;
    }
  },

  async setTaskReminder(id: string, reminderTime: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          reminder_set: true,
          reminder_time: reminderTime
        })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Reminder set successfully');
      return true;
    } catch (error: any) {
      console.error('Error setting reminder:', error);
      toast.error('Failed to set reminder');
      return false;
    }
  }
};
