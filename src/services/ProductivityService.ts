
import { supabase } from '@/integrations/supabase/client';
import { Subtask, Milestone, DailyOutcome, WeeklyOutcome, TimerSession, Task } from '@/components/tasks/types';
import { format } from 'date-fns';
import { Json } from '@/integrations/supabase/types';

// Helper function to format dates for Supabase
const formatDateForSupabase = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

// Helper function to convert Task objects to JSON-compatible format
const tasksToJson = (tasks: Task[]): Json => {
  return tasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    progress: task.progress || 0
  })) as Json;
};

// Helper function to convert JSON data back to Task objects
const jsonToTasks = (data: Json | null): Task[] => {
  if (!data) return [];
  
  // Ensure data is an array
  const jsonArray = Array.isArray(data) ? data : [];
  
  return jsonArray.map(item => {
    // First ensure that item is an object (not a primitive value)
    if (typeof item !== 'object' || item === null) {
      return {
        id: '',
        title: '',
        description: '',
        priority: 'medium' as Task['priority'],
        status: 'pending' as Task['status'],
        dueDate: null,
        progress: 0
      };
    }
    
    // Now safely access properties with type checking
    return {
      id: String(item.id || ''),
      title: String(item.title || ''),
      description: String(item.description || ''),
      priority: (String(item.priority || 'medium') as Task['priority']),
      status: (String(item.status || 'pending') as Task['status']),
      dueDate: item.dueDate ? new Date(String(item.dueDate)) : null,
      progress: Number(item.progress || 0)
    };
  });
};

