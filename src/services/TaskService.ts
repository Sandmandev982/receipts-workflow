import { supabase } from '@/integrations/supabase/client';
import { Task, TaskStatus } from '@/components/tasks/types';
import { format } from 'date-fns';
import { NotificationService } from './NotificationService';
import { scheduleTaskReminder } from '@/lib/api';

export class TaskService {
  static async fetchTasks(userId: string): Promise<Task[]> {
    try {
      // Check if the tasks table has the assigned_to column
      const { data: columnCheck, error: columnError } = await supabase
        .from('tasks')
        .select('assigned_to')
        .limit(1);
      
      // If the column doesn't exist, log a warning but continue
      if (columnError && columnError.message.includes("column 'assigned_to' does not exist")) {
        console.warn('Warning: assigned_to column is missing from tasks table');
      }

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
        updated_at: task.updated_at,
        completed_at: task.completed_at,
        teamId: task.team_id,
        specific: task.specific,
        measurable: task.measurable,
        achievable: task.achievable,
        relevant: task.relevant,
        time_bound: task.time_bound,
        start_date: task.start_date ? new Date(task.start_date) : undefined,
        has_subtasks: task.has_subtasks,
        has_reverse_plan: task.has_reverse_plan,
        expected_outcome: task.expected_outcome,
        metrics: task.metrics,
        resources_needed: task.resources_needed,
        obstacles: task.obstacles,
        dependencies: task.dependencies,
        assignedTo: task.assigned_to
      }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  static async fetchTeamTasks(teamId: string): Promise<Task[]> {
    try {
      // First get all task ids associated with this team
      const { data: teamTasksData, error: teamTasksError } = await supabase
        .from('team_tasks')
        .select('task_id')
        .eq('team_id', teamId);
        
      if (teamTasksError) throw teamTasksError;
      
      if (!teamTasksData || teamTasksData.length === 0) return [];
      
      // Now fetch the actual tasks
      const taskIds = teamTasksData.map(item => item.task_id);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .in('id', taskIds);
        
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
        completed_at: task.completed_at,
        teamId
      }));
    } catch (error) {
      console.error('Error fetching team tasks:', error);
      return [];
    }
  }

  static async addTask(task: Omit<Task, 'id'>, userId: string): Promise<Task | null> {
    try {
      // Check if the tasks table has the assigned_to column
      const { data: columnCheck, error: columnError } = await supabase
        .from('tasks')
        .select('assigned_to')
        .limit(1);
      
      // If the column doesn't exist, log a warning but continue
      if (columnError && columnError.message.includes("column 'assigned_to' does not exist")) {
        console.warn('Warning: assigned_to column is missing from tasks table');
      }

      // Determine the assigned_to value
      let assignedToValue = null;
      if (task.assignedTo) {
        if (typeof task.assignedTo === 'object' && 'id' in task.assignedTo) {
          assignedToValue = task.assignedTo.id;
        } else {
          assignedToValue = task.assignedTo;
        }
      }

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
          user_id: userId,
          team_id: task.teamId,
          specific: task.specific,
          measurable: task.measurable,
          achievable: task.achievable,
          relevant: task.relevant,
          time_bound: task.time_bound,
          start_date: task.start_date ? task.start_date.toISOString().split('T')[0] : null,
          has_subtasks: task.has_subtasks,
          has_reverse_plan: task.has_reverse_plan,
          expected_outcome: task.expected_outcome,
          metrics: task.metrics,
          resources_needed: task.resources_needed,
          obstacles: task.obstacles,
          dependencies: task.dependencies,
          assigned_to: assignedToValue
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Create notification for new task
      await NotificationService.createNotification({
        userId,
        title: 'New Task Created',
        message: `You've created a new task: ${task.title}`,
        taskId: data.id,
        type: 'task'
      });
      
      // If assigned to a team, add to team_tasks
      if (task.teamId) {
        const { error: teamTaskError } = await supabase
          .from('team_tasks')
          .insert({
            team_id: task.teamId,
            task_id: data.id
          });
          
        if (teamTaskError) throw teamTaskError;
        
        // Notify team members
        const { data: teamMembers } = await supabase
          .from('team_members')
          .select('user_id')
          .eq('team_id', task.teamId);
          
        if (teamMembers) {
          for (const member of teamMembers) {
            if (member.user_id !== userId) {
              await NotificationService.createNotification({
                userId: member.user_id,
                title: 'New Team Task',
                message: `A new task "${task.title}" has been added to your team`,
                taskId: data.id,
                teamId: task.teamId,
                type: 'task'
              });
            }
          }
        }
      }
      
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
        updated_at: data.updated_at,
        completed_at: data.completed_at,
        teamId: data.team_id,
        specific: data.specific,
        measurable: data.measurable,
        achievable: data.achievable,
        relevant: data.relevant,
        time_bound: data.time_bound,
        start_date: data.start_date ? new Date(data.start_date) : undefined,
        has_subtasks: data.has_subtasks,
        has_reverse_plan: data.has_reverse_plan,
        expected_outcome: data.expected_outcome,
        metrics: data.metrics,
        resources_needed: data.resources_needed,
        obstacles: data.obstacles,
        dependencies: data.dependencies,
        assignedTo: data.assigned_to
      };
    } catch (error) {
      console.error('Error adding task:', error);
      return null;
    }
  }

  static async updateTask(task: Task): Promise<boolean> {
    try {
      // Determine the assigned_to value
      let assignedToValue = null;
      if (task.assignedTo) {
        if (typeof task.assignedTo === 'object' && 'id' in task.assignedTo) {
          assignedToValue = task.assignedTo.id;
        } else {
          assignedToValue = task.assignedTo;
        }
      }

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
          tags: task.tags,
          team_id: task.teamId,
          specific: task.specific,
          measurable: task.measurable,
          achievable: task.achievable,
          relevant: task.relevant,
          time_bound: task.time_bound,
          start_date: task.start_date ? task.start_date.toISOString().split('T')[0] : null,
          has_subtasks: task.has_subtasks,
          has_reverse_plan: task.has_reverse_plan,
          expected_outcome: task.expected_outcome,
          metrics: task.metrics,
          resources_needed: task.resources_needed,
          obstacles: task.obstacles,
          dependencies: task.dependencies,
          assigned_to: assignedToValue
        })
        .eq('id', task.id);
      
      if (error) throw error;
      
      // If task has been assigned to a team, add to team_tasks
      if (task.teamId) {
        // Check if task is already associated with this team
        const { data: existingTeamTask } = await supabase
          .from('team_tasks')
          .select('*')
          .eq('task_id', task.id)
          .eq('team_id', task.teamId)
          .maybeSingle();
          
        if (!existingTeamTask) {
          // Add the task to the team
          const { error: teamTaskError } = await supabase
            .from('team_tasks')
            .insert({
              team_id: task.teamId,
              task_id: task.id
            });
            
          if (teamTaskError) throw teamTaskError;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      return false;
    }
  }

  static async deleteTask(id: string): Promise<boolean> {
    try {
      // First delete any team_task associations
      const { error: teamTaskError } = await supabase
        .from('team_tasks')
        .delete()
        .eq('task_id', id);
        
      if (teamTaskError) throw teamTaskError;
      
      // Then delete the task
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
        .select('status, user_id, title, team_id')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        console.error('Error fetching task for status update:', fetchError);
        return false;
      }
      
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
      
      if (error) {
        console.error('Error updating task status:', error);
        return false;
      }
      
      // Create notification for status change if status actually changed
      if (currentTask && currentTask.status !== status) {
        await NotificationService.createNotification({
          userId: currentTask.user_id,
          title: `Task ${status === 'complete' ? 'Completed' : 'Status Updated'}`,
          message: `"${currentTask.title}" is now ${status === 'complete' ? 'completed' : status}`,
          taskId: id,
          type: 'task'
        });
        
        // If task belongs to a team and is now complete, notify team members
        if (status === 'complete' && currentTask.team_id) {
          const { data: teamMembers } = await supabase
            .from('team_members')
            .select('user_id')
            .eq('team_id', currentTask.team_id);
            
          if (teamMembers) {
            for (const member of teamMembers) {
              if (member.user_id !== currentTask.user_id) {
                await NotificationService.createNotification({
                  userId: member.user_id,
                  title: 'Team Task Completed',
                  message: `Task "${currentTask.title}" has been completed`,
                  taskId: id,
                  teamId: currentTask.team_id,
                  type: 'task'
                });
              }
            }
          }
        }
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

  static async assignTaskToUser(taskId: string, assignedToUserId: string, assignedByUserId: string): Promise<boolean> {
    try {
      // First get the task to get its title
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('title')
        .eq('id', taskId)
        .single();
        
      if (taskError) throw taskError;
      
      // Update the assigned_to field in the tasks table
      const { error } = await supabase
        .from('tasks')
        .update({ assigned_to: assignedToUserId })
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Send notification to the assigned user
      await NotificationService.notifyTaskAssigned(
        taskId, 
        assignedToUserId, 
        assignedByUserId, 
        task.title
      );
      
      return true;
    } catch (error) {
      console.error('Error assigning task:', error);
      return false;
    }
  }
}
