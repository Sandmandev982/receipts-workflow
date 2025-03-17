
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import TaskList from './TaskList';
import { Task } from './types';
import { toast } from 'sonner';
import { NotificationService } from '@/services/NotificationService';

interface TeamTasksListProps {
  teamId: string;
}

interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  avatar?: string;
  initials: string;
}

const TeamTasksList: React.FC<TeamTasksListProps> = ({ teamId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
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

      const taskIds = teamTasksData.map(item => item.task_id);
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .in('id', taskIds);

      if (tasksError) throw tasksError;

      if (tasksData) {
        const formattedTasks: Task[] = tasksData.map(task => ({
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
          teamId: teamId,
          created_at: task.created_at,
          updated_at: task.updated_at,
          completed_at: task.completed_at,
          assignedTo: task.assigned_to ? {
            id: task.assigned_to,
            name: 'Loading...',
            initials: '...'
          } : undefined
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
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('id, user_id')
        .eq('team_id', teamId);

      if (memberError) throw memberError;
      
      if (memberData && memberData.length > 0) {
        const userIds = memberData.map(member => member.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url')
          .in('id', userIds);
          
        if (profilesError) throw profilesError;
        
        const members = memberData.map(member => {
          const profile = profilesData?.find(p => p.id === member.user_id);
          return {
            id: member.user_id,
            user_id: member.user_id,
            name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unknown User',
            avatar: profile?.avatar_url || undefined,
            initials: profile ? 
              `${(profile.first_name?.[0] || '').toUpperCase()}${(profile.last_name?.[0] || '').toUpperCase()}` : 
              'UN'
          };
        });
        
        setTeamMembers(members);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to load team members');
    }
  };

  const handleAddTask = async (taskData: Omit<Task, 'id'>) => {
    if (!user) return;
    
    try {
      let assignedToUserId: string | undefined;
      
      // Handle the assignedTo - it can be a string or an object
      if (taskData.assignedTo && typeof taskData.assignedTo === 'object') {
        assignedToUserId = taskData.assignedTo.id;
      } else if (taskData.assignedTo && typeof taskData.assignedTo === 'string') {
        assignedToUserId = taskData.assignedTo;
      }
      
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
          user_id: user.id,
          team_id: teamId,
          assigned_to: assignedToUserId
        })
        .select()
        .single();

      if (taskError) throw taskError;

      const { error: teamTaskError } = await supabase
        .from('team_tasks')
        .insert({
          team_id: teamId,
          task_id: taskResult.id
        });

      if (teamTaskError) throw teamTaskError;

      if (assignedToUserId && assignedToUserId !== user.id) {
        await NotificationService.notifyTaskAssigned(
          taskResult.id,
          assignedToUserId,
          user.id,
          taskData.title
        );
      }

      fetchTeamTasks();
      toast.success('Task added to team');
    } catch (error: any) {
      console.error('Error adding team task:', error);
      toast.error(error.message || 'Failed to add task');
    }
  };

  const handleEditTask = async (task: Task) => {
    try {
      const previousTask = tasks.find(t => t.id === task.id);
      
      let assignedToUserId: string | undefined;
      
      // Handle the assignedTo - it can be a string or an object
      if (task.assignedTo && typeof task.assignedTo === 'object') {
        assignedToUserId = task.assignedTo.id;
      } else if (task.assignedTo && typeof task.assignedTo === 'string') {
        assignedToUserId = task.assignedTo;
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
          assigned_to: assignedToUserId
        })
        .eq('id', task.id);

      if (error) throw error;

      const previousAssignedId = previousTask?.assignedTo && typeof previousTask.assignedTo === 'object' 
        ? previousTask.assignedTo.id 
        : (typeof previousTask?.assignedTo === 'string' ? previousTask.assignedTo : undefined);
        
      if (assignedToUserId && previousAssignedId !== assignedToUserId && user) {
        await NotificationService.notifyTaskAssigned(
          task.id,
          assignedToUserId,
          user.id,
          task.title
        );
      }

      fetchTeamTasks();
      toast.success('Task updated');
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast.error(error.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error: teamTaskError } = await supabase
        .from('team_tasks')
        .delete()
        .eq('task_id', taskId)
        .eq('team_id', teamId);

      if (teamTaskError) throw teamTaskError;

      const { error: taskError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (taskError) throw taskError;

      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Task deleted');
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast.error(error.message || 'Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task || !user) return;

      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: newStatus,
          completed_at: newStatus === 'complete' ? new Date().toISOString() : null
        })
        .eq('id', taskId);

      if (error) throw error;

      if (newStatus === 'complete') {
        const teamMemberIds = teamMembers.map(member => member.user_id);
        await NotificationService.notifyTaskCompleted(
          taskId,
          user.id,
          task.title,
          teamId,
          teamMemberIds
        );
      }

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