export class ProductivityService {
  // Subtasks management
  static async fetchSubtasks(parentTaskId: string): Promise<Subtask[]> {
    try {
      const { data, error } = await supabase
        .from('task_breakdowns')
        .select('*')
        .eq('parent_task_id', parentTaskId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      
      return data.map(subtask => ({
        id: subtask.id,
        parent_task_id: subtask.parent_task_id,
        title: subtask.title,
        description: subtask.description || undefined,
        status: subtask.status as 'pending' | 'in-progress' | 'complete',
        order_index: subtask.order_index,
        created_at: subtask.created_at,
        updated_at: subtask.updated_at
      }));
    } catch (error) {
      console.error('Error fetching subtasks:', error);
      return [];
    }
  }

  static async addSubtask(subtask: Omit<Subtask, 'id' | 'created_at' | 'updated_at'>): Promise<Subtask | null> {
    try {
      const { data, error } = await supabase
        .from('task_breakdowns')
        .insert({
          parent_task_id: subtask.parent_task_id,
          title: subtask.title,
          description: subtask.description,
          status: subtask.status,
          order_index: subtask.order_index
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update the parent task
      await supabase
        .from('tasks')
        .update({ has_subtasks: true })
        .eq('id', subtask.parent_task_id);
      
      return {
        id: data.id,
        parent_task_id: data.parent_task_id,
        title: data.title,
        description: data.description || undefined,
        status: data.status as 'pending' | 'in-progress' | 'complete',
        order_index: data.order_index,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error adding subtask:', error);
      return null;
    }
  }

  static async updateSubtask(subtask: Subtask): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('task_breakdowns')
        .update({
          title: subtask.title,
          description: subtask.description,
          status: subtask.status,
          order_index: subtask.order_index
        })
        .eq('id', subtask.id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating subtask:', error);
      return false;
    }
  }

  static async deleteSubtask(id: string, parentTaskId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('task_breakdowns')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Check if there are any remaining subtasks
      const { data: remainingSubtasks, error: countError } = await supabase
        .from('task_breakdowns')
        .select('id')
        .eq('parent_task_id', parentTaskId);
      
      if (countError) throw countError;
      
      // If no subtasks remain, update the parent task
      if (remainingSubtasks.length === 0) {
        await supabase
          .from('tasks')
          .update({ has_subtasks: false })
          .eq('id', parentTaskId);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting subtask:', error);
      return false;
    }
  }

  // Reverse planning milestones
  static async fetchMilestones(taskId: string): Promise<Milestone[]> {
    try {
      const { data, error } = await supabase
        .from('reverse_planning')
        .select('*')
        .eq('task_id', taskId)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      
      return data.map(milestone => ({
        id: milestone.id,
        task_id: milestone.task_id,
        milestone_title: milestone.milestone_title,
        due_date: new Date(milestone.due_date),
        description: milestone.description || undefined,
        status: milestone.status as 'pending' | 'in-progress' | 'complete',
        order_index: milestone.order_index,
        created_at: milestone.created_at,
        updated_at: milestone.updated_at
      }));
    } catch (error) {
      console.error('Error fetching milestones:', error);
      return [];
    }
  }

  static async addMilestone(milestone: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>): Promise<Milestone | null> {
    try {
      const { data, error } = await supabase
        .from('reverse_planning')
        .insert({
          task_id: milestone.task_id,
          milestone_title: milestone.milestone_title,
          due_date: formatDateForSupabase(milestone.due_date),
          description: milestone.description,
          status: milestone.status,
          order_index: milestone.order_index
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update the parent task
      await supabase
        .from('tasks')
        .update({ has_reverse_plan: true })
        .eq('id', milestone.task_id);
      
      return {
        id: data.id,
        task_id: data.task_id,
        milestone_title: data.milestone_title,
        due_date: new Date(data.due_date),
        description: data.description || undefined,
        status: data.status as 'pending' | 'in-progress' | 'complete',
        order_index: data.order_index,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error adding milestone:', error);
      return null;
    }
  }

  static async updateMilestone(milestone: Milestone): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('reverse_planning')
        .update({
          milestone_title: milestone.milestone_title,
          due_date: formatDateForSupabase(milestone.due_date),
          description: milestone.description,
          status: milestone.status,
          order_index: milestone.order_index
        })
        .eq('id', milestone.id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating milestone:', error);
      return false;
    }
  }

  static async deleteMilestone(id: string, taskId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('reverse_planning')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Check if there are any remaining milestones
      const { data: remainingMilestones, error: countError } = await supabase
        .from('reverse_planning')
        .select('id')
        .eq('task_id', taskId);
      
      if (countError) throw countError;
      
      // If no milestones remain, update the task
      if (remainingMilestones.length === 0) {
        await supabase
          .from('tasks')
          .update({ has_reverse_plan: false })
          .eq('id', taskId);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting milestone:', error);
      return false;
    }
  }

  // Daily outcomes
  static async getDailyOutcome(userId: string, date: Date): Promise<DailyOutcome | null> {
    try {
      const formattedDate = formatDateForSupabase(date);
      const { data, error } = await supabase
        .from('daily_outcomes')
        .select('*')
        .eq('user_id', userId)
        .eq('date', formattedDate)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) return null;
      
      return {
        id: data.id,
        date: new Date(data.date),
        prev_day_tasks: jsonToTasks(data.prev_day_tasks),
        today_focus: data.today_focus || [],
        accomplishments: data.accomplishments || [],
        performance_rating: data.performance_rating || 0,
        lessons_learned: data.lessons_learned,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error fetching daily outcome:', error);
      return null;
    }
  }

  static async saveDailyOutcome(userId: string, outcome: Omit<DailyOutcome, 'id' | 'created_at' | 'updated_at'>): Promise<DailyOutcome | null> {
    try {
      const formattedDate = formatDateForSupabase(outcome.date);
      
      // Convert Task[] to JSON compatible format
      const prevDayTasksJson = tasksToJson(outcome.prev_day_tasks);
      
      // Check if a record already exists for this date
      const { data: existingData, error: checkError } = await supabase
        .from('daily_outcomes')
        .select('id')
        .eq('user_id', userId)
        .eq('date', formattedDate)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      let result;
      
      if (existingData) {
        // Update existing record
        const { data, error } = await supabase
          .from('daily_outcomes')
          .update({
            prev_day_tasks: prevDayTasksJson,
            today_focus: outcome.today_focus,
            accomplishments: outcome.accomplishments,
            performance_rating: outcome.performance_rating,
            lessons_learned: outcome.lessons_learned
          })
          .eq('id', existingData.id)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('daily_outcomes')
          .insert({
            user_id: userId,
            date: formattedDate,
            prev_day_tasks: prevDayTasksJson,
            today_focus: outcome.today_focus,
            accomplishments: outcome.accomplishments,
            performance_rating: outcome.performance_rating,
            lessons_learned: outcome.lessons_learned
          })
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      }
      
      return {
        id: result.id,
        date: new Date(result.date),
        prev_day_tasks: jsonToTasks(result.prev_day_tasks),
        today_focus: result.today_focus || [],
        accomplishments: result.accomplishments || [],
        performance_rating: result.performance_rating || 0,
        lessons_learned: result.lessons_learned,
        created_at: result.created_at,
        updated_at: result.updated_at
      };
    } catch (error) {
      console.error('Error saving daily outcome:', error);
      return null;
    }
  }

  // Weekly outcomes
  static async getWeeklyOutcome(userId: string, weekStartDate: Date): Promise<WeeklyOutcome | null> {
    try {
      const formattedDate = formatDateForSupabase(weekStartDate);
      const { data, error } = await supabase
        .from('weekly_outcomes')
        .select('*')
        .eq('user_id', userId)
        .eq('week_start_date', formattedDate)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) return null;
      
      return {
        id: data.id,
        week_start_date: new Date(data.week_start_date),
        work_goals: data.work_goals || [],
        work_steps: data.work_steps || [],
        education_goals: data.education_goals || [],
        education_steps: data.education_steps || [],
        health_goals: data.health_goals || [],
        health_steps: data.health_steps || [],
        reflection: data.reflection,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error fetching weekly outcome:', error);
      return null;
    }
  }

  static async saveWeeklyOutcome(userId: string, outcome: Omit<WeeklyOutcome, 'id' | 'created_at' | 'updated_at'>): Promise<WeeklyOutcome | null> {
    try {
      const formattedDate = formatDateForSupabase(outcome.week_start_date);
      
      // Check if a record already exists for this week
      const { data: existingData, error: checkError } = await supabase
        .from('weekly_outcomes')
        .select('id')
        .eq('user_id', userId)
        .eq('week_start_date', formattedDate)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      let result;
      
      if (existingData) {
        // Update existing record
        const { data, error } = await supabase
          .from('weekly_outcomes')
          .update({
            work_goals: outcome.work_goals,
            work_steps: outcome.work_steps,
            education_goals: outcome.education_goals,
            education_steps: outcome.education_steps,
            health_goals: outcome.health_goals,
            health_steps: outcome.health_steps,
            reflection: outcome.reflection
          })
          .eq('id', existingData.id)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('weekly_outcomes')
          .insert({
            user_id: userId,
            week_start_date: formattedDate,
            work_goals: outcome.work_goals,
            work_steps: outcome.work_steps,
            education_goals: outcome.education_goals,
            education_steps: outcome.education_steps,
            health_goals: outcome.health_goals,
            health_steps: outcome.health_steps,
            reflection: outcome.reflection
          })
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      }
      
      return {
        id: result.id,
        week_start_date: new Date(result.week_start_date),
        work_goals: result.work_goals || [],
        work_steps: result.work_steps || [],
        education_goals: result.education_goals || [],
        education_steps: result.education_steps || [],
        health_goals: result.health_goals || [],
        health_steps: result.health_steps || [],
        reflection: result.reflection,
        created_at: result.created_at,
        updated_at: result.updated_at
      };
    } catch (error) {
      console.error('Error saving weekly outcome:', error);
      return null;
    }
  }

  // Timer sessions
  static async startTimerSession(userId: string, taskId?: string, workDuration: number = 50, breakDuration: number = 10): Promise<TimerSession | null> {
    try {
      const { data, error } = await supabase
        .from('timer_sessions')
        .insert({
          user_id: userId,
          task_id: taskId,
          start_time: new Date().toISOString(),
          work_duration: workDuration,
          break_duration: breakDuration
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        task_id: data.task_id,
        start_time: new Date(data.start_time),
        completed: data.completed,
        work_duration: data.work_duration,
        break_duration: data.break_duration,
        notes: data.notes,
        created_at: data.created_at
      };
    } catch (error) {
      console.error('Error starting timer session:', error);
      return null;
    }
  }

  static async completeTimerSession(sessionId: string, notes?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('timer_sessions')
        .update({
          end_time: new Date().toISOString(),
          completed: true,
          notes: notes
        })
        .eq('id', sessionId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error completing timer session:', error);
      return false;
    }
  }

  static async getRecentTimerSessions(userId: string, limit: number = 5): Promise<TimerSession[]> {
    try {
      const { data, error } = await supabase
        .from('timer_sessions')
        .select('*, tasks(id, title)')
        .eq('user_id', userId)
        .order('start_time', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      return data.map(session => ({
        id: session.id,
        task_id: session.task_id,
        start_time: new Date(session.start_time),
        end_time: session.end_time ? new Date(session.end_time) : undefined,
        completed: session.completed,
        work_duration: session.work_duration,
        break_duration: session.break_duration,
        notes: session.notes,
        created_at: session.created_at,
        task: session.tasks as Task
      }));
    } catch (error) {
      console.error('Error fetching timer sessions:', error);
      return [];
    }
  }
}
