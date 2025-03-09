
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import TaskList from './TaskList';
import { Task } from './types';
import { Skeleton } from '@/components/ui/skeleton';

interface Team {
  id: string;
  name: string;
}

interface TeamTasksListProps {
  teamId?: string;
}

const TeamTasksList: React.FC<TeamTasksListProps> = ({ teamId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>(teamId);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserTeams();
    }
  }, [user]);

  useEffect(() => {
    if (selectedTeamId) {
      fetchTeamTasks(selectedTeamId);
    }
  }, [selectedTeamId]);

  const fetchUserTeams = async () => {
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user?.id);

      if (memberError) throw memberError;

      if (memberData && memberData.length > 0) {
        const teamIds = memberData.map(item => item.team_id);
        
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('id, name')
          .in('id', teamIds);

        if (teamsError) throw teamsError;
        
        setTeams(teamsData || []);
        
        // Set first team as selected if no teamId was provided
        if (!selectedTeamId && teamsData && teamsData.length > 0) {
          setSelectedTeamId(teamsData[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Error loading teams",
        description: "Could not load your teams. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchTeamTasks = async (teamId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          team_tasks!inner(team_id)
        `)
        .eq('team_tasks.team_id', teamId);

      if (error) throw error;

      const formattedTasks: Task[] = (data || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        priority: task.priority as Task['priority'],
        status: task.status as Task['status'],
        dueDate: new Date(task.due_date),
        dueTime: task.due_time || undefined,
        reminderSet: task.reminder_set || false,
        reminderTime: task.reminder_time || undefined,
        progress: task.progress || 0,
        tags: task.tags || [],
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching team tasks:', error);
      toast({
        title: "Error loading tasks",
        description: "Could not load team tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (task: Omit<Task, 'id'>) => {
    if (!selectedTeamId) return;
    
    try {
      // Add task to tasks table
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .insert([{
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          due_date: task.dueDate,
          due_time: task.dueTime,
          reminder_set: task.reminderSet,
          reminder_time: task.reminderTime,
          progress: task.progress,
          tags: task.tags,
          user_id: user?.id,
        }])
        .select();

      if (taskError) throw taskError;
      
      if (taskData && taskData[0]) {
        // Link task to team
        const { error: teamTaskError } = await supabase
          .from('team_tasks')
          .insert([{
            task_id: taskData[0].id,
            team_id: selectedTeamId,
          }]);

        if (teamTaskError) throw teamTaskError;

        // Add to local state
        const newTask: Task = {
          id: taskData[0].id,
          title: taskData[0].title,
          description: taskData[0].description || '',
          priority: taskData[0].priority as Task['priority'],
          status: taskData[0].status as Task['status'],
          dueDate: new Date(taskData[0].due_date),
          dueTime: taskData[0].due_time || undefined,
          reminderSet: taskData[0].reminder_set || false,
          reminderTime: taskData[0].reminder_time || undefined,
          progress: taskData[0].progress || 0,
          tags: taskData[0].tags || [],
        };
        
        setTasks(prev => [...prev, newTask]);
      }
    } catch (error) {
      console.error('Error adding team task:', error);
      toast({
        title: "Error adding task",
        description: "Could not add task to team. Please try again.",
        variant: "destructive",
      });
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
          due_date: task.dueDate,
          due_time: task.dueTime,
          reminder_set: task.reminderSet,
          reminder_time: task.reminderTime,
          progress: task.progress,
          tags: task.tags,
        })
        .eq('id', task.id);

      if (error) throw error;

      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    } catch (error) {
      console.error('Error updating team task:', error);
      toast({
        title: "Error updating task",
        description: "Could not update team task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      // Delete the team_tasks association first
      const { error: teamTaskError } = await supabase
        .from('team_tasks')
        .delete()
        .eq('task_id', id);

      if (teamTaskError) throw teamTaskError;

      // Then delete the task
      const { error: taskError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (taskError) throw taskError;

      setTasks(prev => prev.filter(task => task.id !== id));
      
      toast({
        title: "Task deleted",
        description: "The task has been removed from this team."
      });
    } catch (error) {
      console.error('Error deleting team task:', error);
      toast({
        title: "Error deleting task",
        description: "Could not delete team task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (id: string, status: Task['status']) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, status } : task
      ));
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error updating task",
        description: "Could not update task status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSetReminder = async (id: string, reminderTime: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          reminder_set: true,
          reminder_time: reminderTime
        })
        .eq('id', id);

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, reminderSet: true, reminderTime } : task
      ));
      
      toast({
        title: "Reminder set",
        description: `You'll be reminded ${reminderTime} before the task is due.`
      });
    } catch (error) {
      console.error('Error setting reminder:', error);
      toast({
        title: "Error setting reminder",
        description: "Could not set reminder. Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectedTeam = teams.find(team => team.id === selectedTeamId);

  if (teams.length === 0) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">No Teams Available</h2>
        <p className="text-muted-foreground mb-4">You're not a member of any teams yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      ) : (
        <TaskList
          title={`${selectedTeam?.name || 'Team'} Tasks`}
          tasks={tasks}
          onAddTask={handleAddTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onStatusChange={handleStatusChange}
          onSetReminder={handleSetReminder}
          loading={loading}
        />
      )}
    </div>
  );
};

export default TeamTasksList;
