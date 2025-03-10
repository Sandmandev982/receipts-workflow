
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import TaskList from './TaskList';
import { Task } from './types';
import { toast } from 'sonner';

interface TeamTasksListProps {
  teamId: string;
}

const TeamTasksList: React.FC<TeamTasksListProps> = ({ teamId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (teamId) {
      fetchTeamTasks();
      fetchTeamMembers();
    }
  }, [teamId]);

  const fetchTeamTasks = async () => {
    setLoading(true);
    try {
      // Get all task IDs associated with this team
      const { data: teamTasksData, error: teamTasksError } = await supabase
        .from('team_tasks')
        .select('task_id')
        .eq('team_id', teamId);

      if (teamTasksError) throw teamTasksError;

      if (!teamTasksData || teamTasksData.length === 0) {
        setTasks([]);
        setLoading(false);
        return;
      }

      // Get the actual tasks
      const taskIds = teamTasksData.map(item => item.task_id);
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .in('id', taskIds);

      if (tasksError) throw tasksError;

      if (tasksData) {
        // Convert the data to our Task type
        const formattedTasks: Task[] = tasksData.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          priority: task.priority as Task['priority'],
          status: task.status as Task['status'],
          dueDate: task.due_date ? new Date(task.due_date) : new Date(),
          dueTime: task.due_time || undefined,
          reminderSet: task.reminder_set || false,
          reminderTime: task.reminder_time || undefined,
          progress: task.progress || 0,
          tags: task.tags || [],
          teamId: teamId
        }));
        
        setTasks(formattedTasks);
      }
    } catch (error) {
      console.error('Error fetching team tasks:', error);
      toast.error('Failed to load team tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          id,
          user_id,
          profiles:profiles(
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('team_id', teamId);

      if (error) throw error;

      if (data) {
        const members = data.map(member => ({
          id: member.user_id,
          name: `${member.profiles?.first_name || ''} ${member.profiles?.last_name || ''}`.trim() || 'Unknown User',
          avatar: member.profiles?.avatar_url || null,
          initials: `${(member.profiles?.first_name?.[0] || '').toUpperCase()}${(member.profiles?.last_name?.[0] || '').toUpperCase()}`
        }));
        
        setTeamMembers(members);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleAddTask = async (taskData: Omit<Task, 'id'>) => {
    if (!user) return;
    
    try {
      // First create the task
      const { data: taskResult, error: taskError } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          status: taskData.status,
          due_date: taskData.dueDate ? taskData.dueDate.toISOString() : null,
          due_time: taskData.dueTime,
          reminder_set: taskData.reminderSet,
          reminder_time: taskData.reminderTime,
          progress: taskData.progress,
          tags: taskData.tags,
          user_id: user.id
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // Then associate it with the team
      const { error: teamTaskError } = await supabase
        .from('team_tasks')
        .insert({
          team_id: teamId,
          task_id: taskResult.id
        });

      if (teamTaskError) throw teamTaskError;

      // Refresh the task list
      fetchTeamTasks();
      toast.success('Task added to team');
    } catch (error: any) {
      console.error('Error adding team task:', error);
      toast.error(error.message || 'Failed to add task');
    }
  };

  const handleEditTask = async (task: Task) => {
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

      // Refresh the task list
      fetchTeamTasks();
      toast.success('Task updated');
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast.error(error.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      // First remove the team association
      const { error: teamTaskError } = await supabase
        .from('team_tasks')
        .delete()
        .eq('task_id', taskId)
        .eq('team_id', teamId);

      if (teamTaskError) throw teamTaskError;

      // Then delete the task itself
      const { error: taskError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (taskError) throw taskError;

      // Update the UI
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Task deleted');
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast.error(error.message || 'Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      // Update the UI
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      
      toast.success(`Task marked as ${newStatus}`);
    } catch (error: any) {
      console.error('Error updating task status:', error);
      toast.error(error.message || 'Failed to update task status');
    }
  };

  return (
    <TaskList
      title="Team Tasks"
      tasks={tasks}
      onAddTask={handleAddTask}
      onEditTask={handleEditTask}
      onDeleteTask={handleDeleteTask}
      onStatusChange={handleStatusChange}
      loading={loading}
      teamMembers={teamMembers}
    />
  );
};

export default TeamTasksList;
